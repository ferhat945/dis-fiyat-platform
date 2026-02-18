"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CITIES, SERVICES, cityLabel, serviceLabel, normalizeSlug } from "@/lib/seo-data";
import styles from "./OfferForm.module.css";

type LeadIntent = "hemen" | "bugun" | "bu_hafta" | "bu_ay" | "bilinmiyor";

const INTENT_OPTIONS: Array<{ value: LeadIntent; label: string }> = [
  { value: "hemen", label: "Hemen" },
  { value: "bugun", label: "Bugün" },
  { value: "bu_hafta", label: "Bu hafta" },
  { value: "bu_ay", label: "Bu ay" },
  { value: "bilinmiyor", label: "Kararsızım" },
];

type ApiErrorShape = { message?: string };

export default function OfferForm(): JSX.Element {
  const [city, setCity] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [intent, setIntent] = useState<LeadIntent>("hemen");
  const [consent, setConsent] = useState<boolean>(false);

  // honeypot
  const [website, setWebsite] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [ok, setOk] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  const cityOptions = useMemo(() => {
    return (CITIES as readonly string[]).map((c) => ({ slug: c, label: cityLabel(c) }));
  }, []);

  const serviceOptions = useMemo(() => {
    return (SERVICES as readonly string[]).map((s) => ({ slug: s, label: serviceLabel(s) }));
  }, []);

  function readApiError(data: unknown): string | null {
    if (typeof data !== "object" || data === null) return null;
    const d = data as ApiErrorShape;
    return typeof d.message === "string" ? d.message : null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setErr("");
    setOk(false);

    const payload = {
      city: normalizeSlug(city),
      service: normalizeSlug(service),
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      message: message.trim() || undefined,
      intent,
      website, // honeypot
      consent: consent ? "on" : "",
      when: intent, // mevcut API'nin bekleyebileceği alan
    };

    if (!payload.city || !payload.service) {
      setErr("Lütfen şehir ve işlem seç.");
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
      setErr("KVKK onayı olmadan form gönderilemez.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = readApiError(data) ?? "Gönderim başarısız. Lütfen tekrar dene.";
        throw new Error(msg);
      }

      setOk(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setIntent("hemen");
      setConsent(false);
      setWebsite("");
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Beklenmeyen hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {ok ? <div className={styles.alertOk}>Form alındı ✅ Klinikler en kısa sürede iletişime geçecek.</div> : null}
      {err ? <div className={styles.alertErr}>{err}</div> : null}

      <form className={styles.form} onSubmit={onSubmit}>
        {/* honeypot */}
        <div className={styles.hp} aria-hidden>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            className={styles.input}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="city">Şehir</label>
            <select id="city" className={styles.select} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Şehir seç</option>
              {cityOptions.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="service">İşlem</label>
            <select id="service" className={styles.select} value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">İşlem seç</option>
              {serviceOptions.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="fullName">Ad Soyad</label>
            <input
              id="fullName"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Telefon</label>
            <input
              id="phone"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xx xxx xx xx"
              inputMode="tel"
              autoComplete="tel"
            />
            <div className={styles.help}>Örn: 05xx xxx xx xx</div>
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label htmlFor="email">E-posta (opsiyonel)</label>
            <input
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="intent">Ne zaman düşünüyorsunuz?</label>
            <select
              id="intent"
              className={styles.select}
              value={intent}
              onChange={(e) => setIntent(e.target.value as LeadIntent)}
            >
              {INTENT_OPTIONS.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="message">Not (opsiyonel)</label>
          <input
            id="message"
            className={styles.input}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Örn: akşam arayın / üst çene / korkum var..."
          />
        </div>

        <label className={styles.kvkkRow}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            KVKK aydınlatma metnini okudum ve iletişime geçilmesine onay veriyorum.{" "}
            <Link className={styles.inlineLink} href="/kvkk" target="_blank" rel="noreferrer">
              KVKK metni
            </Link>
          </span>
        </label>

        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>
          <Link className={`${styles.btn} ${styles.btnSoft}`} href="/sehir">
            Şehirleri Gör
          </Link>
        </div>
      </form>
    </>
  );
}
