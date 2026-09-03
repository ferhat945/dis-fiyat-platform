"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import styles from "./page.module.css";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

type ListResp =
  | {
      ok: true;
      posts: Post[];
    }
  | {
      ok: false;
      code: string;
    };

type CreateResp =
  | {
      ok: true;
      post: Post;
    }
  | {
      ok: false;
      code: string;
    };

type PublishResp =
  | {
      ok: true;
      post: {
        id: string;
        isPublished: boolean;
        publishedAt: string | null;
      };
    }
  | {
      ok: false;
      code: string;
    };

type DeleteResp =
  | {
      ok: true;
    }
  | {
      ok: false;
      code: string;
    };

function trimMax(
  value: string,
  max: number,
): string {
  return value.slice(
    0,
    max,
  );
}

function fmtDT(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleString(
    "tr-TR",
  );
}

export default function PanelBlogPage(): JSX.Element {
  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      false,
    );

  const [
    err,
    setErr,
  ] =
    useState<
      string | null
    >(null);

  const [
    posts,
    setPosts,
  ] =
    useState<Post[]>(
      [],
    );

  const [
    title,
    setTitle,
  ] =
    useState<string>(
      "",
    );

  const [
    excerpt,
    setExcerpt,
  ] =
    useState<string>(
      "",
    );

  const [
    content,
    setContent,
  ] =
    useState<string>(
      "",
    );

  const [
    tab,
    setTab,
  ] =
    useState<
      | "all"
      | "published"
      | "draft"
    >("all");

  const titleLen =
    title.trim().length;

  const excerptLen =
    excerpt.trim().length;

  const contentLen =
    content.trim().length;

  const canCreate =
    titleLen >= 8 &&
    contentLen >= 50;

  const titleProgress =
    Math.min(
      100,
      Math.round(
        (titleLen / 8) *
          100,
      ),
    );

  const contentProgress =
    Math.min(
      100,
      Math.round(
        (contentLen / 50) *
          100,
      ),
    );

  const load =
    async (): Promise<void> => {
      setLoading(
        true,
      );

      setErr(
        null,
      );

      try {
        const response =
          await fetch(
            "/api/panel/blog-posts",
            {
              cache:
                "no-store",
            },
          );

        const data =
          (await response.json()) as ListResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.ok
              ? "UNKNOWN"
              : data.code,
          );
        }

        setPosts(
          data.posts,
        );
      } catch (
        error: unknown
      ) {
        setErr(
          error instanceof
            Error
            ? error.message
            : "NETWORK_ERROR",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  useEffect(() => {
    void load();
  }, []);

  const create =
    async (): Promise<void> => {
      if (
        !canCreate
      ) {
        return;
      }

      setErr(
        null,
      );

      setLoading(
        true,
      );

      try {
        const response =
          await fetch(
            "/api/panel/blog-posts",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    title:
                      title.trim(),

                    excerpt:
                      excerpt.trim() ||
                      undefined,

                    content:
                      content.trim(),
                  },
                ),
            },
          );

        const data =
          (await response.json()) as CreateResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.ok
              ? "UNKNOWN"
              : data.code,
          );
        }

        setTitle(
          "",
        );

        setExcerpt(
          "",
        );

        setContent(
          "",
        );

        await load();
      } catch (
        error: unknown
      ) {
        setErr(
          error instanceof
            Error
            ? error.message
            : "NETWORK_ERROR",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  const togglePublish =
    async (
      id: string,
      publish: boolean,
    ): Promise<void> => {
      setErr(
        null,
      );

      setLoading(
        true,
      );

      try {
        const response =
          await fetch(
            `/api/panel/blog-posts/${encodeURIComponent(
              id,
            )}/publish`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    publish,
                  },
                ),
            },
          );

        const data =
          (await response.json()) as PublishResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.ok
              ? "UNKNOWN"
              : data.code,
          );
        }

        await load();
      } catch (
        error: unknown
      ) {
        setErr(
          error instanceof
            Error
            ? error.message
            : "NETWORK_ERROR",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  const remove =
    async (
      id: string,
    ): Promise<void> => {
      setErr(
        null,
      );

      setLoading(
        true,
      );

      try {
        const response =
          await fetch(
            `/api/panel/blog-posts/${encodeURIComponent(
              id,
            )}`,
            {
              method:
                "DELETE",
            },
          );

        const data =
          (await response.json()) as DeleteResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data.ok
              ? "UNKNOWN"
              : data.code,
          );
        }

        await load();
      } catch (
        error: unknown
      ) {
        setErr(
          error instanceof
            Error
            ? error.message
            : "NETWORK_ERROR",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  const sorted =
    useMemo(
      () =>
        [
          ...posts,
        ].sort(
          (
            a,
            b,
          ) =>
            a.updatedAt <
            b.updatedAt
              ? 1
              : -1,
        ),
      [
        posts,
      ],
    );

  const filtered =
    useMemo(() => {
      if (
        tab ===
        "published"
      ) {
        return sorted.filter(
          (
            post,
          ) =>
            post.isPublished,
        );
      }

      if (
        tab ===
        "draft"
      ) {
        return sorted.filter(
          (
            post,
          ) =>
            !post.isPublished,
        );
      }

      return sorted;
    }, [
      sorted,
      tab,
    ]);

  const publishedCount =
    useMemo(
      () =>
        posts.filter(
          (
            post,
          ) =>
            post.isPublished,
        ).length,
      [
        posts,
      ],
    );

  const draftCount =
    useMemo(
      () =>
        posts.filter(
          (
            post,
          ) =>
            !post.isPublished,
        ).length,
      [
        posts,
      ],
    );

  return (
    <main
      className={
        styles.page
      }
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.heroDecor
          }
          aria-hidden
        />

        <div
          className={
            styles.heroContent
          }
        >
          <div
            className={
              styles.kicker
            }
          >
            <span
              className={
                styles.kickerIcon
              }
            >
              ✎
            </span>

            Klinik Blog
            Yönetimi
          </div>

          <h1
            className={
              styles.h1
            }
          >
            Blog
          </h1>

          <p
            className={
              styles.sub
            }
          >
            Hastalarına
            değer katan
            içerikler üret,
            bilgini paylaş
            ve kliniğinin
            dijital
            görünürlüğünü
            güçlendir.
          </p>
        </div>

        <div
          className={
            styles.statsRow
          }
        >
          <div
            className={
              styles.statCard
            }
          >
            <div
              className={`${styles.statIcon} ${styles.statIconPublished}`}
            >
              ✍
            </div>

            <div>
              <div
                className={
                  styles.statLabel
                }
              >
                Yayında
              </div>

              <div
                className={
                  styles.statValue
                }
              >
                {
                  publishedCount
                }
              </div>

              <div
                className={
                  styles.statHint
                }
              >
                Yayındaki
                yazılar
              </div>
            </div>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <div
              className={`${styles.statIcon} ${styles.statIconDraft}`}
            >
              ▤
            </div>

            <div>
              <div
                className={
                  styles.statLabel
                }
              >
                Taslak
              </div>

              <div
                className={
                  styles.statValue
                }
              >
                {
                  draftCount
                }
              </div>

              <div
                className={
                  styles.statHint
                }
              >
                Taslak
                yazılar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}

      {err ? (
        <div
          className={
            styles.msgErr
          }
        >
          <div
            className={
              styles.errorIcon
            }
          >
            !
          </div>

          <div>
            <strong>
              İşlem
              tamamlanamadı
            </strong>

            <span>
              {err}
            </span>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div
        className={
          styles.grid
        }
      >
        {/* ===================================================
            CREATE POST
        =================================================== */}

        <section
          className={
            styles.editorCard
          }
        >
          <header
            className={
              styles.editorHeader
            }
          >
            <div
              className={
                styles.editorTitleGroup
              }
            >
              <div
                className={
                  styles.editorIcon
                }
              >
                ✎
              </div>

              <div>
                <div
                  className={
                    styles.cardTitle
                  }
                >
                  Yeni Yazı
                  Oluştur
                  <span
                    className={
                      styles.sparkle
                    }
                  >
                    ✦
                  </span>
                </div>

                <div
                  className={
                    styles.cardSub
                  }
                >
                  Başlık,
                  içerik ve
                  özet
                  ekleyerek
                  yazını
                  hazırla.
                </div>
              </div>
            </div>

            <button
              className={
                styles.refreshBtn
              }
              type="button"
              disabled={
                loading
              }
              onClick={() =>
                void load()
              }
            >
              <span>
                ↻
              </span>

              {loading
                ? "Yükleniyor"
                : "Yenile"}
            </button>
          </header>

          <div
            className={
              styles.editorBody
            }
          >
            {/* TITLE */}

            <div
              className={
                styles.field
              }
            >
              <div
                className={
                  styles.labelRow
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="blog-title"
                >
                  Başlık
                </label>

                <div
                  className={
                    styles.counter
                  }
                >
                  <span>
                    {
                      titleLen
                    }
                    /120
                  </span>

                  <span
                    className={
                      styles.counterDot
                    }
                  >
                    •
                  </span>

                  <span>
                    min 8
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.inputFrame
                }
              >
                <div
                  className={
                    styles.icon
                  }
                >
                  Tt
                </div>

                <input
                  id="blog-title"
                  className={
                    styles.input
                  }
                  value={
                    title
                  }
                  onChange={(
                    event,
                  ) =>
                    setTitle(
                      trimMax(
                        event
                          .target
                          .value,
                        120,
                      ),
                    )
                  }
                  placeholder="Örneğin: İmplant Tedavisi Öncesi Bilinmesi Gerekenler"
                />
              </div>

              {titleLen >
              0 ? (
                <div
                  className={
                    styles.fieldProgress
                  }
                >
                  <div
                    className={
                      styles.fieldProgressTrack
                    }
                  >
                    <div
                      className={
                        styles.fieldProgressFill
                      }
                      style={{
                        width: `${titleProgress}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* EXCERPT */}

            <div
              className={
                styles.field
              }
            >
              <div
                className={
                  styles.labelRow
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="blog-excerpt"
                >
                  Özet{" "}
                  <span
                    className={
                      styles.optional
                    }
                  >
                    (opsiyonel)
                  </span>
                </label>

                <div
                  className={
                    styles.counter
                  }
                >
                  {
                    excerptLen
                  }
                  /320
                </div>
              </div>

              <div
                className={
                  styles.inputFrame
                }
              >
                <div
                  className={
                    styles.icon
                  }
                >
                  ≡
                </div>

                <input
                  id="blog-excerpt"
                  className={
                    styles.input
                  }
                  value={
                    excerpt
                  }
                  onChange={(
                    event,
                  ) =>
                    setExcerpt(
                      trimMax(
                        event
                          .target
                          .value,
                        320,
                      ),
                    )
                  }
                  placeholder="Kısa bir özet yazın; blog kartında görüntülenecek."
                />
              </div>
            </div>

            {/* CONTENT */}

            <div
              className={
                styles.field
              }
            >
              <div
                className={
                  styles.labelRow
                }
              >
                <label
                  className={
                    styles.label
                  }
                  htmlFor="blog-content"
                >
                  İçerik
                </label>

                <div
                  className={
                    styles.counter
                  }
                >
                  <span>
                    {
                      contentLen
                    }
                  </span>

                  <span
                    className={
                      styles.counterDot
                    }
                  >
                    •
                  </span>

                  <span>
                    min 50
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.writer
                }
              >
                <div
                  className={
                    styles.writerTop
                  }
                >
                  <div
                    className={
                      styles.writerMode
                    }
                  >
                    <span>
                      ✎
                    </span>

                    Yazım alanı
                  </div>

                  <div
                    className={
                      styles.writerHint
                    }
                  >
                    Düz metin
                    içeriği
                  </div>
                </div>

                <textarea
                  id="blog-content"
                  className={
                    styles.textarea
                  }
                  value={
                    content
                  }
                  onChange={(
                    event,
                  ) =>
                    setContent(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Yazınızı buraya yazın...

Hastanın anlayabileceği sade bir dil kullanın. Tedavi sürecini, merak edilen noktaları ve önemli bilgileri açık şekilde anlatabilirsiniz."
                />

                <div
                  className={
                    styles.writerFooter
                  }
                >
                  <span>
                    💡 Paragrafları
                    kısa tutmak
                    okunabilirliği
                    artırır.
                  </span>

                  <strong>
                    {
                      contentLen
                    }{" "}
                    karakter
                  </strong>
                </div>
              </div>

              {contentLen >
              0 ? (
                <div
                  className={
                    styles.fieldProgress
                  }
                >
                  <div
                    className={
                      styles.fieldProgressTrack
                    }
                  >
                    <div
                      className={
                        styles.fieldProgressFill
                      }
                      style={{
                        width: `${contentProgress}%`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* ACTION */}

            <div
              className={
                styles.actions
              }
            >
              <button
                className={
                  styles.btnPrimary
                }
                type="button"
                disabled={
                  loading ||
                  !canCreate
                }
                onClick={() =>
                  void create()
                }
              >
                <span
                  className={
                    styles.btnIcon
                  }
                >
                  ✎
                </span>

                {loading
                  ? "Kaydediliyor..."
                  : "Yazıyı Kaydet"}
              </button>

              <div
                className={
                  styles.helperRight
                }
              >
                {canCreate ? (
                  <span
                    className={
                      styles.badgeOk
                    }
                  >
                    <span>
                      ✓
                    </span>

                    Kaydetmeye
                    hazır
                  </span>
                ) : (
                  <span
                    className={
                      styles.badgeMuted
                    }
                  >
                    Başlık ≥ 8,
                    içerik ≥ 50
                    olmalı
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            POSTS
        =================================================== */}

        <section
          className={
            styles.postsCard
          }
        >
          <header
            className={
              styles.postsHeader
            }
          >
            <div
              className={
                styles.editorTitleGroup
              }
            >
              <div
                className={`${styles.editorIcon} ${styles.postsIcon}`}
              >
                ◫
              </div>

              <div>
                <div
                  className={
                    styles.cardTitle
                  }
                >
                  Yazılarım
                </div>

                <div
                  className={
                    styles.cardSub
                  }
                >
                  Yayın ve
                  taslak
                  durumunu
                  yönet.
                </div>
              </div>
            </div>

            <div
              className={
                styles.totalBadge
              }
            >
              {
                posts.length
              }{" "}
              yazı
            </div>
          </header>

          <div
            className={
              styles.tabs
            }
          >
            <button
              type="button"
              className={tabBtn(
                tab ===
                  "all",
              )}
              onClick={() =>
                setTab(
                  "all",
                )
              }
            >
              Tümü
              <span>
                {
                  posts.length
                }
              </span>
            </button>

            <button
              type="button"
              className={tabBtn(
                tab ===
                  "published",
              )}
              onClick={() =>
                setTab(
                  "published",
                )
              }
            >
              Yayında
              <span>
                {
                  publishedCount
                }
              </span>
            </button>

            <button
              type="button"
              className={tabBtn(
                tab ===
                  "draft",
              )}
              onClick={() =>
                setTab(
                  "draft",
                )
              }
            >
              Taslak
              <span>
                {
                  draftCount
                }
              </span>
            </button>
          </div>

          <div
            className={
              styles.postsBody
            }
          >
            {filtered.length ===
            0 ? (
              <div
                className={
                  styles.empty
                }
              >
                <div
                  className={
                    styles.emptyVisual
                  }
                >
                  <div
                    className={
                      styles.emptyPaper
                    }
                  >
                    <span />
                    <span />
                    <span />
                  </div>

                  <div
                    className={
                      styles.emptyPencil
                    }
                  >
                    ✎
                  </div>
                </div>

                <h3>
                  Henüz yazı
                  yok.
                </h3>

                <p>
                  İlk yazını
                  oluştur,
                  kaydet ve
                  hastalarınla
                  paylaş.
                </p>

                <div
                  className={
                    styles.emptyHint
                  }
                >
                  Soldaki formdan
                  birkaç dakika
                  içinde ilk
                  içeriğini
                  hazırlayabilirsin.
                </div>
              </div>
            ) : (
              <div
                className={
                  styles.list
                }
              >
                {filtered.map(
                  (
                    post,
                  ) => (
                    <article
                      key={
                        post.id
                      }
                      className={
                        styles.item
                      }
                    >
                      <div
                        className={
                          styles.itemAccent
                        }
                      />

                      <div
                        className={
                          styles.itemHead
                        }
                      >
                        <div
                          className={
                            styles.itemTitleWrap
                          }
                        >
                          <div
                            className={
                              styles.itemIcon
                            }
                          >
                            ✎
                          </div>

                          <div>
                            <div
                              className={
                                styles.itemTitle
                              }
                            >
                              {
                                post.title
                              }
                            </div>

                            <div
                              className={
                                styles.itemSlug
                              }
                            >
                              /blog/
                              {
                                post.slug
                              }
                            </div>
                          </div>
                        </div>

                        <span
                          className={`${styles.statusPill} ${
                            post.isPublished
                              ? styles.statusOn
                              : styles.statusOff
                          }`}
                        >
                          <span
                            className={
                              styles.statusDot
                            }
                          />

                          {post.isPublished
                            ? "Yayında"
                            : "Taslak"}
                        </span>
                      </div>

                      {post.excerpt ? (
                        <div
                          className={
                            styles.excerpt
                          }
                        >
                          {
                            post.excerpt
                          }
                        </div>
                      ) : null}

                      <div
                        className={
                          styles.metaRow
                        }
                      >
                        <span
                          className={
                            styles.metaChip
                          }
                        >
                          🕒 Güncellendi:{" "}
                          {fmtDT(
                            post.updatedAt,
                          )}
                        </span>

                        {post.publishedAt ? (
                          <span
                            className={
                              styles.metaChip
                            }
                          >
                            📣 Yayın:{" "}
                            {fmtDT(
                              post.publishedAt,
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div
                        className={
                          styles.itemActions
                        }
                      >
                        <button
                          type="button"
                          className={
                            post.isPublished
                              ? styles.btnGhost
                              : styles.btnPublish
                          }
                          disabled={
                            loading
                          }
                          onClick={() =>
                            void togglePublish(
                              post.id,
                              !post.isPublished,
                            )
                          }
                        >
                          {post.isPublished
                            ? "Yayından Kaldır"
                            : "Yayınla"}
                        </button>

                        <Link
                          className={
                            styles.btnGhostLink
                          }
                          href={`/blog/${encodeURIComponent(
                            post.slug,
                          )}`}
                          target="_blank"
                        >
                          Görüntüle
                          ↗
                        </Link>

                        <button
                          type="button"
                          className={
                            styles.btnDangerSoft
                          }
                          disabled={
                            loading
                          }
                          onClick={() =>
                            void remove(
                              post.id,
                            )
                          }
                        >
                          Sil
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </div>

          <div
            className={
              styles.subscriptionNote
            }
          >
            <div
              className={
                styles.subscriptionIcon
              }
            >
              🛡
            </div>

            <div>
              <strong>
                Yayınlama
                bilgisi
              </strong>

              <p>
                Yazı
                oluşturabilir
                ve taslaklarını
                yönetebilirsin.
                Yayınlama
                işlemi aktif
                abonelik
                koşullarına
                tabidir.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          TIP
      ===================================================== */}

      <section
        className={
          styles.bottomTip
        }
      >
        <div
          className={
            styles.bottomTipLeft
          }
        >
          <div
            className={
              styles.bottomTipIcon
            }
          >
            💡
          </div>

          <div>
            <strong>
              Düzenli içerik,
              daha güçlü bir
              klinik profili.
            </strong>

            <p>
              Hastaların en çok
              merak ettiği
              tedavileri,
              süreçleri ve sık
              sorulan soruları
              blog yazılarına
              dönüştürebilirsin.
            </p>
          </div>
        </div>

        <div
          className={
            styles.tipChips
          }
        >
          <span>
            🦷 Tedaviler
          </span>

          <span>
            ❓ Sık Sorulanlar
          </span>

          <span>
            📚 Bilgilendirme
          </span>
        </div>
      </section>
    </main>
  );
}

function tabBtn(
  active: boolean,
): string {
  return active
    ? `${styles.tab} ${styles.tabActive}`
    : styles.tab;
}