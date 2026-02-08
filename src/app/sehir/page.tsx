import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Şehirler • Diş Tedavisi Teklif Al",
  description: "Şehir listesi. Şehir seçip hizmetlere göre teklif al.",
  alternates: { canonical: "/sehir" },
};

const CITIES = [
  { slug: "istanbul", label: "İstanbul" },
  { slug: "ankara", label: "Ankara" },
  { slug: "izmir", label: "İzmir" },
  { slug: "bursa", label: "Bursa" },
  { slug: "antalya", label: "Antalya" },
];

export default function CitiesIndexPage(): JSX.Element {
  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0 }}>Şehirler</h1>
        <Link href="/" style={{ textDecoration: "none", fontWeight: 900, color: "#111" }}>
          Ana sayfa →
        </Link>
      </div>

      <p style={{ marginTop: 10, opacity: 0.8, fontWeight: 650, lineHeight: 1.7 }}>
        Şehrini seç, hizmetlere göre teklif al.
      </p>

      <div style={{ marginTop: 14, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {CITIES.map((c) => (
          <Link
            key={c.slug}
            href={`/sehir/${c.slug}`}
            style={{
              textDecoration: "none",
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 14,
              background: "#fff",
              color: "#111",
              fontWeight: 900,
            }}
          >
            {c.label} →
            <div style={{ marginTop: 8, opacity: 0.7, fontWeight: 650, fontSize: 13 }}>
              Hizmet listesine yönlendirir
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
