import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, isPublished: true },
  });

  const canonical = `/blog/${encodeURIComponent(slug)}`;

  if (!post || !post.isPublished) {
    return {
      title: "Yazı bulunamadı • Diş Fiyat Platform",
      description: "Aradığınız blog yazısı bulunamadı.",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${post.title} • Blog`,
    description: post.excerpt ?? "Diş tedavileri ve fiyatları hakkında blog içeriği.",
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? "Diş tedavileri ve fiyatları hakkında blog içeriği.",
      url: canonical,
      locale: "tr_TR",
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      content: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  if (!post || !post.isPublished) notFound();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ opacity: 0.75, fontWeight: 900 }}>
        <Link href="/blog" style={{ textDecoration: "none", color: "#111" }}>
          Blog
        </Link>{" "}
        / Yazı
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 950, margin: "10px 0 0 0", lineHeight: 1.15 }}>
        {post.title}
      </h1>

      <div style={{ marginTop: 8, opacity: 0.75, fontWeight: 800, fontSize: 12 }}>
        {new Date(post.publishedAt ?? post.updatedAt).toLocaleDateString("tr-TR")}
      </div>

      {post.excerpt ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.72)",
            borderRadius: 20,
            padding: 14,
            fontWeight: 800,
            lineHeight: 1.7,
            opacity: 0.9,
          }}
        >
          {post.excerpt}
        </div>
      ) : null}

      <article
        style={{
          marginTop: 14,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "rgba(255,255,255,0.82)",
          borderRadius: 22,
          padding: 16,
          lineHeight: 1.8,
          fontWeight: 650,
          color: "rgba(15,23,42,0.92)",
          whiteSpace: "pre-wrap",
        }}
      >
        {post.content}
      </article>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/teklif-al"
          style={{
            textDecoration: "none",
            fontWeight: 950,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
          }}
        >
          Teklif Al →
        </Link>

        <Link
          href="/klinikler"
          style={{
            textDecoration: "none",
            fontWeight: 950,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
          }}
        >
          Klinik Dizini →
        </Link>
      </div>
    </main>
  );
}
