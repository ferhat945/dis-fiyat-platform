import Link from "next/link";
import React from "react";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export const dynamic =
  "force-dynamic";

function formatDate(
  value: Date | null
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(value);
}

export default async function AdminBlogListPage(): Promise<React.ReactElement> {
  await requireAdmin();

  const posts =
    await prisma.blogPost.findMany({
      orderBy: [
        {
          isPublished:
            "desc",
        },
        {
          publishedAt:
            "desc",
        },
        {
          updatedAt:
            "desc",
        },
      ],

      take: 300,

      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        isPublished: true,
        publishedAt: true,
        updatedAt: true,

        clinic: {
          select: {
            name: true,
          },
        },
      },
    });

  const publishedCount =
    posts.filter(
      (post) =>
        post.isPublished
    ).length;

  const draftCount =
    posts.length -
    publishedCount;

  const clinicPostCount =
    posts.filter(
      (post) =>
        Boolean(
          post.clinic
        )
    ).length;

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <div className="adminStatLabel">
            Toplam Yazı
          </div>

          <div className="adminStatValue">
            {posts.length}
          </div>

          <div className="adminStatMeta">
            Sistemdeki blog yazıları
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Yayında
          </div>

          <div className="adminStatValue">
            {publishedCount}
          </div>

          <div className="adminStatMeta">
            Ziyaretçiye açık yazılar
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Taslak
          </div>

          <div className="adminStatValue">
            {draftCount}
          </div>

          <div className="adminStatMeta">
            Henüz yayınlanmamış
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Klinik Yazısı
          </div>

          <div className="adminStatValue">
            {clinicPostCount}
          </div>

          <div className="adminStatMeta">
            Kliniğe bağlı içerikler
          </div>
        </div>
      </section>

      <section
        className="adminCard"
        style={{
          overflow: "hidden",
          border: 0,
          color: "white",
          background:
            "linear-gradient(135deg,#101828,#18233d 62%,#4338ca 150%)",
        }}
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 20,
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <div
              style={{
                color:
                  "rgba(255,255,255,.45)",
                fontSize: 9,
                fontWeight: 750,
              }}
            >
              İÇERİK MERKEZİ
            </div>

            <h2
              style={{
                margin:
                  "7px 0 0",
                fontSize: 24,
                letterSpacing:
                  "-.04em",
              }}
            >
              Blog içeriklerini yönet.
            </h2>

            <p
              style={{
                maxWidth: 570,
                margin:
                  "8px 0 0",
                color:
                  "rgba(255,255,255,.55)",
                fontSize: 10,
                lineHeight: 1.7,
              }}
            >
              Yeni SEO içerikleri oluştur,
              mevcut yazıları düzenle ve
              yayın durumlarını takip et.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 9,
              flexWrap:
                "wrap",
            }}
          >
            <Link
              href="/admin/blog/new"
              className="adminButton"
              style={{
                background:
                  "white",
                color:
                  "#101828",
              }}
            >
              + Yeni Yazı
            </Link>

            <Link
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="adminButton"
              style={{
                border:
                  "1px solid rgba(255,255,255,.14)",
                background:
                  "rgba(255,255,255,.06)",
                color: "white",
              }}
            >
              Blogu Gör ↗
            </Link>
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Blog Yazıları
            </h2>

            <p>
              Son 300 içerik kaydı.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {posts.length} kayıt
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="adminEmptyState">
            <strong>
              Henüz blog yazısı yok
            </strong>

            <p>
              İlk içeriğini oluşturmak
              için Yeni Yazı butonunu
              kullan.
            </p>
          </div>
        ) : (
          <div className="adminTableScroll">
            <table
              className="adminTable"
              style={{
                minWidth: 1050,
              }}
            >
              <thead>
                <tr>
                  <th>Yazı</th>
                  <th>Slug</th>
                  <th>Yayın Durumu</th>
                  <th>Yayın Tarihi</th>
                  <th>Güncelleme</th>
                  <th>Yazar / Klinik</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {posts.map(
                  (post) => (
                    <tr
                      key={post.id}
                    >
                      <td>
                        <div
                          style={{
                            maxWidth:
                              330,
                          }}
                        >
                          <div
                            style={{
                              color:
                                "#101828",
                              fontSize:
                                10,
                              fontWeight:
                                800,
                              lineHeight:
                                1.45,
                            }}
                          >
                            {
                              post.title
                            }
                          </div>

                          {post.excerpt ? (
                            <div
                              style={{
                                marginTop:
                                  4,
                                overflow:
                                  "hidden",
                                color:
                                  "#98a2b3",
                                fontSize:
                                  8,
                                lineHeight:
                                  1.5,
                                display:
                                  "-webkit-box",
                                WebkitLineClamp:
                                  2,
                                WebkitBoxOrient:
                                  "vertical",
                              }}
                            >
                              {
                                post.excerpt
                              }
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth:
                              220,
                            overflow:
                              "hidden",
                            color:
                              "#667085",
                            fontFamily:
                              "monospace",
                            fontSize:
                              8,
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                          title={
                            post.slug
                          }
                        >
                          /blog/
                          {post.slug}
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            post.isPublished
                              ? "adminBadge adminBadgeSuccess"
                              : "adminBadge adminBadgeWarning"
                          }
                        >
                          {post.isPublished
                            ? "● Yayında"
                            : "Taslak"}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          post.publishedAt
                        )}
                      </td>

                      <td>
                        {formatDate(
                          post.updatedAt
                        )}
                      </td>

                      <td>
                        <span className="adminBadge adminBadgeNeutral">
                          {post.clinic
                            ?.name ??
                            "DişFiyat360"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 7,
                            alignItems:
                              "center",
                          }}
                        >
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="adminButton adminButtonPrimary"
                          >
                            Düzenle
                          </Link>

                          {post.isPublished ? (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="adminButton adminButtonSecondary"
                            >
                              Gör ↗
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}