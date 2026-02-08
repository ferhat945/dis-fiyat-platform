"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const CITIES = [
  { slug: "istanbul", label: "İstanbul" },
  { slug: "ankara", label: "Ankara" },
  { slug: "izmir", label: "İzmir" },
  { slug: "bursa", label: "Bursa" },
  { slug: "antalya", label: "Antalya" },
];

const SERVICES = [
  { slug: "implant", label: "İmplant" },
  { slug: "zirkonyum", label: "Zirkonyum Kaplama" },
  { slug: "lamina", label: "Lamina (Yaprak Porselen)" },
  { slug: "dis-beyazlatma", label: "Diş Beyazlatma" },
  { slug: "kanal-tedavisi", label: "Kanal Tedavisi" },
  { slug: "dis-tasi-temizligi", label: "Diş Taşı Temizliği" },
  { slug: "dolgu", label: "Dolgu" },
  { slug: "kaplama", label: "Kaplama" },
  { slug: "ortodonti", label: "Ortodonti (Tel Tedavisi)" },
];

export default function HomeSearch(): JSX.Element {
  const [city, setCity] = useState<string>(CITIES[0]?.slug ?? "");
  const [service, setService] = useState<string>(SERVICES[0]?.slug ?? "");

  const href = useMemo(() => {
    if (!city || !service) return "#";
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

      <div style={{ marginTop: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Şehir</div>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={inp()}>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Hizmet</div>
          <select value={service} onChange={(e) => setService(e.target.value)} style={inp()}>
            {SERVICES.map((s) => (
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

        <Link href="/hizmet" style={btnGhost()}>
          Hizmetler
        </Link>
      </div>

      <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12, fontWeight: 700 }}>
        Not: Kesin fiyat muayene sonrası netleşir.
      </div>
    </div>
  );
}

function inp(): React.CSSProperties {
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

function btnPrimary(): React.CSSProperties {
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

function btnGhost(): React.CSSProperties {
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
