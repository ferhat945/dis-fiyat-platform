"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CITIES, cityLabel } from "@/lib/seo-data";
import styles from "./page.module.css";



type CityItem = {
  slug: string;
  title: string;
  href: string;
  subtitle: string;
  icon: string;
};

function normalizeForSearch(v: string): string {
  return v
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

export default function CitiesPage(): JSX.Element {
  const all: CityItem[] = useMemo(() => {
    const icons: Record<string, string> = {
      istanbul: "🌉",
      ankara: "🏛️",
      izmir: "🌊",
      bursa: "⛰️",
      antalya: "☀️",
    };

    return CITIES.map((c) => ({
      slug: c,
      title: cityLabel(c),
      href: `/sehir/${c}`,
      subtitle: "İşlemleri gör →",
      icon: icons[c] ?? "📍",
    }));
  }, []);

  const [q, setQ] = useState("");

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
        <div className={styles.head}>
          <div className={styles.kicker}>Şehirler</div>
          <h1 className={styles.title}>Şehrini seç</h1>
          <p className={styles.desc}>Şehir seç → işlem seç → KVKK onaylı form ile teklif al.</p>
        </div>

        <div className={styles.searchCard}>
          <div className={styles.searchLabel}>Hızlı ara</div>
          <input
            className={styles.searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Şehir ara…"
            aria-label="Şehir ara"
          />
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>Sonuç bulunamadı. Yazımı kontrol edip tekrar dene.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((c) => (
              <Link key={c.slug} href={c.href} className={styles.card}>
                <div className={styles.icon} aria-hidden>
                  {c.icon}
                </div>
                <div className={styles.body}>
                  <div className={styles.cardTitle}>{c.title}</div>
                  <div className={styles.cardDesc}>{c.subtitle}</div>
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
            <div className={styles.ctaDesc}>Şehir + işlem seçip 30 saniyede formu doldur.</div>
          </div>
          <Link href="/teklif-al" className={styles.btn}>
            Teklif Al
          </Link>
        </div>
      </div>
    </main>
  );
}
