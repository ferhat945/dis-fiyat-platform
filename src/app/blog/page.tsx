// src/app/blog/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { absUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | DişFiyat360",
  description: "Diş tedavileri hakkında bilgilendirici yazılar. Kliniklerin paylaşımları.",
  alternates: { canonical: absUrl("/blog") },
};

type PostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  publishedAt: Date | null;
  clinic: { id: string; name: string; isActive: boolean } | null;
};

function wordCount(s: string): number {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  if (!t) return 0;
  return t.split(" ").filter(Boolean).length;
}

function calcReadingMinutesFromText(text: string): number | null {
  const wc = wordCount(text);
  if (wc <= 0) return null;
  // Ortalama 200 kelime/dk
  const min = Math.max(1, Math.round(wc / 200));
  return Math.min(min, 30);
}

function pickCategoryFromText(title: string, excerpt: string | null, content: string): string {
  const t = `${title} ${excerpt ?? ""} ${content}`.toLowerCase();

  const has = (arr: string[]) => arr.some((k) => t.includes(k));

  if (has(["implant", "implan"])) return "İmplant";
  if (has(["kanal", "endodont"])) return "Kanal";
  if (has(["dolgu", "kompozit"])) return "Dolgu";
  if (has(["zirkonyum"])) return "Zirkonyum";
  if (has(["lamina", "veneer"])) return "Lamina";
  if (has(["diş teli", "ortodont", "braket"])) return "Ortodonti";
  if (has(["beyazlat", "bleach"])) return "Beyazlatma";
  if (has(["çekim", "gömülü", "yirmilik"])) return "Çekim";
  if (has(["protez", "damak"])) return "Protez";
  if (has(["periodont", "diş eti"])) return "Diş Eti";

  return "Genel";
}

function safeClinicName(p: PostItem): string {
  const c = p.clinic;
  if (!c) return "Klinik";
  return c.isActive ? c.name : "Klinik";
}

function formatDateTR(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("tr-TR");
}

export default async function BlogIndexPage(): Promise<JSX.Element> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 60,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true, // ✅ okuma süresi burada hesaplanıyor
      publishedAt: true,
      clinic: { select: { id: true, name: true, isActive: true } },
    },
  });

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 18px 60px" }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.62)",
              fontWeight: 950,
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            📝 Blog
            <span style={{ opacity: 0.7, fontWeight: 900 }}>• Bilgilendirici içerikler</span>
          </div>

          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 950, letterSpacing: "-0.02em" }}>Diş Blog Yazıları</h1>

          <p style={{ marginTop: 10, opacity: 0.82, fontWeight: 750, lineHeight: 1.7, maxWidth: 80 * 8 }}>
            Diş tedavileri hakkında içerikler, klinik paylaşımları ve fiyatı etkileyen detaylar.
            <br />
            <strong>Kesin fiyat muayene sonrası netleşir.</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/teklif-al"
            style={{
              textDecoration: "none",
              fontWeight: 950,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(11,18,32,0.92)",
              color: "#fff",
            }}
          >
            Teklif Al →
          </Link>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontWeight: 950,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.78)",
              color: "#111",
            }}
          >
            Ana sayfa →
          </Link>
        </div>
      </div>

      {/* GRID */}
      {posts.length === 0 ? (
        <div style={{ marginTop: 14, opacity: 0.75, fontWeight: 850 }}>Henüz yayınlanmış yazı yok.</div>
      ) : (
        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {posts.map((p) => {
            const minutes = calcReadingMinutesFromText(p.content || p.excerpt || p.title);
            const cat = pickCategoryFromText(p.title, p.excerpt, p.content);
            const date = formatDateTR(p.publishedAt);
            const clinicName = safeClinicName(p);

            return (
              <Link
                key={p.id}
                href={`/blog/${encodeURIComponent(p.slug)}`}
                style={{
                  textDecoration: "none",
                  color: "#111",
                  borderRadius: 20,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.82)",
                  boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
                  overflow: "hidden",
                  display: "grid",
                }}
              >
                {/* Cover (gradient placeholder) */}
                <div
                  style={{
                    height: 110,
                    background:
                      "radial-gradient(420px 200px at 20% 40%, rgba(124,58,237,0.24), transparent 60%), radial-gradient(420px 220px at 80% 10%, rgba(14,165,233,0.20), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.05))",
                    borderBottom: "1px solid rgba(15,23,42,0.08)",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "absolute", left: 12, top: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 950,
                        padding: "7px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.76)",
                      }}
                    >
                      {cat}
                    </span>

                    {minutes ? (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 950,
                          padding: "7px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(124,58,237,0.22)",
                          background: "rgba(124,58,237,0.10)",
                          color: "rgba(124,58,237,0.95)",
                        }}
                      >
                        ⏱️ Okuma: {minutes} dk
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: 14, display: "grid", gap: 10 }}>
                  <div style={{ fontWeight: 950, fontSize: 16, lineHeight: 1.35 }}>{p.title}</div>

                  <div style={{ opacity: 0.85, fontWeight: 750, lineHeight: 1.6 }}>
                    {p.excerpt?.trim()
                      ? p.excerpt.trim()
                      : (p.content || "").trim().slice(0, 140) + ((p.content || "").trim().length > 140 ? "…" : "")}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                    <div style={{ opacity: 0.75, fontWeight: 850, fontSize: 12 }}>{date}</div>
                    <div style={{ opacity: 0.9, fontWeight: 900, fontSize: 12 }}>🏥 {clinicName}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginTop: 2 }}>
                    <span style={{ fontWeight: 950, opacity: 0.86 }}>Devamını oku →</span>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(14,165,233,0.12))",
                        fontWeight: 950,
                      }}
                      aria-hidden
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom note */}
      <div style={{ marginTop: 16, opacity: 0.7, fontWeight: 800, fontSize: 12, lineHeight: 1.6 }}>
        Not: Blog içerikleri bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir. Kesin fiyat muayene sonrası netleşir.
      </div>
    </main>
  );
}