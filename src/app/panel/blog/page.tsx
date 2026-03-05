"use client";

import { useEffect, useMemo, useState } from "react";
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

type ListResp = { ok: true; posts: Post[] } | { ok: false; code: string };
type CreateResp = { ok: true; post: Post } | { ok: false; code: string };
type PublishResp =
  | { ok: true; post: { id: string; isPublished: boolean; publishedAt: string | null } }
  | { ok: false; code: string };

type DeleteResp = { ok: true } | { ok: false; code: string };

function trimMax(v: string, max: number): string {
  return v.slice(0, max);
}

function fmtDT(dt: string): string {
  return new Date(dt).toLocaleString("tr-TR");
}

export default function PanelBlogPage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);

  const [title, setTitle] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [tab, setTab] = useState<"all" | "published" | "draft">("all");

  const titleLen = title.trim().length;
  const excerptLen = excerpt.trim().length;
  const contentLen = content.trim().length;

  const canCreate = titleLen >= 8 && contentLen >= 50;

  const load = async (): Promise<void> => {
    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/panel/blog-posts", { cache: "no-store" });
      const j = (await r.json()) as ListResp;
      if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);
      setPosts(j.posts);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (): Promise<void> => {
    if (!canCreate) return;

    setErr(null);
    setLoading(true);

    try {
      const r = await fetch("/api/panel/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
        }),
      });

      const j = (await r.json()) as CreateResp;
      if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

      setTitle("");
      setExcerpt("");
      setContent("");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string, publish: boolean): Promise<void> => {
    setErr(null);
    setLoading(true);

    try {
      const r = await fetch(`/api/panel/blog-posts/${encodeURIComponent(id)}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish }),
      });

      const j = (await r.json()) as PublishResp;
      if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string): Promise<void> => {
    setErr(null);
    setLoading(true);

    try {
      const r = await fetch(`/api/panel/blog-posts/${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = (await r.json()) as DeleteResp;
      if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => [...posts].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)), [posts]);

  const filtered = useMemo(() => {
    if (tab === "published") return sorted.filter((p) => p.isPublished);
    if (tab === "draft") return sorted.filter((p) => !p.isPublished);
    return sorted;
  }, [sorted, tab]);

  const publishedCount = useMemo(() => posts.filter((p) => p.isPublished).length, [posts]);
  const draftCount = useMemo(() => posts.filter((p) => !p.isPublished).length, [posts]);

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <div className={styles.pill}>✍️ Klinik Blog Yönetimi</div>
          <h1 className={styles.h1}>Blog</h1>
          <div className={styles.sub}>
            Taslak oluştur, yayınla ve hastalara güven veren içerikler üret. (Yayınlamak için abonelik aktif olmalı.)
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Yayında</div>
            <div className={styles.statValue}>{publishedCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Taslak</div>
            <div className={styles.statValue}>{draftCount}</div>
          </div>
        </div>
      </div>

      {err ? <div className={styles.msgErr}>⚠️ Hata: {err}</div> : null}

      <div className={styles.grid}>
        {/* CREATE */}
        <section className={`${styles.card} ${styles.cardGlow}`}>
          <div className={styles.cardInner}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Yeni Yazı</div>
                <div className={styles.cardSub}>Başlık + içerik yaz, kaydet</div>
              </div>

              <button className={styles.btnGhost} type="button" disabled={loading} onClick={() => void load()}>
                Yenile
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <div className={styles.label}>Başlık</div>
                  <div className={styles.hint}>{titleLen}/120 • min 8</div>
                </div>
                <div className={styles.inputFrame}>
                  <div className={styles.icon}>🧠</div>
                  <input
                    className={styles.input}
                    value={title}
                    onChange={(e) => setTitle(trimMax(e.target.value, 120))}
                    placeholder="Örn: İmplant Tedavisi Öncesi Bilinmesi Gerekenler"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <div className={styles.label}>Özet (opsiyonel)</div>
                  <div className={styles.hint}>{excerptLen}/320</div>
                </div>
                <div className={styles.inputFrame}>
                  <div className={styles.icon}>📝</div>
                  <input
                    className={styles.input}
                    value={excerpt}
                    onChange={(e) => setExcerpt(trimMax(e.target.value, 320))}
                    placeholder="Kısa özet (kartlarda görünür)"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <div className={styles.label}>İçerik</div>
                  <div className={styles.hint}>{contentLen} • min 50</div>
                </div>
                <div className={styles.textareaFrame}>
                  <textarea
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Düz metin içerik… (şimdilik markdown yok)"
                  />
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnPrimary} type="button" disabled={loading || !canCreate} onClick={() => void create()}>
                  {loading ? "Kaydediliyor..." : "Yazıyı Kaydet"}
                </button>

                <div className={styles.helperRight}>
                  {canCreate ? (
                    <span className={styles.badgeOk}>✅ Kaydetmeye hazır</span>
                  ) : (
                    <span className={styles.badgeMuted}>Başlık ≥ 8, İçerik ≥ 50 olmalı</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Yazıların</div>
                <div className={styles.cardSub}>Yayın / taslak durumunu yönet</div>
              </div>

              <div className={styles.tabs}>
                <button type="button" className={tabBtn(tab === "all")} onClick={() => setTab("all")}>
                  Tümü
                </button>
                <button type="button" className={tabBtn(tab === "published")} onClick={() => setTab("published")}>
                  Yayında
                </button>
                <button type="button" className={tabBtn(tab === "draft")} onClick={() => setTab("draft")}>
                  Taslak
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className={styles.empty}>Henüz yazı yok.</div>
            ) : (
              <div className={styles.list}>
                {filtered.map((p) => (
                  <div key={p.id} className={styles.item}>
                    <div className={styles.itemHead}>
                      <div className={styles.itemTitle}>{p.title}</div>

                      <span className={`${styles.statusPill} ${p.isPublished ? styles.statusOn : styles.statusOff}`}>
                        {p.isPublished ? "Yayında" : "Taslak"}
                      </span>
                    </div>

                    <div className={styles.metaRow}>
                      <span className={styles.metaChip}>🕒 Güncellendi: {fmtDT(p.updatedAt)}</span>
                      {p.publishedAt ? <span className={styles.metaChip}>📣 Yayın: {fmtDT(p.publishedAt)}</span> : null}
                      <span className={styles.metaChip}>🔗 /blog/{p.slug}</span>
                    </div>

                    {p.excerpt ? <div className={styles.excerpt}>{p.excerpt}</div> : null}

                    <div className={styles.itemActions}>
                      <button
                        type="button"
                        className={p.isPublished ? styles.btnGhost : styles.btnPrimarySoft}
                        disabled={loading}
                        onClick={() => void togglePublish(p.id, !p.isPublished)}
                      >
                        {p.isPublished ? "Yayından Kaldır" : "Yayınla"}
                      </button>

                      <button type="button" className={styles.btnDangerSoft} disabled={loading} onClick={() => void remove(p.id)}>
                        Sil
                      </button>

                      <Link className={styles.btnGhostLink} href={`/blog/${encodeURIComponent(p.slug)}`} target="_blank">
                        Görüntüle ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.note}>
              Not: Yayın butonu çalışır ama “yayınlamak için abonelik” kontrolünü API tarafında yapıyorsun. UI sadece yönetim sağlar.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function tabBtn(active: boolean): string {
  return active ? `${styles.tab} ${styles.tabActive}` : styles.tab;
}