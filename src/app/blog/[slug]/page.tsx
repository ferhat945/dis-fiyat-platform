import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/seo-data";
import { absUrl } from "@/lib/site-url";

import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type BlogPostData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  publishedAt: Date | null;
  updatedAt: Date;
  isPublished: boolean;
  clinic: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
};

function clinicSlug(
  name: string,
  id: string,
): string {
  const base =
    normalizeSlug(name).slice(0, 70) ||
    "klinik";

  return `${base}--${id}`;
}

function wordCount(
  text: string,
): number {
  const clean = text
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return 0;
  }

  return clean
    .split(" ")
    .filter(Boolean).length;
}

function readingMinutes(
  text: string,
): number {
  const count = wordCount(text);

  if (count <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.min(
      30,
      Math.round(count / 200),
    ),
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

  if (
    text.includes("implant")
  ) {
    return "İmplant";
  }

  if (
    text.includes("kanal")
  ) {
    return "Kanal";
  }

  if (
    text.includes("dolgu")
  ) {
    return "Dolgu";
  }

  if (
    text.includes("zirkonyum")
  ) {
    return "Zirkonyum";
  }

  if (
    text.includes("lamina")
  ) {
    return "Lamina";
  }

  if (
    text.includes("ortodont")
  ) {
    return "Ortodonti";
  }

  if (
    text.includes("beyazlat")
  ) {
    return "Beyazlatma";
  }

  if (
    text.includes("protez")
  ) {
    return "Protez";
  }

  if (
    text.includes("diş eti") ||
    text.includes("dis eti")
  ) {
    return "Diş Eti";
  }

  return "Genel";
}

function headingId(
  text: string,
): string {
  return (
    normalizeSlug(text) ||
    "bolum"
  );
}

function extractHeadings(
  content: string,
): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.startsWith("## ") ||
        line.startsWith("### "),
    )
    .map((line) =>
      line
        .replace(/^#{2,3}\s+/, "")
        .trim(),
    )
    .filter(Boolean);
}

/*
 * Desteklenen satır içi biçimler:
 *
 * [metin](/adres)
 * [metin](https://...)
 * **kalın**
 * *italik*
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
    (match =
      pattern.exec(text)) !== null
  ) {
    if (
      match.index >
      lastIndex
    ) {
      parts.push(
        text.slice(
          lastIndex,
          match.index,
        ),
      );
    }

    /*
     * Markdown link
     */
    if (
      match[1] !==
        undefined &&
      match[2] !==
        undefined
    ) {
      const label =
        match[1];

      const url =
        match[2];

      if (
        url.startsWith("/")
      ) {
        parts.push(
          <Link
            key={`link-${key}`}
            href={url}
            className={
              styles.blogLink
            }
          >
            {label}
          </Link>,
        );
      } else {
        parts.push(
          <a
            key={`link-${key}`}
            href={url}
            className={
              styles.blogLink
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>,
        );
      }

      key += 1;
    }

    /*
     * **kalın**
     */
    else if (
      match[3] !==
      undefined
    ) {
      parts.push(
        <strong
          key={`bold-${key}`}
        >
          {match[3]}
        </strong>,
      );

      key += 1;
    }

    /*
     * *italik*
     */
    else if (
      match[4] !==
      undefined
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

  if (
    lastIndex <
    text.length
  ) {
    parts.push(
      text.slice(
        lastIndex,
      ),
    );
  }

  return parts;
}

function renderContent(
  content: string,
): JSX.Element[] {
  const lines =
    content.split("\n");

  const elements:
    JSX.Element[] = [];

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
      listBuffer[0]?.line ??
      0;

    elements.push(
      <ul
        key={`list-${firstLine}`}
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

      /*
       * ### Başlık
       */
      if (
        trimmed.startsWith(
          "### ",
        )
      ) {
        flushList();

        const text =
          trimmed
            .replace(
              /^###\s+/,
              "",
            )
            .trim();

        if (!text) {
          return;
        }

        elements.push(
          <h2
            key={`h2-${index}`}
            id={headingId(
              text,
            )}
          >
            {renderInline(
              text,
            )}
          </h2>,
        );

        return;
      }

      /*
       * ## Başlık
       */
      if (
        trimmed.startsWith(
          "## ",
        )
      ) {
        flushList();

        const text =
          trimmed
            .replace(
              /^##\s+/,
              "",
            )
            .trim();

        if (!text) {
          return;
        }

        elements.push(
          <h2
            key={`h2-${index}`}
            id={headingId(
              text,
            )}
          >
            {renderInline(
              text,
            )}
          </h2>,
        );

        return;
      }

      /*
       * - Liste
       */
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
          key={`p-${index}`}
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

const getBlogPost = cache(
  async (
    slug: string,
  ): Promise<BlogPostData | null> => {
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } =
    await params;

  const post =
    await getBlogPost(
      slug,
    );

  if (
    !post ||
    !post.isPublished
  ) {
    return {
      title:
        "Yazı bulunamadı",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    /*
     * Root layout zaten
     * "| DişFiyat360"
     * ekliyor.
     */
    title:
      `${post.title} | Blog`,

    description:
      post.excerpt ??
      `${post.title} hakkında bilgilendirici içerik.`,

    alternates: {
      canonical:
        absUrl(
          `/blog/${post.slug}`,
        ),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogDetail({
  params,
}: PageProps): Promise<JSX.Element> {
  const { slug } =
    await params;

  const post =
    await getBlogPost(
      slug,
    );

  if (
    !post ||
    !post.isPublished
  ) {
    notFound();
  }

  const clinic =
    post.clinic?.isActive
      ? post.clinic
      : null;

  const clinicHref =
    clinic
      ? `/klinikler/${encodeURIComponent(
          clinicSlug(
            clinic.name,
            clinic.id,
          ),
        )}`
      : null;

  const minutes =
    readingMinutes(
      post.content,
    );

  const category =
    detectCategory(
      post.title,
      post.content,
    );

  const headings =
    extractHeadings(
      post.content,
    );

  const publishedDate =
    post.publishedAt
      ? new Intl.DateTimeFormat(
          "tr-TR",
          {
            dateStyle:
              "long",
          },
        ).format(
          post.publishedAt,
        )
      : null;

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

  const faqJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "FAQPage",

    mainEntity:
      faqItems.map(
        (item) => ({
          "@type":
            "Question",

          name:
            item.q,

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              item.a,
          },
        }),
      ),
  };

  return (
    <main
      className={
        styles.wrap
      }
    >
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

      <div
        className={
          styles.container
        }
      >
        <div
          className={
            styles.topRow
          }
        >
          <div
            className={
              styles.breadcrumb
            }
          >
            <Link href="/">
              Ana Sayfa
            </Link>

            <span>
              /
            </span>

            <Link href="/blog">
              Blog
            </Link>
          </div>

          <div
            className={
              styles.actions
            }
          >
            <Link
              href="/blog"
              className={
                styles.backBtn
              }
            >
              ← Blog
            </Link>

            <Link
              href="/teklif-al"
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Teklif Al →
            </Link>
          </div>
        </div>

        <section
          className={
            styles.shell
          }
        >
          <div
            className={
              styles.inner
            }
          >
            <div>
              <div
                className={
                  styles.headerCard
                }
              >
                <div
                  className={
                    styles.kickers
                  }
                >
                  <span
                    className={`${styles.badge} ${styles.badgeBlog}`}
                  >
                    📝 Blog
                  </span>

                  <span
                    className={
                      styles.badge
                    }
                  >
                    {category}
                  </span>

                  <span
                    className={
                      styles.badge
                    }
                  >
                    ⏱️ {minutes} dk
                  </span>
                </div>

                <h1
                  className={
                    styles.h1
                  }
                >
                  {post.title}
                </h1>

                <div
                  className={
                    styles.metaLine
                  }
                >
                  {publishedDate ? (
                    <>
                      <span>
                        📅 {publishedDate}
                      </span>

                      <span
                        className={
                          styles.dot
                        }
                      />
                    </>
                  ) : null}

                  <span>
                    Bilgilendirici içerik
                  </span>
                </div>

                {post.excerpt ? (
                  <div
                    className={
                      styles.excerptCard
                    }
                  >
                    {post.excerpt}
                  </div>
                ) : null}

                {clinic &&
                clinicHref ? (
                  <div
                    className={
                      styles.publisherCard
                    }
                  >
                    <div
                      className={
                        styles.publisherTitle
                      }
                    >
                      🏥 {clinic.name}
                    </div>

                    <div
                      className={
                        styles.publisherSub
                      }
                    >
                      Bu içerik platformdaki
                      klinik profiliyle
                      ilişkilendirilmiştir.
                    </div>

                    <div
                      className={
                        styles.publisherBtns
                      }
                    >
                      <Link
                        href={
                          clinicHref
                        }
                        className={
                          styles.btn
                        }
                      >
                        Klinik Profili →
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>

              {headings.length >
              0 ? (
                <div
                  className={
                    styles.articleCard
                  }
                  style={{
                    marginTop:
                      12,
                  }}
                >
                  <div
                    style={{
                      fontWeight:
                        950,
                      marginBottom:
                        8,
                    }}
                  >
                    İçindekiler
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gap: 6,
                    }}
                  >
                    {headings.map(
                      (
                        heading,
                        index,
                      ) => (
                        <a
                          key={`${heading}-${index}`}
                          href={`#${headingId(
                            heading,
                          )}`}
                          className={
                            styles.blogLink
                          }
                        >
                          {heading}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              <article
                className={
                  styles.articleCard
                }
              >
                <div
                  className={
                    styles.article
                  }
                >
                  {renderContent(
                    post.content,
                  )}
                </div>
              </article>

              <div
                className={
                  styles.note
                }
              >
                Bu içerik bilgilendirme
                amaçlıdır; tıbbi teşhis
                veya tedavi tavsiyesi
                değildir. Kesin fiyat
                muayene sonrası ilgili
                klinik tarafından
                belirlenir.
              </div>
            </div>

            <aside
              className={
                styles.sidebar
              }
            >
              <div
                className={
                  styles.sideCard
                }
              >
                <div
                  className={
                    styles.sideTitle
                  }
                >
                  Teklif almak ister
                  misin?
                </div>

                <div
                  className={
                    styles.sideDesc
                  }
                >
                  Şehir ve hizmetini
                  seçerek KVKK onaylı
                  form ile uygun
                  kliniklerden teklif
                  isteyebilirsin.
                </div>

                <div
                  className={
                    styles.ctaCol
                  }
                >
                  <Link
                    href="/teklif-al"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                  >
                    Ücretsiz Teklif Al →
                  </Link>

                  <Link
                    href="/sehir"
                    className={
                      styles.btn
                    }
                  >
                    Şehirleri Gör
                  </Link>

                  <Link
                    href="/hizmetler"
                    className={
                      styles.btn
                    }
                  >
                    Hizmetleri Gör
                  </Link>
                </div>
              </div>

              <div
                className={
                  styles.sideCard
                }
              >
                <div
                  className={
                    styles.sideTitle
                  }
                >
                  Sık Sorulan Sorular
                </div>

                <div
                  className={
                    styles.sideDesc
                  }
                >
                  {faqItems.map(
                    (item) => (
                      <details
                        key={
                          item.q
                        }
                        style={{
                          marginBottom:
                            10,
                        }}
                      >
                        <summary
                          style={{
                            cursor:
                              "pointer",
                            fontWeight:
                              900,
                          }}
                        >
                          {item.q}
                        </summary>

                        <div
                          style={{
                            marginTop:
                              6,
                          }}
                        >
                          {item.a}
                        </div>
                      </details>
                    ),
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}