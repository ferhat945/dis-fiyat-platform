"use client";

import { useEffect, useMemo, useState } from "react";

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
      setMsg({ type: "ok", text: "Kaydedildi." });
      onSaved?.(saved);
    } else {
      setMsg({ type: "ok", text: "Kaydedildi." });
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

  useEffect(() => {
    void loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {msg ? (
        <div
          className={[
            "mb-4 rounded-xl border p-3 text-sm font-medium",
            msg.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          {msg.text}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-gray-600">Yükleniyor...</div>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Başlık</label>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: İstanbul İmplant Fiyatları"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Slug (opsiyonel)</label>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="örn: istanbul-implant-fiyatlari"
            />
            <p className="text-xs text-gray-500">Boş bırakırsan başlıktan otomatik üretilir.</p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Özet (opsiyonel)</label>
            <textarea
              className="min-h-[70px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Google snippet için kısa özet..."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">İçerik</label>
            <textarea
              className="min-h-[260px] w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Blog içeriği..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Yayınla
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => void save()}
              disabled={!canSave || saving}
              className="rounded-xl border bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : isNew ? "Oluştur" : "Kaydet"}
            </button>

            {!isNew ? (
              <button
                onClick={() => void loadPost()}
                disabled={saving || deleting}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
              >
                Yenile
              </button>
            ) : null}

            {!isNew ? (
              <button
                onClick={() => void del()}
                disabled={saving || deleting}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Siliniyor..." : "Sil"}
              </button>
            ) : null}

            <div className="ml-auto text-xs text-gray-500">{isPublished ? "Yayında" : "Taslak"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
