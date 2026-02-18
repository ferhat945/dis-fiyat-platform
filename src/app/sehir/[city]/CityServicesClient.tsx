"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SERVICES, cityLabel, isKnownCity, normalizeSlug, serviceLabel } from "@/lib/seo-data";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type Props = {
  citySlug: string;
};

function normalizeForSearch(v: string): string {
  return (v ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .trim();
}

export default function CityServicesClient({ citySlug }: Props): JSX.Element {
  const safeCitySlug = normalizeSlug(citySlug);
  const ok = isKnownCity(safeCitySlug);

  const cityName = cityLabel(safeCitySlug);

  const items = useMemo(() => {
    const icons: Record<string, string> = {
      implant: "🦷",
      zirkonyum: "✨",
      lamina: "😁",
      ortodonti: "🧩",
      "dis-beyazlatma": "💎",
      "dis-tasi-temizligi": "🫧",
      "kanal-tedavisi": "🩺",
      dolgu: "🧱",
      kaplama: "🛡️",
    };

    return SERVICES.map((s) => ({
      slug: s,
      title: serviceLabel(s),
      href: `/sehir/${safeCitySlug}/${s}`,
      subtitle: `${cityName} için teklif al →`,
      icon: icons[s] ?? "✅",
    }));
  }, [safeCitySlug, cityName]);

  const [q, setQ] = useState<string>("");

  const filtered = useMemo(() => {
    const needle = normalizeForSearch(q);
    if (!needle) return items;

    return items.filter((x) => {
      const a = normalizeForSearch(x.title);
      const b = normalizeForSearch(x.slug);
      return a.includes(needle) || b.includes(needle);
    });
  }, [items, q]);

  return (
    <main className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.kickerRow}>
            <span className={styles.kicker}>Şehir</span>
            <span className={`${styles.kicker} ${styles.kickerSoft}`}>KVKK Onaylı</span>
            <span className={`${styles.kicker} ${styles.kickerSoft}`}>Ücretsiz</span>
          </div>

          <h1 className={styles.title}>{cityName} için hizmet seç</h1>
          <p className={styles.desc}>
            Hizmeti seç → KVKK onaylı formu doldur → uygun klinikler seninle iletişime geçsin.
          </p>

          {!ok ? (
            <div
              style={{
                marginTop: 10,
                border: "1px solid rgba(245,158,11,0.35)",
                background: "rgba(245,158,11,0.10)",
                borderRadius: 14,
                padding: "10px 12px",
                fontWeight: 800,
                fontSize: 13,
                color: "rgba(120,53,15,0.95)",
              }}
            >
              Bu şehir sistem listesinde yok gibi görünüyor ama sayfayı yine de açtım. (SEO için noindex)
            </div>
          ) : null}

          <div className={styles.actions}>
            <Link href="/sehir" className={styles.btn}>
              Şehirler
            </Link>

            {/* ✅ Sende liste sayfası /hizmetler */}
            <Link href="/hizmetler" className={styles.btn}>
              Hizmetler
            </Link>

            <Link href="/teklif-al" className={`${styles.btn} ${styles.btnPrimary}`}>
              Teklif Al
            </Link>
          </div>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.searchLabel}>Hızlı ara</div>
          <input
            className={styles.searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hizmet ara… (örn: implant, zirkonyum)"
            aria-label="Hizmet ara"
          />
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>Sonuç bulunamadı. Yazımı kontrol edip tekrar dene.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((s) => (
              <Link key={s.slug} href={s.href} className={styles.card}>
                <div className={styles.icon} aria-hidden>
                  {s.icon}
                </div>
                <div className={styles.body}>
                  <div className={styles.cardTitle}>{s.title}</div>
                  <div className={styles.cardDesc}>{s.subtitle}</div>
                </div>
                <div className={styles.arrow} aria-hidden>
                  →
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className={styles.cta}>
          <div>
            <div className={styles.ctaTitle}>Hazırsan teklif al</div>
            <div className={styles.ctaDesc}>{cityName} için bir hizmet seç, formu 30 saniyede doldur.</div>
          </div>
          <Link href="/teklif-al" className={`${styles.btn} ${styles.btnPrimary}`}>
            Teklif Al
          </Link>
        </div>
      </div>
    </main>
  );
}
