"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  CITIES,
  SERVICES,
  cityLabel,
  serviceLabel,
  normalizeSlug,
} from "@/lib/seo-data";
import styles from "./OfferForm.module.css";

const AI_SESSION_STORAGE_KEY =
  "disfiyat360_ai_dental_analysis_v1";

type LeadIntent =
  | "hemen"
  | "bugun"
  | "bu_hafta"
  | "bu_ay"
  | "bilinmiyor";

const INTENT_OPTIONS: Array<{
  value: LeadIntent;
  label: string;
}> = [
  {
    value: "hemen",
    label: "Hemen",
  },
  {
    value: "bugun",
    label: "Bugün",
  },
  {
    value: "bu_hafta",
    label: "Bu hafta",
  },
  {
    value: "bu_ay",
    label: "Bu ay",
  },
  {
    value: "bilinmiyor",
    label: "Kararsızım",
  },
];

type DirectClinicData = {
  id: string;
  name: string;
  coverages: Array<{
    city: string;
    service: string;
  }>;
};

type Props = {
  directClinic?: DirectClinicData | null;
};

type ApiErrorShape = {
  message?: string;
  code?: string;
};

type ImageQuality =
  | "good"
  | "acceptable"
  | "poor";

type DentalAnalysis = {
  suitableImage: boolean;
  imageQuality: ImageQuality;
  visibleObservations: string[];
  suggestedTreatmentCategories: string[];
  summary: string;
  limitations: string[];
  disclaimer: string;
};

type StoredDentalAnalysis = {
  analysis: DentalAnalysis;
  createdAt: string;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) => typeof item === "string",
    )
  );
}

function parseStoredDentalAnalysis(
  rawValue: string,
): StoredDentalAnalysis | null {
  try {
    const parsed: unknown =
      JSON.parse(rawValue);

    if (!isRecord(parsed)) {
      return null;
    }

    if (
      typeof parsed.createdAt !== "string" ||
      !isRecord(parsed.analysis)
    ) {
      return null;
    }

    const analysis = parsed.analysis;

    if (
      typeof analysis.suitableImage !==
        "boolean" ||
      typeof analysis.imageQuality !==
        "string" ||
      !isStringArray(
        analysis.visibleObservations,
      ) ||
      !isStringArray(
        analysis.suggestedTreatmentCategories,
      ) ||
      typeof analysis.summary !== "string" ||
      !isStringArray(analysis.limitations) ||
      typeof analysis.disclaimer !== "string"
    ) {
      return null;
    }

    if (
      analysis.imageQuality !== "good" &&
      analysis.imageQuality !==
        "acceptable" &&
      analysis.imageQuality !== "poor"
    ) {
      return null;
    }

    return {
      createdAt: parsed.createdAt,

      analysis: {
        suitableImage:
          analysis.suitableImage,

        imageQuality:
          analysis.imageQuality,

        visibleObservations:
          analysis.visibleObservations,

        suggestedTreatmentCategories:
          analysis.suggestedTreatmentCategories,

        summary: analysis.summary,

        limitations:
          analysis.limitations,

        disclaimer:
          analysis.disclaimer,
      },
    };
  } catch {
    return null;
  }
}

function formatAiAnalysisForLead(
  analysis: DentalAnalysis,
): string {
  const parts: string[] = [
    "AI FOTOĞRAF ÖN DEĞERLENDİRMESİ",
    "",
    `Özet: ${analysis.summary}`,
  ];

  if (
    analysis.visibleObservations.length > 0
  ) {
    parts.push(
      "",
      "Fotoğrafta görülebilen genel özellikler:",
      ...analysis.visibleObservations.map(
        (item) => `- ${item}`,
      ),
    );
  }

  if (
    analysis.suggestedTreatmentCategories
      .length > 0
  ) {
    parts.push(
      "",
      "Görüşülebilecek hizmet kategorileri:",
      ...analysis.suggestedTreatmentCategories.map(
        (item) => `- ${item}`,
      ),
    );
  }

  parts.push(
    "",
    "Not: Bu metin tıbbi teşhis değildir. Kesin değerlendirme diş hekimi muayenesiyle yapılır.",
  );

  return parts.join("\n").slice(0, 1500);
}

function combineLeadMessage(
  userMessage: string,
  analysis: DentalAnalysis | null,
): string | undefined {
  const cleanUserMessage =
    userMessage.trim();

  if (!analysis) {
    return cleanUserMessage || undefined;
  }

  const aiText =
    formatAiAnalysisForLead(analysis);

  const combined = cleanUserMessage
    ? `HASTA NOTU\n${cleanUserMessage}\n\n${aiText}`
    : aiText;

  return combined.slice(0, 1950);
}

export default function OfferForm({
  directClinic,
}: Props): JSX.Element {
  const [city, setCity] =
    useState<string>("");

  const [service, setService] =
    useState<string>("");

  const [fullName, setFullName] =
    useState<string>("");

  const [phone, setPhone] =
    useState<string>("");

  const [email, setEmail] =
    useState<string>("");

  const [message, setMessage] =
    useState<string>("");

  const [intent, setIntent] =
    useState<LeadIntent>("hemen");

  const [consent, setConsent] =
    useState<boolean>(false);

  const [website, setWebsite] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [ok, setOk] =
    useState<boolean>(false);

  const [err, setErr] =
    useState<string>("");

  const [aiAnalysis, setAiAnalysis] =
    useState<DentalAnalysis | null>(null);

  const [aiContextLoaded, setAiContextLoaded] =
    useState<boolean>(false);

  const isDirect =
    Boolean(directClinic?.id);

  const directCities = useMemo(() => {
    if (!directClinic) {
      return [];
    }

    const cities = new Set<string>();

    for (const coverage of directClinic.coverages) {
      cities.add(coverage.city);
    }

    return Array.from(cities.values()).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [directClinic]);

  const directServicesByCity =
    useMemo(() => {
      const map =
        new Map<string, string[]>();

      if (!directClinic) {
        return map;
      }

      for (
        const coverage of directClinic.coverages
      ) {
        const services =
          map.get(coverage.city) ?? [];

        if (
          !services.includes(
            coverage.service,
          )
        ) {
          services.push(coverage.service);
        }

        map.set(
          coverage.city,
          services,
        );
      }

      for (const [key, services] of map) {
        services.sort((a, b) =>
          a.localeCompare(b),
        );

        map.set(key, services);
      }

      return map;
    }, [directClinic]);

  useEffect(() => {
    if (!directClinic) {
      return;
    }

    const firstCity =
      directCities[0] ?? "";

    const services = firstCity
      ? directServicesByCity.get(
          firstCity,
        ) ?? []
      : [];

    const firstService =
      services[0] ?? "";

    if (firstCity) {
      setCity(firstCity);
    }

    if (firstService) {
      setService(firstService);
    }
  }, [
    directClinic,
    directCities,
    directServicesByCity,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadAiContext(): Promise<void> {
      /*
        State güncellemelerini effect'in senkron
        gövdesinden ayırır.
      */
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      try {
        const rawValue =
          window.sessionStorage.getItem(
            AI_SESSION_STORAGE_KEY,
          );

        if (!rawValue) {
          setAiContextLoaded(true);
          return;
        }

        const storedAnalysis =
          parseStoredDentalAnalysis(rawValue);

        if (!storedAnalysis) {
          window.sessionStorage.removeItem(
            AI_SESSION_STORAGE_KEY,
          );

          setAiContextLoaded(true);
          return;
        }

        const createdAtMs =
          new Date(
            storedAnalysis.createdAt,
          ).getTime();

        const isExpired =
          !Number.isFinite(createdAtMs) ||
          Date.now() - createdAtMs >
            60 * 60 * 1000;

        if (isExpired) {
          window.sessionStorage.removeItem(
            AI_SESSION_STORAGE_KEY,
          );

          setAiContextLoaded(true);
          return;
        }

        setAiAnalysis(
          storedAnalysis.analysis,
        );
        setAiContextLoaded(true);
      } catch {
        setAiContextLoaded(true);
      }
    }

    void loadAiContext();

    return () => {
      cancelled = true;
    };
  }, []);

  const cityOptions = useMemo(() => {
    if (isDirect) {
      return directCities.map(
        (citySlug) => ({
          slug: citySlug,
          label: cityLabel(citySlug),
        }),
      );
    }

    return (
      CITIES as readonly string[]
    ).map((citySlug) => ({
      slug: citySlug,
      label: cityLabel(citySlug),
    }));
  }, [isDirect, directCities]);

  const serviceOptions = useMemo(() => {
    if (isDirect) {
      const services = city
        ? directServicesByCity.get(city) ??
          []
        : [];

      return services.map(
        (serviceSlug) => ({
          slug: serviceSlug,
          label:
            serviceLabel(serviceSlug),
        }),
      );
    }

    return (
      SERVICES as readonly string[]
    ).map((serviceSlug) => ({
      slug: serviceSlug,
      label:
        serviceLabel(serviceSlug),
    }));
  }, [
    isDirect,
    city,
    directServicesByCity,
  ]);

  function readApiError(
    data: unknown,
  ): string | null {
    if (
      typeof data !== "object" ||
      data === null
    ) {
      return null;
    }

    const typedData =
      data as ApiErrorShape;

    if (
      typeof typedData.message ===
        "string" &&
      typedData.message.trim()
    ) {
      return typedData.message.trim();
    }

    if (
      typeof typedData.code ===
        "string" &&
      typedData.code.trim()
    ) {
      return typedData.code.trim();
    }

    return null;
  }

  function removeAiAnalysis(): void {
    setAiAnalysis(null);

    try {
      window.sessionStorage.removeItem(
        AI_SESSION_STORAGE_KEY,
      );
    } catch {
      // Form çalışmaya devam eder.
    }
  }

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setErr("");
    setOk(false);

    const leadMessage =
      combineLeadMessage(
        message,
        aiAnalysis,
      );

    const payload = {
      clinicId:
        directClinic?.id ?? undefined,

      city: normalizeSlug(city),
      service: normalizeSlug(service),

      fullName: fullName.trim(),
      phone: phone.trim(),

      email:
        email.trim() || undefined,

      message: leadMessage,

      intent,

      source: aiAnalysis
        ? "ai_dental"
        : isDirect
          ? "clinic_direct_form"
          : "web",

      website,

      consent,

      consentTextVersion: aiAnalysis
        ? "v1-ai-dental"
        : "v1",

      when: intent,
    };

    if (
      !payload.city ||
      !payload.service
    ) {
      setErr(
        "Lütfen şehir ve işlem seç.",
      );
      return;
    }

    if (!payload.fullName) {
      setErr("Ad Soyad zorunlu.");
      return;
    }

    if (!payload.phone) {
      setErr("Telefon zorunlu.");
      return;
    }

    if (!consent) {
      setErr(
        "KVKK onayı olmadan form gönderilemez.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/leads",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data: unknown =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          readApiError(data) ??
          "Gönderim başarısız. Lütfen tekrar dene.";

        throw new Error(errorMessage);
      }

      setOk(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setIntent("hemen");
      setConsent(false);
      setWebsite("");

      if (aiAnalysis) {
        setAiAnalysis(null);

        try {
          window.sessionStorage.removeItem(
            AI_SESSION_STORAGE_KEY,
          );
        } catch {
          // Lead başarıyla oluşturuldu.
        }
      }

      if (!isDirect) {
        setCity("");
        setService("");
      }
    } catch (caughtError: unknown) {
      setErr(
        caughtError instanceof Error
          ? caughtError.message
          : "Beklenmeyen hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {ok ? (
        <div className={styles.alertOk}>
          Form alındı ✅{" "}
          {isDirect
            ? "Seçtiğiniz kliniğe iletildi."
            : "Uygun klinikler en kısa sürede iletişime geçecek."}
        </div>
      ) : null}

      {err ? (
        <div className={styles.alertErr}>
          {err}
        </div>
      ) : null}

      {aiContextLoaded && aiAnalysis ? (
        <div
          style={{
            margin: "0 0 18px",
            padding: 16,
            border:
              "1px solid rgba(102, 83, 210, 0.18)",
            borderRadius: 16,
            background:
              "linear-gradient(135deg, rgba(246,244,255,0.96), rgba(241,249,255,0.96))",
            boxShadow:
              "0 12px 28px rgba(55, 43, 110, 0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent:
                "space-between",
              gap: 12,
            }}
          >
            <div>
              <strong
                style={{
                  display: "block",
                  color: "#403c73",
                  fontSize: 14,
                  fontWeight: 900,
                }}
              >
                ✨ AI ön değerlendirmeniz
                forma eklendi
              </strong>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#67687a",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                {aiAnalysis.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={removeAiAnalysis}
              disabled={loading}
              style={{
                flex: "0 0 auto",
                padding: "7px 10px",
                border:
                  "1px solid rgba(90, 79, 172, 0.16)",
                borderRadius: 10,
                background: "#ffffff",
                color: "#6e658d",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Kaldır
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              color: "#8a8996",
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            Fotoğraf kliniklere gönderilmez.
            Yalnızca yukarıdaki metinsel özet
            teklif talebine eklenir.
          </div>
        </div>
      ) : null}

      <form
        className={styles.form}
        onSubmit={onSubmit}
      >
        <div
          className={styles.hp}
          aria-hidden
        >
          <label htmlFor="website">
            Website
          </label>

          <input
            id="website"
            name="website"
            className={styles.input}
            value={website}
            onChange={(event) =>
              setWebsite(
                event.target.value,
              )
            }
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="city">
              Şehir
            </label>

            <select
              id="city"
              className={styles.select}
              value={city}
              onChange={(event) => {
                const nextCity =
                  event.target.value;

                setCity(nextCity);

                if (isDirect) {
                  const nextServices =
                    directServicesByCity.get(
                      nextCity,
                    ) ?? [];

                  setService(
                    nextServices[0] ?? "",
                  );
                }
              }}
              disabled={
                isDirect &&
                cityOptions.length <= 1
              }
            >
              <option value="">
                {isDirect
                  ? "Şehir"
                  : "Şehir seç"}
              </option>

              {cityOptions.map(
                (cityOption) => (
                  <option
                    key={
                      cityOption.slug
                    }
                    value={
                      cityOption.slug
                    }
                  >
                    {cityOption.label}
                  </option>
                ),
              )}
            </select>

            {isDirect ? (
              <div
                className={styles.help}
              >
                Bu form, seçtiğiniz
                kliniğin şehirlerine göre
                gönderilir.
              </div>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="service">
              İşlem
            </label>

            <select
              id="service"
              className={styles.select}
              value={service}
              onChange={(event) =>
                setService(
                  event.target.value,
                )
              }
              disabled={
                isDirect &&
                serviceOptions.length <= 1
              }
            >
              <option value="">
                {isDirect
                  ? "İşlem"
                  : "İşlem seç"}
              </option>

              {serviceOptions.map(
                (serviceOption) => (
                  <option
                    key={
                      serviceOption.slug
                    }
                    value={
                      serviceOption.slug
                    }
                  >
                    {
                      serviceOption.label
                    }
                  </option>
                ),
              )}
            </select>

            {isDirect ? (
              <div
                className={styles.help}
              >
                Bu form sadece seçtiğiniz
                kliniğe iletilir.
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="fullName">
              Ad Soyad
            </label>

            <input
              id="fullName"
              className={styles.input}
              value={fullName}
              onChange={(event) =>
                setFullName(
                  event.target.value,
                )
              }
              placeholder="Ad Soyad"
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">
              Telefon
            </label>

            <input
              id="phone"
              className={styles.input}
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="05xx xxx xx xx"
              inputMode="tel"
              autoComplete="tel"
            />

            <div className={styles.help}>
              Örn: 05xx xxx xx xx
            </div>
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="email">
              E-posta (opsiyonel)
            </label>

            <input
              id="email"
              className={styles.input}
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="ornek@mail.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="intent">
              Ne zaman düşünüyorsunuz?
            </label>

            <select
              id="intent"
              className={styles.select}
              value={intent}
              onChange={(event) =>
                setIntent(
                  event.target
                    .value as LeadIntent,
                )
              }
            >
              {INTENT_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="message">
            Not (opsiyonel)
          </label>

          <input
            id="message"
            className={styles.input}
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            placeholder="Örn: akşam arayın / üst çene / korkum var..."
          />

          {aiAnalysis ? (
            <div className={styles.help}>
              Kendi notunuz, AI özetiyle
              birlikte kliniğe iletilir.
            </div>
          ) : null}
        </div>

        <label className={styles.kvkkRow}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) =>
              setConsent(
                event.target.checked,
              )
            }
          />

          <span>
            KVKK aydınlatma metnini
            okudum ve iletişime
            geçilmesine onay veriyorum.{" "}
            <Link
              className={
                styles.inlineLink
              }
              href="/kvkk"
              target="_blank"
              rel="noreferrer"
            >
              KVKK metni
            </Link>
          </span>
        </label>

        <div className={styles.btnRow}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Gönderiliyor..."
              : "Gönder"}
          </button>

          <Link
            className={`${styles.btn} ${styles.btnSoft}`}
            href="/sehir"
          >
            Şehirleri Gör
          </Link>
        </div>
      </form>
    </>
  );
}