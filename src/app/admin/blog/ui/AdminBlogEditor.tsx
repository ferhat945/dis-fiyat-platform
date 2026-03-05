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

type ApiOk<T> = { ok: true } & T;
type ApiErr = {
  ok: false;
  code?: string;
  message?: string;
  issues?: Array<{ path: string; message: string }>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function readBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function readNullableString(v: unknown): string | null {
  return typeof v === "string" ? v : v === null ? null : null;
}

function normalizeErrText(err: ApiErr | null): string {
  const t = (err?.message ?? err?.code ?? "").trim();
  return t ? t : "İşlem başarısız.";
}

// basit slugify (Türkçe harfleri sadeleştir + url uyumlu)
function slugifyTR(input: string): string {
  return (input ?? "")
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

type Props = {
  postId: string; // "new" veya id/slug
  onSaved?: (p: BlogPost) => void;
  onDeleted?: () => void;
};

export default function AdminBlogEditor({ postId, onSaved, onDeleted }: Props): JSX.Element {
  const isNew = postId === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // slug otomatik üretimi için: kullanıcı slug alanına dokundu mu?
  const slugTouchedRef = useRef(false);

  const canSave = useMemo(() => {
    if (title.trim().length < 3) return false;
    if (content.trim().length < 20) return false;
    return true;
  }, [title, content]);

  async function loadPost(): Promise<void> {
    if (isNew) return;

    setLoading(true);
    setMsg(null);

    const res = await fetch(`/api/admin/blog/${encodeURIComponent(postId)}`, { cache: "no-store" });
    const j: unknown = await res.json().catch(() => null);

    if (!res.ok || !isRecord(j) || j.ok !== true) {
      const err = isRecord(j) ? (j as ApiErr) : null;
      setMsg({ type: "err", text: normalizeErrText(err) });
      setLoading(false);
      return;
    }

    const ok = j as ApiOk<{ post: unknown }>;
    const p = ok.post;

    if (!isRecord(p)) {
      setMsg({ type: "err", text: "Post okunamadı." });
      setLoading(false);
      return;
    }

    slugTouchedRef.current = true; // mevcut postta slug zaten var; otomatik üretim karışmasın
    setTitle(readString(p.title));
    setSlug(readString(p.slug));
    setExcerpt(readString(p.excerpt, ""));
    setContent(readString(p.content));
    setIsPublished(readBool(p.isPublished));

    setLoading(false);
  }

  async function save(): Promise<void> {
    setSaving(true);
    setMsg(null);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim() ? excerpt.trim() : null,
      content,
      isPublished,
    };

    const res = await fetch(isNew ? "/api/admin/blog" : `/api/admin/blog/${encodeURIComponent(postId)}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j: unknown = await res.json().catch(() => null);

    if (!res.ok || !isRecord(j) || j.ok !== true) {
      const err = isRecord(j) ? (j as ApiErr) : null;

      if (err?.issues?.length) {
        setMsg({ type: "err", text: err.issues[0]?.message ?? "Doğrulama hatası." });
      } else {
        setMsg({ type: "err", text: normalizeErrText(err) });
      }

      setSaving(false);
      return;
    }

    const ok = j as ApiOk<{ post?: unknown }>;
    const post = ok.post;

    if (isRecord(post)) {
      const saved: BlogPost = {
        id: readString(post.id),
        title: readString(post.title),
        slug: readString(post.slug),
        excerpt: readNullableString(post.excerpt),
        content: readString(post.content),
        isPublished: readBool(post.isPublished),
        publishedAt: readNullableString(post.publishedAt),
        updatedAt: readString(post.updatedAt),
      };
      setMsg({ type: "ok", text: "Kaydedildi ✅" });
      onSaved?.(saved);
    } else {
      setMsg({ type: "ok", text: "Kaydedildi ✅" });
    }

    setSaving(false);
  }

  async function del(): Promise<void> {
    if (isNew) return;

    setDeleting(true);
    setMsg(null);

    const res = await fetch(`/api/admin/blog/${encodeURIComponent(postId)}`, { method: "DELETE" });
    const j: unknown = await res.json().catch(() => null);

    if (!res.ok || !isRecord(j) || j.ok !== true) {
      const err = isRecord(j) ? (j as ApiErr) : null;
      setMsg({ type: "err", text: normalizeErrText(err) });
      setDeleting(false);
      return;
    }

    setMsg({ type: "ok", text: "Silindi." });
    setDeleting(false);
    onDeleted?.();
  }

  // load
  useEffect(() => {
    void loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // title -> slug (kullanıcı slug'a dokunmadıysa)
  useEffect(() => {
    if (slugTouchedRef.current) return;
    const next = slugifyTR(title);
    if (next) setSlug(next);
  }, [title]);

  return (
    <section className="rounded-2xl border bg-white/60 shadow-sm backdrop-blur">
      {/* üst bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-white/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-white text-lg">📝</div>
          <div>
            <div className="text-sm font-extrabold text-gray-900">{isNew ? "Yeni Yazı" : "Yazıyı Düzenle"}</div>
            <div className="text-xs text-gray-600">
              Durum:{" "}
              <span className={isPublished ? "font-bold text-emerald-700" : "font-bold text-gray-700"}>
                {isPublished ? "Yayında" : "Taslak"}
              </span>
              {saving ? <span className="ml-2 text-gray-500">• kaydediliyor…</span> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNew ? (
            <button
              onClick={() => void loadPost()}
              disabled={saving || deleting}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              Yenile
            </button>
          ) : null}

          {!isNew ? (
            <button
              onClick={() => void del()}
              disabled={saving || deleting}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </button>
          ) : null}

          <button
            onClick={() => void save()}
            disabled={!canSave || saving || deleting}
            className="rounded-xl border bg-black px-4 py-2 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {saving ? "Kaydediliyor..." : isNew ? "Oluştur" : "Kaydet"}
          </button>
        </div>
      </div>

      {/* mesaj */}
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

      {/* içerik */}
      <div className="grid gap-4 p-4 lg:grid-cols-[1.6fr_0.9fr]">
        {/* sol: içerik */}
        <div className="grid gap-4">
          <div className="rounded-2xl border bg-white/70 p-4">
            <label className="text-sm font-extrabold text-gray-900">Başlık</label>
            <p className="mt-1 text-xs text-gray-500">Örn: İstanbul implant fiyatları 2026</p>
            <input
              className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık..."
            />
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <label className="text-sm font-extrabold text-gray-900">İçerik</label>
            <p className="mt-1 text-xs text-gray-500">Blog içeriği. En az 20 karakter.</p>
            <textarea
              className="mt-2 min-h-[320px] w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Blog içeriği..."
            />
          </div>
        </div>

        {/* sağ: SEO + yayın */}
        <aside className="grid gap-4">
          <div className="rounded-2xl border bg-white/70 p-4">
            <label className="text-sm font-extrabold text-gray-900">Slug</label>
            <p className="mt-1 text-xs text-gray-500">Boş bırakınca başlıktan otomatik üretilir.</p>
            <input
              className="mt-2 w-full rounded-xl border bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2"
              value={slug}
              onChange={(e) => {
                slugTouchedRef.current = true;
                setSlug(e.target.value);
              }}
              placeholder="istanbul-implant-fiyatlari"
            />
            <div className="mt-2 text-xs text-gray-500">
              Önizleme: <span className="font-semibold text-gray-800">/blog/{slug || "slug"}</span>
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <label className="text-sm font-extrabold text-gray-900">Özet (Snippet)</label>
            <p className="mt-1 text-xs text-gray-500">Google sonucu için 1–2 cümle önerilir.</p>
            <textarea
              className="mt-2 min-h-[110px] w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Kısa özet..."
            />
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-gray-900">Yayın durumu</div>
                <div className="mt-1 text-xs text-gray-500">Yayına alınca blogda görünür.</div>
              </div>

              <label className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Yayında
              </label>
            </div>

            <div className="mt-3 rounded-xl border bg-black/5 p-3 text-xs text-gray-700">
              <div className="font-bold">İpucu</div>
              <div className="mt-1">
                Başlık 50–60 karakter, özet 120–160 karakter bandında olursa snippet daha iyi görünür.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-extrabold text-gray-900">Hızlı işlemler</div>
            <div className="mt-3 grid gap-2">
              <button
                onClick={() => {
                  // hızlı: slug'ı yeniden üret
                  slugTouchedRef.current = true;
                  setSlug(slugifyTR(title));
                }}
                className="rounded-xl border bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                type="button"
              >
                Slug’ı başlıktan üret
              </button>

              <button
                onClick={() => {
                  const t = excerpt.trim() ? excerpt.trim() : "";
                  if (!t) {
                    setExcerpt((content ?? "").slice(0, 160));
                  }
                }}
                className="rounded-xl border bg-white px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                type="button"
              >
                Özet boşsa içerikten doldur
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* alt bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-white/40 px-4 py-3 text-xs text-gray-600">
        <div>
          {isNew ? "Yeni yazı oluşturuyorsun." : "Düzenleme modundasın."}{" "}
          <span className="opacity-80">Kaydetmeden çıkarsan değişiklikler kaybolur.</span>
        </div>
        <div className="font-semibold">{canSave ? "Kaydetmeye hazır ✅" : "Başlık/İçerik kısa ⚠️"}</div>
      </div>
    </section>
  );
}
