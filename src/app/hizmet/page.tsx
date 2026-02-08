import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hizmetler • Diş Tedavisi Teklif Al",
  description: "Diş tedavileri için hizmet listesi. Şehir seçip teklif al.",
  alternates: { canonical: "/hizmet" },
};

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

export default function ServicesIndexPage(): JSX.Element {
  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0 }}>Hizmetler</h1>
        <Link href="/" style={{ textDecoration: "none", fontWeight: 900, color: "#111" }}>
          Ana sayfa →
        </Link>
      </div>

      <p style={{ marginTop: 10, opacity: 0.8, fontWeight: 650, lineHeight: 1.7 }}>
        Bir hizmet seç, sonra şehir seçerek ilgili sayfadan teklif al.
      </p>

      <div style={{ marginTop: 14, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {SERVICES.map((s) => (
          <Link
            key={s.slug}
            href={`/hizmet/${s.slug}`}
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
            {s.label} →
            <div style={{ marginTop: 8, opacity: 0.7, fontWeight: 650, fontSize: 13 }}>
              Şehir sayfalarına yönlendirir
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
