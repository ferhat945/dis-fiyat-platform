import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/seo-data";
import { absUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* -----------------------------------
   Yardımcı Fonksiyonlar
------------------------------------ */

function clinicSlug(
  name: string,
  id: string,
): string {
  const base =
    normalizeSlug(name).slice(0, 70) ||
    "klinik";

  return `${base}--${id}`;
}

function wordCount(s: string): number {
  return (s ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function readingMinutes(
  text: string,
): number {
  return Math.max(
    1,
    Math.round(wordCount(text) / 200),
  );
}

function detectCategory(
  title: string,
  content: string,
): string {
  const text =
    `${title} ${content}`.toLocaleLowerCase(
      "tr-TR",
    );

  if (text.includes("implant")) {
    return "İmplant";
  }

  if (text.includes("kanal")) {
    return "Kanal";
  }

  if (text.includes("dolgu")) {
    return "Dolgu";
  }

  if (text.includes("zirkonyum")) {
    return "Zirkonyum";
  }

  if (text.includes("lamina")) {
    return "Lamina";
  }

  if (text.includes("ortodont")) {
    return "Ortodonti";
  }

  return "Genel";
}

function headingId(text: string): string {
  return normalizeSlug(text) || "bolum";
}

function extractHeadings(
  content: string,
): string[] {
  return content
    .split("\n")
    .filter((line) =>
      line.trim().startsWith("##"),
    )
    .map((line) =>
      line
        .replace(/^#+\s*/, "")
        .trim(),
    )
    .filter(Boolean);
}

/*
 * Satır içi markdown:
 *
 * [metin](/adres) -> iç link
 * [metin](https://...) -> dış link
 * **metin** -> kalın
 * *metin* -> italik
 */
function renderInline(
  text: string,
): Array<string | JSX.Element> {
  const parts: Array<
    string | JSX.Element
  > = [];

  const pattern =
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while (
    (match = pattern.exec(text)) !== null
  ) {
    if (match.index > lastIndex) {
      parts.push(
        text.slice(
          lastIndex,
          match.index,
        ),
      );
    }

    if (
      match[1] !== undefined &&
      match[2] !== undefined
    ) {
      const label = match[1];
      const url = match[2];

      if (url.startsWith("/")) {
        parts.push(
          <Link
            key={`link-${key}`}
            href={url}
            className="blogLink"
          >
            {label}
          </Link>,
        );
      } else {
        parts.push(
          <a
            key={`link-${key}`}
            href={url}
            className="blogLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>,
        );
      }

      key += 1;
    } else if (
      match[3] !== undefined
    ) {
      parts.push(
        <strong
          key={`bold-${key}`}
        >
          {match[3]}
        </strong>,
      );

      key += 1;
    } else if (
      match[4] !== undefined
    ) {
      parts.push(
        <em
          key={`italic-${key}`}
        >
          {match[4]}
        </em>,
      );

      key += 1;
    }

    lastIndex =
      pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      text.slice(lastIndex),
    );
  }

  return parts;
}

function renderContent(
  content: string,
): JSX.Element[] {
  const lines =
    content.split("\n");

  const elements: JSX.Element[] =
    [];

  let listBuffer: Array<{
    text: string;
    line: number;
  }> = [];

  function flushList(): void {
    if (
      listBuffer.length === 0
    ) {
      return;
    }

    const firstLine =
      listBuffer[0]?.line ?? 0;

    elements.push(
      <ul
        key={`list-${firstLine}`}
        className="blogUl"
      >
        {listBuffer.map(
          (item) => (
            <li
              key={`list-item-${item.line}`}
            >
              {renderInline(
                item.text,
              )}
            </li>
          ),
        )}
      </ul>,
    );

    listBuffer = [];
  }

  lines.forEach(
    (line, index) => {
      const trimmed =
        line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (
        trimmed.startsWith(
          "##",
        )
      ) {
        flushList();

        const text =
          trimmed
            .replace(
              /^#+\s*/,
              "",
            )
            .trim();

        if (!text) {
          return;
        }

        elements.push(
          <h2
            key={`heading-${index}`}
            id={headingId(text)}
            className="blogH2"
          >
            {renderInline(text)}
          </h2>,
        );

        return;
      }

      if (
        trimmed.startsWith(
          "- ",
        )
      ) {
        listBuffer.push({
          text: trimmed
            .slice(2)
            .trim(),
          line: index,
        });

        return;
      }

      flushList();

      elements.push(
        <p
          key={`paragraph-${index}`}
          className="blogP"
        >
          {renderInline(
            trimmed,
          )}
        </p>,
      );
    },
  );

  flushList();

  return elements;
}

/* -----------------------------------
   Blog verisi
------------------------------------ */

const getBlogPost = cache(
  async (slug: string) => {
    return prisma.blogPost.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        updatedAt: true,
        isPublished: true,

        clinic: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });
  },
);

/* -----------------------------------
   Metadata
------------------------------------ */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post =
    await getBlogPost(slug);

  if (
    !post ||
    !post.isPublished
  ) {
    return {
      title: "Yazı bulunamadı",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    /*
     * Root layout zaten:
     *
     * %s | DişFiyat360
     *
     * eklediği için burada marka
     * tekrar yazılmaz.
     */
    title:
      `${post.title} | Blog`,

    description:
      post.excerpt ??
      `${post.title} hakkında DişFiyat360 bilgilendirme yazısı.`,

    alternates: {
      canonical: absUrl(
        `/blog/${post.slug}`,
      ),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* -----------------------------------
   Ana Sayfa
------------------------------------ */

export default async function BlogDetail({
  params,
}: PageProps): Promise<JSX.Element> {
  const { slug } = await params;

  const post =
    await getBlogPost(slug);

  if (
    !post ||
    !post.isPublished
  ) {
    return notFound();
  }

  const clinic =
    post.clinic?.isActive
      ? post.clinic
      : null;

  const clinicHref = clinic
    ? `/klinikler/${encodeURIComponent(
        clinicSlug(
          clinic.name,
          clinic.id,
        ),
      )}`
    : null;

  const minutes =
    readingMinutes(post.content);

  const category =
    detectCategory(
      post.title,
      post.content,
    );

  const headings =
    extractHeadings(
      post.content,
    );

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
    "@context":
      "https://schema.org",
    "@type": "FAQPage",

    mainEntity:
      faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,

        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
  };

  const articleJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Article",

    headline:
      post.title,

    description:
      post.excerpt ??
      undefined,

    url:
      absUrl(
        `/blog/${post.slug}`,
      ),

    datePublished:
      post.publishedAt
        ? post.publishedAt.toISOString()
        : undefined,

    dateModified:
      post.updatedAt.toISOString(),

    inLanguage:
      "tr-TR",

    publisher: {
      "@type":
        "Organization",

      name:
        "DişFiyat360",

      url:
        absUrl("/"),
    },
  };

  return (
    <main className="blogWrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleJsonLd,
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              faqJsonLd,
            ),
        }}
      />

      <div className="blogTopBar">
        <Link href="/blog">
          ← Blog
        </Link>

        <Link
          href="/teklif-al"
          className="blogPrimaryBtn"
        >
          Teklif Al →
        </Link>
      </div>

      <div className="blogHeader">
        <div className="blogBadges">
          <span>
            {category}
          </span>

          <span>
            ⏱ {minutes} dk
          </span>
        </div>

        <h1>
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="blogExcerpt">
            {post.excerpt}
          </p>
        ) : null}
      </div>

      {headings.length > 0 ? (
        <nav
          className="blogToc"
          aria-label="İçindekiler"
        >
          <div className="blogTocTitle">
            İçindekiler
          </div>

          {headings.map(
            (heading, index) => (
              <a
                key={`${heading}-${index}`}
                href={`#${headingId(
                  heading,
                )}`}
              >
                {heading}
              </a>
            ),
          )}
        </nav>
      ) : null}

      <article className="blogContentArea">
        {renderContent(
          post.content,
        )}
      </article>

      <div className="blogCtaInline">
        <div>
          <strong>
            Diş tedavisi için teklif
            almak ister misin?
          </strong>

          <div>
            KVKK onaylı formu
            doldur, klinikler seni
            arasın.
          </div>
        </div>

        <Link
          href="/teklif-al"
          className="blogPrimaryBtn"
        >
          Teklif Al →
        </Link>
      </div>

      {clinic &&
      clinicHref ? (
        <div className="blogClinicBox">
          <div>
            Bu yazı{" "}
            <strong>
              {clinic.name}
            </strong>{" "}
            tarafından yayınlandı.
          </div>

          <Link
            href={clinicHref}
          >
            Klinik Profili →
          </Link>
        </div>
      ) : null}

      <div className="blogFaq">
        <h2>
          Sık Sorulan Sorular
        </h2>

        {faqItems.map(
          (item) => (
            <details
              key={item.q}
            >
              <summary>
                {item.q}
              </summary>

              <p>
                {item.a}
              </p>
            </details>
          ),
        )}
      </div>
    </main>
  );
}