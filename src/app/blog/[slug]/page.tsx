import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/seo-data";
import { absUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/* -----------------------------------
   Yardımcı Fonksiyonlar
------------------------------------*/

function clinicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function wordCount(s: string): number {
  return (s ?? "").trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 200));
}

function detectCategory(title: string, content: string): string {
  const t = (title + content).toLowerCase();
  if (t.includes("implant")) return "İmplant";
  if (t.includes("kanal")) return "Kanal";
  if (t.includes("dolgu")) return "Dolgu";
  if (t.includes("zirkonyum")) return "Zirkonyum";
  if (t.includes("lamina")) return "Lamina";
  if (t.includes("ortodont")) return "Ortodonti";
  return "Genel";
}

function extractHeadings(content: string): string[] {
  const lines = content.split("\n");
  return lines.filter((l) => l.trim().startsWith("##")).map((l) =>
    l.replace(/^#+\s*/, "").trim()
  );
}

function renderContent(content: string): JSX.Element[] {
  const lines = content.split("\n");

  const elements: JSX.Element[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={Math.random()} className="blogUl">
          {listBuffer.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("##")) {
      flushList();
      const text = trimmed.replace(/^#+\s*/, "");
      const id = text.toLowerCase().replace(/\s+/g, "-");
      elements.push(
        <h2 key={i} id={id} className="blogH2">
          {text}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.replace("- ", ""));
      return;
    }

    flushList();
    elements.push(
      <p key={i} className="blogP">
        {trimmed}
      </p>
    );
  });

  flushList();
  return elements;
}

/* -----------------------------------
   Metadata
------------------------------------*/

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, isPublished: true },
  });

  if (!post || !post.isPublished) {
    return { title: "Yazı bulunamadı", robots: { index: false } };
  }

  return {
    title: `${post.title} | Blog | DişFiyat360`,
    description: post.excerpt ?? "",
    alternates: { canonical: absUrl(`/blog/${slug}`) },
  };
}

/* -----------------------------------
   Ana Sayfa
------------------------------------*/

export default async function BlogDetail({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      isPublished: true,
      clinic: { select: { id: true, name: true, isActive: true } },
    },
  });

  if (!post || !post.isPublished) notFound();

  const clinic = post.clinic?.isActive ? post.clinic : null;
  const clinicHref = clinic ? `/klinikler/${clinicSlug(clinic.name, clinic.id)}` : null;

  const minutes = readingMinutes(post.content);
  const category = detectCategory(post.title, post.content);
  const headings = extractHeadings(post.content);

  const faqItems = [
    {
      q: "Diş tedavisi fiyatı neye göre değişir?",
      a: "Muayene bulguları, kullanılan malzeme ve tedavi planına göre değişir.",
    },
    {
      q: "Kesin fiyat ne zaman belli olur?",
      a: "Kesin fiyat muayene sonrası netleşir.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <main className="blogWrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="blogTopBar">
        <Link href="/blog">← Blog</Link>
        <Link href="/teklif-al" className="blogPrimaryBtn">
          Teklif Al →
        </Link>
      </div>

      <div className="blogHeader">
        <div className="blogBadges">
          <span>{category}</span>
          <span>⏱ {minutes} dk</span>
        </div>

        <h1>{post.title}</h1>

        {post.excerpt && <p className="blogExcerpt">{post.excerpt}</p>}
      </div>

      {headings.length > 0 && (
        <div className="blogToc">
          <div className="blogTocTitle">İçindekiler</div>
          {headings.map((h, i) => (
            <a key={i} href={`#${h.toLowerCase().replace(/\s+/g, "-")}`}>
              {h}
            </a>
          ))}
        </div>
      )}

      <article className="blogContentArea">
        {renderContent(post.content)}
      </article>

      <div className="blogCtaInline">
        <div>
          <strong>Diş tedavisi için teklif almak ister misin?</strong>
          <div>KVKK onaylı formu doldur, klinikler seni arasın.</div>
        </div>
        <Link href="/teklif-al" className="blogPrimaryBtn">
          Teklif Al →
        </Link>
      </div>

      {clinic && clinicHref && (
        <div className="blogClinicBox">
          <div>
            Bu yazı <strong>{clinic.name}</strong> tarafından yayınlandı.
          </div>
          <Link href={clinicHref}>Klinik Profili →</Link>
        </div>
      )}

      <div className="blogFaq">
        <h2>Sık Sorulan Sorular</h2>
        {faqItems.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}