"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

type ApiOk<T> = {
  ok: true;
} & T;

type ApiErr = {
  ok: false;
  code?: string;
  message?: string;
  issues?: Array<{
    path: string;
    message: string;
  }>;
};

type Props = {
  postId: string;
  onSaved?: (
    post: BlogPost
  ) => void;
  onDeleted?: () => void;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function readString(
  value: unknown,
  fallback = ""
): string {
  return typeof value === "string"
    ? value
    : fallback;
}

function readBool(
  value: unknown,
  fallback = false
): boolean {
  return typeof value === "boolean"
    ? value
    : fallback;
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function normalizeErrText(
  error: ApiErr | null
): string {
  const text =
    (
      error?.message ??
      error?.code ??
      ""
    ).trim();

  return (
    text ||
    "İşlem başarısız."
  );
}

function slugifyTR(
  input: string
): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .trim()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "c")
    .replace(/\s+/g, "-")
    .replace(
      /[^a-z0-9-]/g,
      ""
    )
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function countWords(
  text: string
): number {
  const clean =
    text
      .replace(/\s+/g, " ")
      .trim();

  if (!clean) {
    return 0;
  }

  return clean
    .split(" ")
    .filter(Boolean).length;
}

export default function AdminBlogEditor({
  postId,
  onSaved,
  onDeleted,
}: Props): JSX.Element {
  const router =
    useRouter();

  const isNew =
    postId === "new";

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      !isNew
    );

  const [
    saving,
    setSaving,
  ] =
    useState<boolean>(
      false
    );

  const [
    deleting,
    setDeleting,
  ] =
    useState<boolean>(
      false
    );

  const [
    title,
    setTitle,
  ] =
    useState<string>("");

  const [
    slug,
    setSlug,
  ] =
    useState<string>("");

  const [
    excerpt,
    setExcerpt,
  ] =
    useState<string>("");

  const [
    content,
    setContent,
  ] =
    useState<string>("");

  const [
    isPublished,
    setIsPublished,
  ] =
    useState<boolean>(
      false
    );

  const [
    msg,
    setMsg,
  ] =
    useState<{
      type: "ok" | "err";
      text: string;
    } | null>(null);

  const slugTouchedRef =
    useRef<boolean>(
      false
    );

  const canSave =
    useMemo<boolean>(() => {
      if (
        title.trim().length <
        3
      ) {
        return false;
      }

      if (
        content.trim().length <
        20
      ) {
        return false;
      }

      return true;
    }, [
      title,
      content,
    ]);

  const wordCount =
    useMemo(
      () =>
        countWords(
          content
        ),
      [content]
    );

  const estimatedMinutes =
    Math.max(
      1,
      Math.round(
        wordCount / 200
      )
    );

  useEffect(() => {
    if (isNew) {
      return;
    }

    let cancelled =
      false;

    async function loadInitialPost(): Promise<void> {
      setLoading(true);
      setMsg(null);

      try {
        const response =
          await fetch(
            `/api/admin/blog/${encodeURIComponent(
              postId
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const json: unknown =
          await response
            .json()
            .catch(
              () => null
            );

        if (cancelled) {
          return;
        }

        if (
          !response.ok ||
          !isRecord(json) ||
          json.ok !== true
        ) {
          const error =
            isRecord(json)
              ? (json as ApiErr)
              : null;

          setMsg({
            type: "err",
            text:
              normalizeErrText(
                error
              ),
          });

          return;
        }

        const result =
          json as ApiOk<{
            post: unknown;
          }>;

        if (
          !isRecord(
            result.post
          )
        ) {
          setMsg({
            type: "err",
            text:
              "Post okunamadı.",
          });

          return;
        }

        const post =
          result.post;

        slugTouchedRef.current =
          true;

        setTitle(
          readString(
            post.title
          )
        );

        setSlug(
          readString(
            post.slug
          )
        );

        setExcerpt(
          readString(
            post.excerpt
          )
        );

        setContent(
          readString(
            post.content
          )
        );

        setIsPublished(
          readBool(
            post.isPublished
          )
        );
      } catch {
        if (!cancelled) {
          setMsg({
            type: "err",
            text:
              "Yazı yüklenemedi.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialPost();

    return () => {
      cancelled = true;
    };
  }, [
    isNew,
    postId,
  ]);

  function handleTitleChange(
    value: string
  ): void {
    setTitle(value);

    if (
      !slugTouchedRef.current
    ) {
      setSlug(
        slugifyTR(value)
      );
    }
  }

  async function save(): Promise<void> {
    if (
      !canSave ||
      loading ||
      saving ||
      deleting
    ) {
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const payload = {
        title:
          title.trim(),

        slug:
          slug.trim() ||
          undefined,

        excerpt:
          excerpt.trim()
            ? excerpt.trim()
            : null,

        content,

        isPublished,
      };

      const response =
        await fetch(
          isNew
            ? "/api/admin/blog"
            : `/api/admin/blog/${encodeURIComponent(
                postId
              )}`,
          {
            method:
              isNew
                ? "POST"
                : "PATCH",

            headers: {
              "content-type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const json: unknown =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !isRecord(json) ||
        json.ok !== true
      ) {
        const error =
          isRecord(json)
            ? (json as ApiErr)
            : null;

        if (
          error?.issues
            ?.length
        ) {
          setMsg({
            type: "err",
            text:
              error.issues[0]
                ?.message ??
              "Doğrulama hatası.",
          });
        } else {
          setMsg({
            type: "err",
            text:
              normalizeErrText(
                error
              ),
          });
        }

        return;
      }

      const result =
        json as ApiOk<{
          post?: unknown;
        }>;

      if (
        isRecord(
          result.post
        )
      ) {
        const post =
          result.post;

        const savedPost: BlogPost =
          {
            id:
              readString(
                post.id
              ),

            title:
              readString(
                post.title
              ),

            slug:
              readString(
                post.slug
              ),

            excerpt:
              readNullableString(
                post.excerpt
              ),

            content:
              readString(
                post.content
              ),

            isPublished:
              readBool(
                post.isPublished
              ),

            publishedAt:
              readNullableString(
                post.publishedAt
              ),

            updatedAt:
              readString(
                post.updatedAt
              ),
          };

        setTitle(
          savedPost.title
        );

        setSlug(
          savedPost.slug
        );

        setExcerpt(
          savedPost.excerpt ??
            ""
        );

        setContent(
          savedPost.content
        );

        setIsPublished(
          savedPost.isPublished
        );

        slugTouchedRef.current =
          true;

        onSaved?.(
          savedPost
        );

        if (
          isNew &&
          savedPost.id
        ) {
          router.replace(
            `/admin/blog/${savedPost.id}`
          );

          router.refresh();
        }
      }

      setMsg({
        type: "ok",
        text:
          "Kaydedildi.",
      });
    } catch {
      setMsg({
        type: "err",
        text:
          "Kaydetme işlemi başarısız.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function del(): Promise<void> {
    if (
      isNew ||
      loading ||
      saving ||
      deleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Bu blog yazısını silmek istediğine emin misin?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMsg(null);

    try {
      const response =
        await fetch(
          `/api/admin/blog/${encodeURIComponent(
            postId
          )}`,
          {
            method:
              "DELETE",
          }
        );

      const json: unknown =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !isRecord(json) ||
        json.ok !== true
      ) {
        const error =
          isRecord(json)
            ? (json as ApiErr)
            : null;

        setMsg({
          type: "err",
          text:
            normalizeErrText(
              error
            ),
        });

        return;
      }

      setMsg({
        type: "ok",
        text: "Silindi.",
      });

      onDeleted?.();

      router.push(
        "/admin/blog"
      );

      router.refresh();
    } catch {
      setMsg({
        type: "err",
        text:
          "Silme işlemi başarısız.",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="adminCard">
        <div className="adminEmptyState">
          <strong>
            Yazı yükleniyor
          </strong>

          <p>
            Blog içeriği
            hazırlanıyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(0,1.65fr) minmax(280px,.75fr)",
        gap: 16,
        alignItems: "start",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        <section className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>
                İçerik
              </h2>

              <p>
                Başlık, özet ve blog
                metnini düzenle.
              </p>
            </div>

            <span className="adminBadge adminBadgeInfo">
              {isNew
                ? "Yeni Yazı"
                : "Düzenleme"}
            </span>
          </div>

          <div
            className="adminCardBody"
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <Field
              label="Başlık"
              note={`${title.length} karakter`}
            >
              <input
                className="adminInput"
                value={title}
                onChange={(
                  event
                ) =>
                  handleTitleChange(
                    event.target
                      .value
                  )
                }
                placeholder="Blog yazısı başlığı"
                style={{
                  height: 48,
                  fontSize: 13,
                  fontWeight: 750,
                }}
              />
            </Field>

            <Field
              label="Özet / Snippet"
              note={`${excerpt.length} karakter`}
            >
              <textarea
                className="adminTextarea"
                value={excerpt}
                onChange={(
                  event
                ) =>
                  setExcerpt(
                    event.target
                      .value
                  )
                }
                placeholder="Google sonuçlarında ve blog kartlarında kullanılacak kısa özet..."
                style={{
                  minHeight: 110,
                }}
              />
            </Field>

            <Field
              label="Blog İçeriği"
              note={`${wordCount} kelime · yaklaşık ${estimatedMinutes} dk`}
            >
              <textarea
                className="adminTextarea"
                value={content}
                onChange={(
                  event
                ) =>
                  setContent(
                    event.target
                      .value
                  )
                }
                placeholder="Blog içeriğini buraya yaz..."
                style={{
                  minHeight: 520,
                  fontFamily:
                    "inherit",
                  lineHeight: 1.8,
                }}
              />
            </Field>
          </div>
        </section>
      </div>

      <aside
        style={{
          display: "grid",
          gap: 14,
          position: "sticky",
          top: 96,
        }}
      >
        <section className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>
                Yayın Ayarları
              </h2>

              <p>
                URL ve yayın durumunu
                belirle.
              </p>
            </div>
          </div>

          <div
            className="adminCardBody"
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <Field
              label="Slug"
              note="Blog URL'si"
            >
              <input
                className="adminInput"
                value={slug}
                onChange={(
                  event
                ) => {
                  slugTouchedRef.current =
                    true;

                  setSlug(
                    event.target
                      .value
                  );
                }}
                placeholder="adana-implant-fiyatlari"
              />
            </Field>

            <div
              style={{
                padding: 11,
                border:
                  "1px solid #e7eaf0",
                borderRadius: 11,
                background:
                  "#fafbfc",
                color: "#667085",
                fontSize: 9,
                wordBreak:
                  "break-all",
              }}
            >
              /blog/
              <strong
                style={{
                  color:
                    "#344054",
                }}
              >
                {slug ||
                  "slug"}
              </strong>
            </div>

            <button
              type="button"
              className="adminButton adminButtonSecondary"
              onClick={() => {
                slugTouchedRef.current =
                  true;

                setSlug(
                  slugifyTR(
                    title
                  )
                );
              }}
            >
              Slugı Başlıktan Üret
            </button>

            <div
              style={{
                height: 1,
                background:
                  "#eaecf0",
              }}
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 12,
                padding: 12,
                border:
                  "1px solid #e7eaf0",
                borderRadius: 12,
                background:
                  isPublished
                    ? "#ecfdf3"
                    : "#fafbfc",
                cursor: "pointer",
              }}
            >
              <div>
                <div
                  style={{
                    color:
                      "#344054",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  Yayın Durumu
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color:
                      "#98a2b3",
                    fontSize: 8,
                  }}
                >
                  {isPublished
                    ? "Yazı yayında"
                    : "Taslak olarak saklanacak"}
                </div>
              </div>

              <input
                type="checkbox"
                checked={
                  isPublished
                }
                onChange={(
                  event
                ) =>
                  setIsPublished(
                    event.target
                      .checked
                  )
                }
              />
            </label>

            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background:
                  "#f0efff",
                color: "#5148e5",
                fontSize: 9,
                lineHeight: 1.6,
              }}
            >
              SEO için başlıkta yaklaşık
              50–60, özette 120–160
              karakter hedeflemek faydalı
              olur.
            </div>
          </div>
        </section>

        <section className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>
                İşlemler
              </h2>

              <p>
                Kaydet veya yazıyı sil.
              </p>
            </div>
          </div>

          <div
            className="adminCardBody"
            style={{
              display: "grid",
              gap: 9,
            }}
          >
            <button
              type="button"
              className="adminButton adminButtonPrimary"
              disabled={
                !canSave ||
                loading ||
                saving ||
                deleting
              }
              onClick={() =>
                void save()
              }
              style={{
                minHeight: 44,
              }}
            >
              {saving
                ? "Kaydediliyor..."
                : isNew
                  ? "Yazıyı Oluştur →"
                  : "Değişiklikleri Kaydet"}
            </button>

            {!isNew ? (
              <button
                type="button"
                className="adminButton adminButtonDanger"
                disabled={
                  saving ||
                  deleting
                }
                onClick={() =>
                  void del()
                }
              >
                {deleting
                  ? "Siliniyor..."
                  : "Yazıyı Sil"}
              </button>
            ) : null}

            {msg ? (
              <div
                style={{
                  padding: 11,
                  border:
                    msg.type ===
                    "ok"
                      ? "1px solid #abefc6"
                      : "1px solid #fecdca",
                  borderRadius: 11,
                  background:
                    msg.type ===
                    "ok"
                      ? "#ecfdf3"
                      : "#fef3f2",
                  color:
                    msg.type ===
                    "ok"
                      ? "#067647"
                      : "#b42318",
                  fontSize: 9,
                  fontWeight: 750,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}

function Field({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children:
    React.ReactNode;
}): JSX.Element {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          gap: 10,
          alignItems:
            "center",
        }}
      >
        <span
          style={{
            color:
              "#344054",
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {label}
        </span>

        {note ? (
          <span
            style={{
              color:
                "#98a2b3",
              fontSize: 8,
            }}
          >
            {note}
          </span>
        ) : null}
      </div>

      {children}
    </label>
  );
}