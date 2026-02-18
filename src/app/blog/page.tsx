import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog • Diş Fiyat Platform",
  description: "Diş tedavileri, şehir bazlı bilgiler ve teklif süreçleri hakkında rehber içerikler.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage(): Promise<JSX.Element> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0 }}>Blog</h1>
        <Link href="/" style={{ textDecoration: "none", fontWeight: 900, color: "#111" }}>
          Ana sayfa →
        </Link>
      </div>

      <p style={{ marginTop: 10, opacity: 0.8, fontWeight: 650, lineHeight: 1.7 }}>
        Diş tedavileri, fiyatı etkileyen faktörler ve şehir bazlı rehber içerikler.
      </p>

      {posts.length === 0 ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.72)",
            borderRadius: 22,
            padding: 14,
            fontWeight: 850,
            opacity: 0.8,
          }}
        >
          Henüz yayınlanmış yazı yok.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              style={{
                textDecoration: "none",
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(255,255,255,0.82)",
                borderRadius: 20,
                padding: 14,
                color: "#111",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 950, fontSize: 18 }}>{p.title}</div>

              <div style={{ opacity: 0.75, fontWeight: 800, fontSize: 12 }}>
                {new Date(p.publishedAt ?? p.updatedAt).toLocaleDateString("tr-TR")}
              </div>

              {p.excerpt ? (
                <div style={{ opacity: 0.85, fontWeight: 700, lineHeight: 1.7 }}>{p.excerpt}</div>
              ) : null}

              <div style={{ fontWeight: 950, opacity: 0.85 }}>Oku →</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
