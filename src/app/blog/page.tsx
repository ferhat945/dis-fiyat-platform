// src/app/blog/page.tsx

import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { absUrl } from "@/lib/site-url";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | DişFiyat360",
  description:
    "Diş tedavileri hakkında bilgilendirici yazılar. Kliniklerin paylaşımları.",
  alternates: {
    canonical: absUrl("/blog"),
  },
};

type PostItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  publishedAt: Date | null;
  clinic: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
};

function wordCount(text: string): number {
  const normalized = (text ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return 0;
  }

  return normalized
    .split(" ")
    .filter(Boolean)
    .length;
}

function calcReadingMinutesFromText(
  text: string,
): number | null {
  const count = wordCount(text);

  if (count <= 0) {
    return null;
  }

  const minutes = Math.max(
    1,
    Math.round(count / 200),
  );

  return Math.min(
    minutes,
    30,
  );
}

function pickCategoryFromText(
  title: string,
  excerpt: string | null,
  content: string,
): string {
  const text =
    `${title} ${excerpt ?? ""} ${content}`.toLowerCase();

  const has = (
    words: string[],
  ): boolean =>
    words.some(
      (word) =>
        text.includes(word),
    );

  if (
    has([
      "implant",
      "implan",
    ])
  ) {
    return "İmplant";
  }

  if (
    has([
      "kanal",
      "endodont",
    ])
  ) {
    return "Kanal";
  }

  if (
    has([
      "dolgu",
      "kompozit",
    ])
  ) {
    return "Dolgu";
  }

  if (
    has([
      "zirkonyum",
    ])
  ) {
    return "Zirkonyum";
  }

  if (
    has([
      "lamina",
      "veneer",
    ])
  ) {
    return "Lamina";
  }

  if (
    has([
      "diş teli",
      "ortodont",
      "braket",
    ])
  ) {
    return "Ortodonti";
  }

  if (
    has([
      "beyazlat",
      "bleach",
    ])
  ) {
    return "Beyazlatma";
  }

  if (
    has([
      "çekim",
      "gömülü",
      "yirmilik",
    ])
  ) {
    return "Çekim";
  }

  if (
    has([
      "protez",
      "damak",
    ])
  ) {
    return "Protez";
  }

  if (
    has([
      "periodont",
      "diş eti",
    ])
  ) {
    return "Diş Eti";
  }

  return "Genel";
}

function safeClinicName(
  post: PostItem,
): string {
  const clinic =
    post.clinic;

  if (!clinic) {
    return "Klinik";
  }

  return clinic.isActive
    ? clinic.name
    : "Klinik";
}

function formatDateTR(
  date: Date | null,
): string {
  if (!date) {
    return "";
  }

  return new Date(
    date,
  ).toLocaleDateString(
    "tr-TR",
  );
}

export default async function BlogIndexPage(): Promise<JSX.Element> {
  const posts =
    await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        publishedAt: {
          not: null,
        },
      },

      orderBy: {
        publishedAt:
          "desc",
      },

      take: 60,

      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,

        clinic: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

  return (
    <main className={styles.wrap}>
      <div className={styles.container}>
        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroGlowOne
            }
            aria-hidden
          />

          <div
            className={
              styles.heroGlowTwo
            }
            aria-hidden
          />

          <div
            className={
              styles.heroGrid
            }
          >
            <div>
              <div
                className={
                  styles.kicker
                }
              >
                <span
                  className={
                    styles.kickerIcon
                  }
                  aria-hidden
                >
                  📝
                </span>

                Blog

                <span
                  className={
                    styles.kickerDot
                  }
                >
                  •
                </span>

                <span>
                  Bilgilendirici içerikler
                </span>
              </div>

              <h1
                className={
                  styles.title
                }
              >
                Diş Blog Yazıları
              </h1>

              <p
                className={
                  styles.desc
                }
              >
                Diş tedavileri hakkında içerikler, klinik
                paylaşımları ve fiyatı etkileyen detaylar.
                <br />

                <strong>
                  Kesin fiyat muayene sonrası netleşir.
                </strong>
              </p>

              <div
                className={
                  styles.heroBadges
                }
              >
                <span>
                  🦷 Tedavi içerikleri
                </span>

                <span>
                  📚 Bilgilendirici yazılar
                </span>

                <span>
                  🏥 Klinik paylaşımları
                </span>
              </div>
            </div>

            <div
              className={
                styles.heroRight
              }
            >
              <div
                className={
                  styles.heroVisual
                }
                aria-hidden
              >
                <div
                  className={
                    styles.visualGlow
                  }
                />

                <div
                  className={
                    styles.visualTooth
                  }
                >
                  🦷
                </div>

                <div
                  className={
                    styles.visualCard
                  }
                >
                  <div
                    className={
                      styles.visualCardIcon
                    }
                  >
                    📝
                  </div>

                  <div>
                    <strong>
                      Güncel içerikler
                    </strong>

                    <span>
                      Diş tedavilerini daha iyi tanı
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.actions
                }
              >
                <Link
                  href="/teklif-al"
                  className={
                    styles.primaryBtn
                  }
                >
                  Teklif Al →
                </Link>

                <Link
                  href="/"
                  className={
                    styles.secondaryBtn
                  }
                >
                  Ana sayfa →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.blogSection
          }
        >
          <div
            className={
              styles.toolbar
            }
          >
            <div>
              <div
                className={
                  styles.sectionKicker
                }
              >
                Son Yazılar
              </div>

              <h2
                className={
                  styles.sectionTitle
                }
              >
                Diş sağlığı hakkında içerikler
              </h2>
            </div>

            <div
              className={
                styles.count
              }
            >
              {posts.length} yazı
            </div>
          </div>

          {posts.length ===
          0 ? (
            <div
              className={
                styles.empty
              }
            >
              Henüz yayınlanmış yazı yok.
            </div>
          ) : (
            <div
              className={
                styles.grid
              }
            >
              {posts.map(
                (
                  post,
                ) => {
                  const minutes =
                    calcReadingMinutesFromText(
                      post.content ||
                        post.excerpt ||
                        post.title,
                    );

                  const category =
                    pickCategoryFromText(
                      post.title,
                      post.excerpt,
                      post.content,
                    );

                  const date =
                    formatDateTR(
                      post.publishedAt,
                    );

                  const clinicName =
                    safeClinicName(
                      post,
                    );

                  const excerpt =
                    post.excerpt?.trim()
                      ? post.excerpt.trim()
                      : (() => {
                          const content =
                            (
                              post.content ||
                              ""
                            ).trim();

                          return (
                            content.slice(
                              0,
                              170,
                            ) +
                            (content.length >
                            170
                              ? "…"
                              : "")
                          );
                        })();

                  return (
                    <Link
                      key={
                        post.id
                      }
                      href={`/blog/${encodeURIComponent(
                        post.slug,
                      )}`}
                      className={
                        styles.card
                      }
                    >
                      <div
                        className={
                          styles.cardCover
                        }
                      >
                        <div
                          className={
                            styles.cardCoverGlow
                          }
                        />

                        <div
                          className={
                            styles.cardTooth
                          }
                          aria-hidden
                        >
                          🦷
                        </div>

                        <div
                          className={
                            styles.badges
                          }
                        >
                          <span
                            className={
                              styles.badge
                            }
                          >
                            {
                              category
                            }
                          </span>

                          {minutes ? (
                            <span
                              className={`${styles.badge} ${styles.badgeReading}`}
                            >
                              ⏱️ Okuma:{" "}
                              {
                                minutes
                              }{" "}
                              dk
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div
                        className={
                          styles.cardBody
                        }
                      >
                        <div
                          className={
                            styles.cardTop
                          }
                        >
                          <div
                            className={
                              styles.cardTitle
                            }
                          >
                            {
                              post.title
                            }
                          </div>

                          <span
                            className={
                              styles.arrow
                            }
                            aria-hidden
                          >
                            ↗
                          </span>
                        </div>

                        <div
                          className={
                            styles.excerpt
                          }
                        >
                          {
                            excerpt
                          }
                        </div>

                        <div
                          className={
                            styles.metaRow
                          }
                        >
                          <span
                            className={
                              styles.meta
                            }
                          >
                            📅{" "}
                            {
                              date
                            }
                          </span>

                          <span
                            className={
                              styles.meta
                            }
                          >
                            🏥{" "}
                            {
                              clinicName
                            }
                          </span>
                        </div>

                        <div
                          className={
                            styles.cardFooter
                          }
                        >
                          <span
                            className={
                              styles.readMore
                            }
                          >
                            Devamını oku →
                          </span>

                          <span
                            className={
                              styles.articleTag
                            }
                          >
                            Bilgilendirici içerik
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </section>

        <div
          className={
            styles.bottomNote
          }
        >
          <span
            aria-hidden
          >
            🛡️
          </span>

          <div>
            <strong>
              Bilgilendirme:
            </strong>{" "}

            Blog içerikleri bilgilendirme amaçlıdır; tıbbi
            teşhis/tavsiye değildir. Kesin fiyat muayene
            sonrası netleşir.
          </div>
        </div>
      </div>
    </main>
  );
}