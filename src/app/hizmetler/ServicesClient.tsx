"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SERVICES, serviceLabel } from "@/lib/seo-data";
import styles from "./page.module.css";

type ServiceItem = {
  slug: string;
  title: string;
  href: string;
  subtitle: string;
  icon: string;
};

function normalizeForSearch(v: string): string {
  return (v ?? "")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "c")
    .trim();
}

export default function ServicesClient(): JSX.Element {
  const all: ServiceItem[] = useMemo(() => {
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
      // ✅ Sende route var: src/app/hizmet/[service]/page.tsx
      href: `/hizmet/${s}`,
      subtitle: "Şehir seçip teklif al →",
      icon: icons[s] ?? "✅",
    }));
  }, []);

  const [q, setQ] = useState<string>("");

  const filtered = useMemo(() => {
    const needle = normalizeForSearch(q);
    if (!needle) return all;

    return all.filter((x) => {
      const a = normalizeForSearch(x.title);
      const b = normalizeForSearch(x.slug);
      return a.includes(needle) || b.includes(needle);
    });
  }, [all, q]);

  return (
    <main className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.kickerRow}>
            <span className={styles.kicker}>Hizmetler</span>
            <span className={`${styles.kicker} ${styles.kickerSoft}`}>KVKK Onaylı</span>
            <span className={`${styles.kicker} ${styles.kickerSoft}`}>Ücretsiz</span>
          </div>

          <h1 className={styles.title}>İşlemini seç</h1>
          <p className={styles.desc}>
            Hizmeti seç → şehir seç → KVKK onaylı form ile kliniklerden teklif al.{" "}
            <strong>Kesin fiyat muayene sonrası netleşir.</strong>
          </p>

          <div className={styles.actions}>
            <Link href="/sehir" className={styles.btn}>
              Şehirler
            </Link>
            <Link href="/teklif-al" className={`${styles.btn} ${styles.btnPrimary}`}>
              Teklif Al
            </Link>
          </div>
        </div>

        <div className={styles.toolsRow}>
          <div className={styles.searchCard}>
            <div className={styles.searchLabel}>Hızlı ara</div>
            <input
              className={styles.searchInput}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Hizmet ara… (örn: implant, zirkonyum, dolgu)"
              aria-label="Hizmet ara"
            />
          </div>

          <div className={styles.infoCard} role="note" aria-label="Bilgilendirme">
            <div className={styles.infoTitle}>Nasıl çalışır?</div>
            <ul className={styles.infoList}>
              <li>Hizmeti seç</li>
              <li>Şehrini seç</li>
              <li>KVKK onaylı formu doldur</li>
              <li>Uygun klinikler seni arasın</li>
            </ul>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>Sonuç bulunamadı. Yazımı kontrol edip tekrar dene.</div>
        ) : (
          <div className={styles.grid} aria-label="Hizmet listesi">
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
            <div className={styles.ctaDesc}>İşlemini seç, şehir seç, 30 saniyede formu doldur.</div>
          </div>
          <Link href="/teklif-al" className={`${styles.btn} ${styles.btnPrimary}`}>
            Teklif Al
          </Link>
        </div>
      </div>
    </main>
  );
}
