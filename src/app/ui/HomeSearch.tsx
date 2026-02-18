"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CITIES, SERVICES, cityLabel, serviceLabel } from "@/lib/seo-data";

type Option = { slug: string; label: string };

function inputStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: "#fff",
    outline: "none",
    fontWeight: 800,
  };
}

function btnPrimary(): CSSProperties {
  return {
    textDecoration: "none",
    fontWeight: 950,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    display: "inline-block",
  };
}

function btnGhost(): CSSProperties {
  return {
    textDecoration: "none",
    fontWeight: 950,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#111",
    display: "inline-block",
  };
}

export default function HomeSearch(): JSX.Element {
  // ✅ Tek kaynak: seo-data (slug'lar route ile %100 uyumlu)
  const cityOptions: Option[] = useMemo(() => {
    // İstersen burada ilk 5’i gösterebilirsin, ama slug kaynağı yine seo-data
    const top = ["istanbul", "ankara", "izmir", "bursa", "antalya"];
    const set = new Set(top);

    const pinned = CITIES.filter((c) => set.has(c));
    const rest = CITIES.filter((c) => !set.has(c));

    const merged = [...pinned, ...rest].slice(0, 20); // UI şişmesin diye ilk 20

    return merged.map((slug) => ({ slug, label: cityLabel(slug) }));
  }, []);

  const serviceOptions: Option[] = useMemo(() => {
    return SERVICES.map((slug) => ({ slug, label: serviceLabel(slug) }));
  }, []);

  const [city, setCity] = useState<string>(cityOptions[0]?.slug ?? "");
  const [service, setService] = useState<string>(serviceOptions[0]?.slug ?? "");

  const href = useMemo(() => {
    if (!city || !service) return "/sehir";
    // ✅ Route: /sehir/[city]/[service]
    return `/sehir/${city}/${service}`;
  }, [city, service]);

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 20,
        padding: 16,
        background: "linear-gradient(180deg,#fff 0%,#fafafa 100%)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 950 }}>Hızlı Başla</div>
      <div style={{ marginTop: 8, opacity: 0.8, fontWeight: 650, lineHeight: 1.6 }}>
        Şehir ve hizmet seç → ilgili sayfadan KVKK onaylı teklif formuna git.
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Şehir</div>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle()}>
            {cityOptions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Hizmet</div>
          <select value={service} onChange={(e) => setService(e.target.value)} style={inputStyle()}>
            {serviceOptions.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href={href} style={btnPrimary()}>
          Fiyat sayfasına git →
        </Link>

        <Link href="/kvkk" style={btnGhost()}>
          KVKK Metni
        </Link>

        <Link href="/sehir" style={btnGhost()}>
          Şehirler
        </Link>

        {/* ✅ /hizmet yerine /hizmetler (sende modern liste burada) */}
        <Link href="/hizmetler" style={btnGhost()}>
          Hizmetler
        </Link>
      </div>

      <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12, fontWeight: 700 }}>
        Not: Kesin fiyat muayene sonrası netleşir.
      </div>
    </div>
  );
}
