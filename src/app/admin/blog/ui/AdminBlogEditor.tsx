"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  onSaved?: (post: BlogPost) => void;
  onDeleted?: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function readBool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeErrText(error: ApiErr | null): string {
  const text = (error?.message ?? error?.code ?? "").trim();

  return text || "İşlem başarısız.";
}

function slugifyTR(input: string): string {
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
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminBlogEditor({
  postId,
  onSaved,
  onDeleted,
}: Props): JSX.Element {
  const isNew = postId === "new";

  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const [msg, setMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const slugTouchedRef = useRef<boolean>(false);

  const canSave = useMemo<boolean>(() => {
    if (title.trim().length < 3) {
      return false;
    }

    if (content.trim().length < 20) {
      return false;
    }

    return true;
  }, [title, content]);

  async function loadPost(): Promise<void> {
    if (isNew) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const response = await fetch(
        `/api/admin/blog/${encodeURIComponent(postId)}`,
        {
          cache: "no-store",
        },
      );

      const json: unknown = await response.json().catch(() => null);

      if (!response.ok || !isRecord(json) || json.ok !== true) {
        const error = isRecord(json) ? (json as ApiErr) : null;

        setMsg({
          type: "err",
          text: normalizeErrText(error),
        });

        return;
      }

      const result = json as ApiOk<{
        post: unknown;
      }>;

      if (!isRecord(result.post)) {
        setMsg({
          type: "err",
          text: "Post okunamadı.",
        });

        return;
      }

      const post = result.post;

      slugTouchedRef.current = true;

      setTitle(readString(post.title));
      setSlug(readString(post.slug));
      setExcerpt(readString(post.excerpt));
      setContent(readString(post.content));
      setIsPublished(readBool(post.isPublished));
    } catch {
      setMsg({
        type: "err",
        text: "Yazı yüklenemedi.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function save(): Promise<void> {
    if (!canSave || loading || saving || deleting) {
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() ? excerpt.trim() : null,
        content,
        isPublished,
      };

      const response = await fetch(
        isNew
          ? "/api/admin/blog"
          : `/api/admin/blog/${encodeURIComponent(postId)}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const json: unknown = await response.json().catch(() => null);

      if (!response.ok || !isRecord(json) || json.ok !== true) {
        const error = isRecord(json) ? (json as ApiErr) : null;

        if (error?.issues?.length) {
          setMsg({
            type: "err",
            text:
              error.issues[0]?.message ??
              "Doğrulama hatası.",
          });
        } else {
          setMsg({
            type: "err",
            text: normalizeErrText(error),
          });
        }

        return;
      }

      const result = json as ApiOk<{
        post?: unknown;
      }>;

      if (isRecord(result.post)) {
        const post = result.post;

        const savedPost: BlogPost = {
          id: readString(post.id),
          title: readString(post.title),
          slug: readString(post.slug),
          excerpt: readNullableString(post.excerpt),
          content: readString(post.content),
          isPublished: readBool(post.isPublished),
          publishedAt: readNullableString(post.publishedAt),
          updatedAt: readString(post.updatedAt),
        };

        setTitle(savedPost.title);
        setSlug(savedPost.slug);
        setExcerpt(savedPost.excerpt ?? "");
        setContent(savedPost.content);
        setIsPublished(savedPost.isPublished);
        slugTouchedRef.current = true;

        onSaved?.(savedPost);
      }

      setMsg({
        type: "ok",
        text: "Kaydedildi ✅",
      });
    } catch {
      setMsg({
        type: "err",
        text: "Kaydetme işlemi başarısız.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function del(): Promise<void> {
    if (isNew || loading || saving || deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Bu blog yazısını silmek istediğine emin misin?",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMsg(null);

    try {
      const response = await fetch(
        `/api/admin/blog/${encodeURIComponent(postId)}`,
        {
          method: "DELETE",
        },
      );

      const json: unknown = await response.json().catch(() => null);

      if (!response.ok || !isRecord(json) || json.ok !== true) {
        const error = isRecord(json) ? (json as ApiErr) : null;

        setMsg({
          type: "err",
          text: normalizeErrText(error),
        });

        return;
      }

      setMsg({
        type: "ok",
        text: "Silindi.",
      });

      onDeleted?.();
    } catch {
      setMsg({
        type: "err",
        text: "Silme işlemi başarısız.",
      });
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadInitialPost(): Promise<void> {
      try {
        const response = await fetch(
          `/api/admin/blog/${encodeURIComponent(postId)}`,
          {
            cache: "no-store",
          },
        );

        const json: unknown = await response.json().catch(() => null);

        if (cancelled) {
          return;
        }

        if (!response.ok || !isRecord(json) || json.ok !== true) {
          const error = isRecord(json) ? (json as ApiErr) : null;

          setMsg({
            type: "err",
            text: normalizeErrText(error),
          });

          return;
        }

        const result = json as ApiOk<{
          post: unknown;
        }>;

        if (!isRecord(result.post)) {
          setMsg({
            type: "err",
            text: "Post okunamadı.",
          });

          return;
        }

        const post = result.post;

        slugTouchedRef.current = true;

        setTitle(readString(post.title));
        setSlug(readString(post.slug));
        setExcerpt(readString(post.excerpt));
        setContent(readString(post.content));
        setIsPublished(readBool(post.isPublished));
      } catch {
        if (!cancelled) {
          setMsg({
            type: "err",
            text: "Yazı yüklenemedi.",
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
  }, [isNew, postId]);

  useEffect(() => {
    if (slugTouchedRef.current) {
      return;
    }

    const nextSlug = slugifyTR(title);

    if (nextSlug) {
      setSlug(nextSlug);
    }
  }, [title]);

  return (
    <section className="rounded-2xl border bg-white/60 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-white text-lg">
            📝
          </div>

          <div>
            <div className="text-sm font-extrabold text-gray-900">
              {isNew ? "Yeni Yazı" : "Yazıyı Düzenle"}
            </div>

            <div className="text-xs text-gray-600">
              Durum:{" "}
              <span
                className={
                  isPublished
                    ? "font-bold text-emerald-700"
                    : "font-bold text-gray-700"
                }
              >
                {isPublished ? "Yayında" : "Taslak"}
              </span>

              {loading ? (
                <span className="ml-2 text-gray-500">
                  • yükleniyor…
                </span>
              ) : null}

              {saving ? (
                <span className="ml-2 text-gray-500">
                  • kaydediliyor…
                </span>
              ) : null}

              {deleting ? (
                <span className="ml-2 text-gray-500">
                  • siliniyor…
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew ? (
            <button
              type="button"
              onClick={() => void loadPost()}
              disabled={loading || saving || deleting}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Yükleniyor..." : "Yenile"}
            </button>
          ) : null}

          {!isNew ? (
            <button
              type="button"
              onClick={() => void del()}
              disabled={loading || saving || deleting}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => void save()}
            disabled={
              loading ||
              !canSave ||
              saving ||
              deleting
            }
            className="rounded-xl border bg-black px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Kaydediliyor..."
              : isNew
                ? "Oluştur"
                : "Kaydet"}
          </button>
        </div>
      </div>

      {msg ? (
        <div
          className={[
            "mx-4 mt-4 rounded-xl border p-3 text-sm font-semibold",
            msg.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          {msg.text}
        </div>
      ) : null}

      {loading ? (
        <div className="p-6 text-sm font-semibold text-gray-600">
          Yazı yükleniyor...
        </div>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-white/70 p-4">
              <label
                htmlFor="admin-blog-title"
                className="text-sm font-extrabold text-gray-900"
              >
                Başlık
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Örn: İstanbul implant fiyatları 2026
              </p>

              <input
                id="admin-blog-title"
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Başlık..."
              />
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <label
                htmlFor="admin-blog-content"
                className="text-sm font-extrabold text-gray-900"
              >
                İçerik
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Blog içeriği. En az 20 karakter.
              </p>

              <textarea
                id="admin-blog-content"
                className="mt-2 min-h-[320px] w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder="Blog içeriği..."
              />
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-2xl border bg-white/70 p-4">
              <label
                htmlFor="admin-blog-slug"
                className="text-sm font-extrabold text-gray-900"
              >
                Slug
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Boş bırakınca başlıktan otomatik üretilir.
              </p>

              <input
                id="admin-blog-slug"
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2"
                value={slug}
                onChange={(event) => {
                  slugTouchedRef.current = true;
                  setSlug(event.target.value);
                }}
                placeholder="istanbul-implant-fiyatlari"
              />

              <div className="mt-2 text-xs text-gray-500">
                Önizleme:{" "}
                <span className="font-semibold text-gray-800">
                  /blog/{slug || "slug"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <label
                htmlFor="admin-blog-excerpt"
                className="text-sm font-extrabold text-gray-900"
              >
                Özet (Snippet)
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Google sonucu için 1–2 cümle önerilir.
              </p>

              <textarea
                id="admin-blog-excerpt"
                className="mt-2 min-h-[110px] w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(event.target.value)
                }
                placeholder="Kısa özet..."
              />
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-gray-900">
                    Yayın durumu
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Yayına alınca blogda görünür.
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(event) =>
                      setIsPublished(event.target.checked)
                    }
                  />

                  Yayında
                </label>
              </div>

              <div className="mt-3 rounded-xl border bg-black/5 p-3 text-xs text-gray-700">
                <div className="font-bold">İpucu</div>

                <div className="mt-1">
                  Başlık 50–60 karakter, özet 120–160
                  karakter bandında olursa snippet daha iyi
                  görünür.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-extrabold text-gray-900">
                Hızlı işlemler
              </div>

              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    slugTouchedRef.current = true;
                    setSlug(slugifyTR(title));
                  }}
                  className="rounded-xl border bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  Slug’ı başlıktan üret
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!excerpt.trim()) {
                      setExcerpt(content.slice(0, 160));
                    }
                  }}
                  className="rounded-xl border bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                >
                  Özet boşsa içerikten doldur
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-white/40 px-4 py-3 text-xs text-gray-600">
        <div>
          {isNew
            ? "Yeni yazı oluşturuyorsun."
            : "Düzenleme modundasın."}{" "}
          <span className="opacity-80">
            Kaydetmeden çıkarsan değişiklikler kaybolur.
          </span>
        </div>

        <div className="font-semibold">
          {canSave
            ? "Kaydetmeye hazır ✅"
            : "Başlık/İçerik kısa ⚠️"}
        </div>
      </div>
    </section>
  );
}