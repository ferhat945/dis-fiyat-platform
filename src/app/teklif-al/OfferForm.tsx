"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "string",
    )
  );
}

function normalizeTurkishMobilePhone(
  value: string,
): string | null {
  let digits =
    value.replace(/\D/g, "");

  if (
    digits.startsWith("0090")
  ) {
    digits =
      digits.slice(4);
  } else if (
    digits.startsWith("90") &&
    digits.length === 12
  ) {
    digits =
      digits.slice(2);
  }

  if (
    digits.startsWith("0") &&
    digits.length === 11
  ) {
    digits =
      digits.slice(1);
  }

  if (
    !/^5\d{9}$/.test(
      digits,
    )
  ) {
    return null;
  }

  return `+90${digits}`;
}

function formatTurkishMobileInput(
  value: string,
): string {
  let digits =
    value.replace(/\D/g, "");

  if (
    digits.startsWith("0090")
  ) {
    digits =
      digits.slice(4);
  } else if (
    digits.startsWith("90")
  ) {
    digits =
      digits.slice(2);
  }

  if (
    digits.startsWith("5")
  ) {
    digits =
      `0${digits}`;
  }

  if (
    digits &&
    !digits.startsWith("0")
  ) {
    digits =
      `0${digits}`;
  }

  digits =
    digits.slice(0, 11);

  const first =
    digits.slice(0, 4);

  const second =
    digits.slice(4, 7);

  const third =
    digits.slice(7, 9);

  const fourth =
    digits.slice(9, 11);

  return [
    first,
    second,
    third,
    fourth,
  ]
    .filter(Boolean)
    .join(" ");
}

function parseStoredDentalAnalysis(
  rawValue: string,
): StoredDentalAnalysis | null {
  try {
    const parsed: unknown =
      JSON.parse(rawValue);

    if (
      !isRecord(parsed)
    ) {
      return null;
    }

    if (
      typeof parsed.createdAt !==
        "string" ||
      !isRecord(
        parsed.analysis,
      )
    ) {
      return null;
    }

    const analysis =
      parsed.analysis;

    if (
      typeof analysis.suitableImage !==
        "boolean" ||
      typeof analysis.imageQuality !==
        "string" ||
      !isStringArray(
        analysis.visibleObservations,
      ) ||
      !isStringArray(
        analysis
          .suggestedTreatmentCategories,
      ) ||
      typeof analysis.summary !==
        "string" ||
      !isStringArray(
        analysis.limitations,
      ) ||
      typeof analysis.disclaimer !==
        "string"
    ) {
      return null;
    }

    if (
      analysis.imageQuality !==
        "good" &&
      analysis.imageQuality !==
        "acceptable" &&
      analysis.imageQuality !==
        "poor"
    ) {
      return null;
    }

    return {
      createdAt:
        parsed.createdAt,

      analysis: {
        suitableImage:
          analysis.suitableImage,

        imageQuality:
          analysis.imageQuality,

        visibleObservations:
          analysis
            .visibleObservations,

        suggestedTreatmentCategories:
          analysis
            .suggestedTreatmentCategories,

        summary:
          analysis.summary,

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
    analysis
      .visibleObservations
      .length > 0
  ) {
    parts.push(
      "",
      "Fotoğrafta görülebilen genel özellikler:",
      ...analysis
        .visibleObservations
        .map(
          (item) =>
            `- ${item}`,
        ),
    );
  }

  if (
    analysis
      .suggestedTreatmentCategories
      .length > 0
  ) {
    parts.push(
      "",
      "Görüşülebilecek hizmet kategorileri:",
      ...analysis
        .suggestedTreatmentCategories
        .map(
          (item) =>
            `- ${item}`,
        ),
    );
  }

  parts.push(
    "",
    "Not: Bu metin tıbbi teşhis değildir. Kesin değerlendirme diş hekimi muayenesiyle yapılır.",
  );

  return parts
    .join("\n")
    .slice(0, 1500);
}

function combineLeadMessage(
  userMessage: string,
  analysis:
    | DentalAnalysis
    | null,
): string | undefined {
  const cleanUserMessage =
    userMessage.trim();

  if (!analysis) {
    return (
      cleanUserMessage ||
      undefined
    );
  }

  const aiText =
    formatAiAnalysisForLead(
      analysis,
    );

  const combined =
    cleanUserMessage
      ? `HASTA NOTU\n${cleanUserMessage}\n\n${aiText}`
      : aiText;

  return combined.slice(
    0,
    1950,
  );
}

export default function OfferForm({
  directClinic,
}: Props): JSX.Element {
  const [city, setCity] =
    useState<string>("");

  const [service, setService] =
    useState<string>("");

  const [
    fullName,
    setFullName,
  ] =
    useState<string>("");

  const [phone, setPhone] =
    useState<string>("");

  const [
    phoneTouched,
    setPhoneTouched,
  ] =
    useState<boolean>(false);

  const [email, setEmail] =
    useState<string>("");

  const [
    message,
    setMessage,
  ] =
    useState<string>("");

  const [
    intent,
    setIntent,
  ] =
    useState<LeadIntent>(
      "hemen",
    );

  const [
    consent,
    setConsent,
  ] =
    useState<boolean>(false);

  const [
    website,
    setWebsite,
  ] =
    useState<string>("");

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(false);

  const [ok, setOk] =
    useState<boolean>(false);

  const [err, setErr] =
    useState<string>("");

  const [
    aiAnalysis,
    setAiAnalysis,
  ] =
    useState<DentalAnalysis | null>(
      null,
    );

  const [
    aiContextLoaded,
    setAiContextLoaded,
  ] =
    useState<boolean>(false);

  const isDirect =
    Boolean(
      directClinic?.id,
    );

  const normalizedPhone =
    useMemo(
      () =>
        normalizeTurkishMobilePhone(
          phone,
        ),
      [phone],
    );

  const phoneIsValid =
    Boolean(
      normalizedPhone,
    );

  const directCities =
    useMemo(() => {
      if (!directClinic) {
        return [];
      }

      const cities =
        new Set<string>();

      for (
        const coverage of
        directClinic.coverages
      ) {
        cities.add(
          coverage.city,
        );
      }

      return Array.from(
        cities.values(),
      ).sort((a, b) =>
        a.localeCompare(b),
      );
    }, [directClinic]);

  const directServicesByCity =
    useMemo(() => {
      const map =
        new Map<
          string,
          string[]
        >();

      if (!directClinic) {
        return map;
      }

      for (
        const coverage of
        directClinic.coverages
      ) {
        const services =
          map.get(
            coverage.city,
          ) ?? [];

        if (
          !services.includes(
            coverage.service,
          )
        ) {
          services.push(
            coverage.service,
          );
        }

        map.set(
          coverage.city,
          services,
        );
      }

      for (
        const [
          key,
          services,
        ] of map
      ) {
        services.sort(
          (a, b) =>
            a.localeCompare(b),
        );

        map.set(
          key,
          services,
        );
      }

      return map;
    }, [directClinic]);

  useEffect(() => {
    if (!directClinic) {
      return;
    }

    const firstCity =
      directCities[0] ?? "";

    const services =
      firstCity
        ? directServicesByCity.get(
            firstCity,
          ) ?? []
        : [];

    const firstService =
      services[0] ?? "";

    if (firstCity) {
      setCity(
        firstCity,
      );
    }

    if (firstService) {
      setService(
        firstService,
      );
    }
  }, [
    directClinic,
    directCities,
    directServicesByCity,
  ]);

  useEffect(() => {
    let cancelled =
      false;

    async function loadAiContext(): Promise<void> {
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
          setAiContextLoaded(
            true,
          );
          return;
        }

        const storedAnalysis =
          parseStoredDentalAnalysis(
            rawValue,
          );

        if (!storedAnalysis) {
          window.sessionStorage.removeItem(
            AI_SESSION_STORAGE_KEY,
          );

          setAiContextLoaded(
            true,
          );

          return;
        }

        const createdAtMs =
          new Date(
            storedAnalysis.createdAt,
          ).getTime();

        const isExpired =
          !Number.isFinite(
            createdAtMs,
          ) ||
          Date.now() -
            createdAtMs >
            60 *
              60 *
              1000;

        if (isExpired) {
          window.sessionStorage.removeItem(
            AI_SESSION_STORAGE_KEY,
          );

          setAiContextLoaded(
            true,
          );

          return;
        }

        setAiAnalysis(
          storedAnalysis.analysis,
        );

        setAiContextLoaded(
          true,
        );
      } catch {
        setAiContextLoaded(
          true,
        );
      }
    }

    void loadAiContext();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const cityOptions =
    useMemo(() => {
      if (isDirect) {
        return directCities.map(
          (citySlug) => ({
            slug:
              citySlug,

            label:
              cityLabel(
                citySlug,
              ),
          }),
        );
      }

      return (
        CITIES as readonly string[]
      ).map(
        (citySlug) => ({
          slug:
            citySlug,

          label:
            cityLabel(
              citySlug,
            ),
        }),
      );
    }, [
      isDirect,
      directCities,
    ]);

  const serviceOptions =
    useMemo(() => {
      if (isDirect) {
        const services =
          city
            ? directServicesByCity.get(
                city,
              ) ?? []
            : [];

        return services.map(
          (serviceSlug) => ({
            slug:
              serviceSlug,

            label:
              serviceLabel(
                serviceSlug,
              ),
          }),
        );
      }

      return (
        SERVICES as readonly string[]
      ).map(
        (serviceSlug) => ({
          slug:
            serviceSlug,

          label:
            serviceLabel(
              serviceSlug,
            ),
        }),
      );
    }, [
      isDirect,
      city,
      directServicesByCity,
    ]);

  function readApiError(
    data: unknown,
  ): string | null {
    if (
      typeof data !==
        "object" ||
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
    setAiAnalysis(
      null,
    );

    try {
      window.sessionStorage.removeItem(
        AI_SESSION_STORAGE_KEY,
      );
    } catch {
      // Form çalışmaya devam eder.
    }
  }

  function handlePhoneChange(
    value: string,
  ): void {
    const formatted =
      formatTurkishMobileInput(
        value,
      );

    setPhone(
      formatted,
    );

    if (err) {
      setErr("");
    }
  }

  async function onSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setErr("");
    setOk(false);
    setPhoneTouched(
      true,
    );

    const phoneForApi =
      normalizeTurkishMobilePhone(
        phone,
      );

    if (!phoneForApi) {
      setErr(
        "Lütfen geçerli bir Türkiye cep telefonu numarası girin. Örnek: 0531 917 17 39",
      );

      return;
    }

    const leadMessage =
      combineLeadMessage(
        message,
        aiAnalysis,
      );

    const payload = {
      clinicId:
        directClinic?.id ??
        undefined,

      city:
        normalizeSlug(
          city,
        ),

      service:
        normalizeSlug(
          service,
        ),

      fullName:
        fullName.trim(),

      /*
       * Frontend tarafında +90 formatına
       * normalize edilir.
       *
       * API aynı numarayı tekrar doğrular.
       */
      phone:
        phoneForApi,

      email:
        email.trim() ||
        undefined,

      message:
        leadMessage,

      intent,

      source:
        aiAnalysis
          ? "ai_dental"
          : isDirect
            ? "clinic_direct_form"
            : "web",

      website,

      consent,

      consentTextVersion:
        aiAnalysis
          ? "v1-ai-dental"
          : "v1",

      when:
        intent,
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

    if (
      !payload.fullName
    ) {
      setErr(
        "Ad Soyad zorunlu.",
      );

      return;
    }

    if (!consent) {
      setErr(
        "KVKK onayı olmadan form gönderilemez.",
      );

      return;
    }

    setLoading(
      true,
    );

    try {
      const response =
        await fetch(
          "/api/leads",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const data: unknown =
        await response
          .json()
          .catch(
            () => ({}),
          );

      if (
        !response.ok
      ) {
        const errorMessage =
          readApiError(
            data,
          ) ??
          "Gönderim başarısız. Lütfen tekrar dene.";

        throw new Error(
          errorMessage,
        );
      }

      setOk(true);

      setFullName("");
      setPhone("");
      setPhoneTouched(false);
      setEmail("");
      setMessage("");
      setIntent("hemen");
      setConsent(false);
      setWebsite("");

      if (aiAnalysis) {
        setAiAnalysis(
          null,
        );

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
    } catch (
      caughtError: unknown
    ) {
      setErr(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Beklenmeyen hata oluştu.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  return (
    <>
      {ok ? (
        <div
          className={
            styles.alertOk
          }
        >
          Form alındı ✅{" "}
          {isDirect
            ? "Seçtiğiniz kliniğe iletildi."
            : "Uygun klinikler en kısa sürede iletişime geçecek."}
        </div>
      ) : null}

      {err ? (
        <div
          className={
            styles.alertErr
          }
        >
          {err}
        </div>
      ) : null}

      {aiContextLoaded &&
      aiAnalysis ? (
        <div
          className={
            styles.aiContext
          }
        >
          <div
            className={
              styles.aiContextTop
            }
          >
            <div>
              <strong
                className={
                  styles.aiContextTitle
                }
              >
                ✨ AI ön değerlendirmeniz forma eklendi
              </strong>

              <p
                className={
                  styles.aiContextText
                }
              >
                {
                  aiAnalysis.summary
                }
              </p>
            </div>

            <button
              type="button"
              onClick={
                removeAiAnalysis
              }
              disabled={
                loading
              }
              className={
                styles.aiContextRemove
              }
            >
              Kaldır
            </button>
          </div>

          <div
            className={
              styles.aiContextNote
            }
          >
            Fotoğraf kliniklere gönderilmez. Yalnızca
            yukarıdaki metinsel özet teklif talebine
            eklenir.
          </div>
        </div>
      ) : null}

      <form
        className={
          styles.form
        }
        onSubmit={onSubmit}
      >
        <div
          className={
            styles.hp
          }
          aria-hidden
        >
          <label htmlFor="website">
            Website
          </label>

          <input
            id="website"
            name="website"
            className={
              styles.input
            }
            value={
              website
            }
            onChange={(
              event,
            ) =>
              setWebsite(
                event.target
                  .value,
              )
            }
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <div
          className={
            styles.grid2
          }
        >
          <div
            className={
              styles.field
            }
          >
            <label htmlFor="city">
              Şehir
            </label>

            <select
              id="city"
              className={
                styles.select
              }
              value={city}
              onChange={(
                event,
              ) => {
                const nextCity =
                  event.target
                    .value;

                setCity(
                  nextCity,
                );

                if (
                  isDirect
                ) {
                  const nextServices =
                    directServicesByCity.get(
                      nextCity,
                    ) ?? [];

                  setService(
                    nextServices[0] ??
                      "",
                  );
                }
              }}
              disabled={
                isDirect &&
                cityOptions.length <=
                  1
              }
            >
              <option value="">
                {isDirect
                  ? "Şehir"
                  : "Şehir seç"}
              </option>

              {cityOptions.map(
                (
                  cityOption,
                ) => (
                  <option
                    key={
                      cityOption.slug
                    }
                    value={
                      cityOption.slug
                    }
                  >
                    {
                      cityOption.label
                    }
                  </option>
                ),
              )}
            </select>

            {isDirect ? (
              <div
                className={
                  styles.help
                }
              >
                Bu form, seçtiğiniz kliniğin şehirlerine
                göre gönderilir.
              </div>
            ) : null}
          </div>

          <div
            className={
              styles.field
            }
          >
            <label htmlFor="service">
              İşlem
            </label>

            <select
              id="service"
              className={
                styles.select
              }
              value={
                service
              }
              onChange={(
                event,
              ) =>
                setService(
                  event.target
                    .value,
                )
              }
              disabled={
                isDirect &&
                serviceOptions.length <=
                  1
              }
            >
              <option value="">
                {isDirect
                  ? "İşlem"
                  : "İşlem seç"}
              </option>

              {serviceOptions.map(
                (
                  serviceOption,
                ) => (
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
                className={
                  styles.help
                }
              >
                Bu form sadece seçtiğiniz kliniğe
                iletilir.
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={
            styles.grid2
          }
        >
          <div
            className={
              styles.field
            }
          >
            <label htmlFor="fullName">
              Ad Soyad
            </label>

            <input
              id="fullName"
              className={
                styles.input
              }
              value={
                fullName
              }
              onChange={(
                event,
              ) =>
                setFullName(
                  event.target
                    .value,
                )
              }
              placeholder="Ad Soyad"
              autoComplete="name"
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label htmlFor="phone">
              Cep Telefonu
            </label>

            <input
              id="phone"
              name="phone"
              className={
                styles.input
              }
              value={
                phone
              }
              onChange={(
                event,
              ) =>
                handlePhoneChange(
                  event.target
                    .value,
                )
              }
              onBlur={() =>
                setPhoneTouched(
                  true,
                )
              }
              placeholder="05xx xxx xx xx"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={14}
              aria-invalid={
                phoneTouched &&
                !phoneIsValid
              }
              aria-describedby="phone-help"
            />

            <div
              id="phone-help"
              className={
                styles.help
              }
              style={
                phoneTouched &&
                phone &&
                !phoneIsValid
                  ? {
                      color:
                        "#b91c1c",

                      fontWeight:
                        850,
                    }
                  : phoneIsValid
                    ? {
                        color:
                          "#15803d",

                        fontWeight:
                          850,
                      }
                    : undefined
              }
            >
              {phoneTouched &&
              phone &&
              !phoneIsValid
                ? "Geçerli bir Türkiye cep telefonu numarası girin. Örnek: 0531 917 17 39"
                : phoneIsValid
                  ? "✓ Cep telefonu formatı geçerli."
                  : "Kliniklerin size ulaşabilmesi için aktif cep telefonu numaranızı girin."}
            </div>
          </div>
        </div>

        <div
          className={
            styles.grid2
          }
        >
          <div
            className={
              styles.field
            }
          >
            <label htmlFor="email">
              E-posta (opsiyonel)
            </label>

            <input
              id="email"
              className={
                styles.input
              }
              value={
                email
              }
              onChange={(
                event,
              ) =>
                setEmail(
                  event.target
                    .value,
                )
              }
              placeholder="ornek@mail.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label htmlFor="intent">
              Ne zaman düşünüyorsunuz?
            </label>

            <select
              id="intent"
              className={
                styles.select
              }
              value={
                intent
              }
              onChange={(
                event,
              ) =>
                setIntent(
                  event.target
                    .value as LeadIntent,
                )
              }
            >
              {INTENT_OPTIONS.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div
          className={
            styles.field
          }
        >
          <label htmlFor="message">
            Not (opsiyonel)
          </label>

          <input
            id="message"
            className={
              styles.input
            }
            value={
              message
            }
            onChange={(
              event,
            ) =>
              setMessage(
                event.target
                  .value,
              )
            }
            placeholder="Örn: akşam arayın / üst çene / korkum var..."
          />

          {aiAnalysis ? (
            <div
              className={
                styles.help
              }
            >
              Kendi notunuz, AI özetiyle birlikte
              kliniğe iletilir.
            </div>
          ) : null}
        </div>

        <label
          className={
            styles.kvkkRow
          }
        >
          <input
            type="checkbox"
            checked={
              consent
            }
            onChange={(
              event,
            ) =>
              setConsent(
                event.target
                  .checked,
              )
            }
          />

          <span>
            KVKK aydınlatma metnini okudum ve iletişime
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

        <div
          className={
            styles.btnRow
          }
        >
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="submit"
            disabled={
              loading
            }
          >
            {loading
              ? "Teklifiniz gönderiliyor..."
              : "Ücretsiz Teklifimi Gönder →"}
          </button>

          <Link
            className={`${styles.btn} ${styles.btnSoft}`}
            href="/sehir"
          >
            Şehirleri Gör
          </Link>
        </div>

        <div
          className={
            styles.trustRow
          }
          aria-label="Teklif formu özellikleri"
        >
          <span>
            ✓ Ücretsiz
          </span>

          <span>
            🛡️ KVKK onaylı
          </span>

          <span>
            🦷 Fotoğraf gerekmez
          </span>

          <span>
            📞 Hızlı geri dönüş
          </span>
        </div>
      </form>
    </>
  );
}