import Link from "next/link";
import { prisma } from "@/lib/db";
import { normalizeSlug } from "@/lib/seo-data";
import styles from "./HomeBlogSection.module.css";

export const dynamic = "force-dynamic";

function clinicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function estimateReadingTimeTR(text: string): string {
  // Ortalama 200 kelime/dk
  const words = (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} dk`;
}

function guessCategoryFromText(title: string, excerpt?: string, content?: string): string | null {
  const hay = `${title} ${excerpt ?? ""} ${content ?? ""}`.toLowerCase();

  const rules: Array<{ label: string; keys: string[] }> = [
    { label: "İmplant", keys: ["implant"] },
    { label: "Kanal", keys: ["kanal", "endodonti"] },
    { label: "Dolgu", keys: ["dolgu", "çürük", "curuk"] },
    { label: "Zirkonyum", keys: ["zirkonyum"] },
    { label: "Lamina", keys: ["lamina", "porselen lamina", "yaprak porselen"] },
    { label: "Diş Çekimi", keys: ["çekim", "cekimi", "diş çekimi", "dis cekimi"] },
    { label: "Ortodonti", keys: ["tel", "ortodonti", "braket", "aligner"] },
    { label: "Diş Eti", keys: ["diş eti", "dis eti", "periodont", "gingiv"] },
    { label: "Beyazlatma", keys: ["beyazlat", "bleach", "whitening"] },
  ];

  for (const r of rules) {
    if (r.keys.some((k) => hay.includes(k))) return r.label;
  }
  return null;
}

export default async function HomeBlogSection(): Promise<JSX.Element | null> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true, publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      clinic: { select: { id: true, name: true, isActive: true } },
    },
  });

  if (posts.length === 0) return null;

  return (
    <section className={styles.wrap} aria-label="Öne çıkan blog yazıları">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>
            <span className={styles.dot} aria-hidden />
            Blog
          </div>
          <h2 className={styles.title}>Öne Çıkan Yazılar</h2>
          <p className={styles.desc}>
            Diş tedavileri, fiyatlar ve merak edilenler. Kesin fiyat muayene sonrası netleşir.
          </p>
        </div>

        <Link className={styles.allLink} href="/blog">
          Tüm yazılar →
        </Link>
      </div>

      <div className={styles.grid}>
        {posts.map((p) => {
          const clinicOk = p.clinic?.isActive ? p.clinic : null;
          const clinicHref = clinicOk ? `/klinikler/${clinicSlug(clinicOk.name, clinicOk.id)}` : null;

          const reading = estimateReadingTimeTR(p.content ?? p.excerpt ?? "");
          const cat = guessCategoryFromText(p.title, p.excerpt ?? undefined, p.content ?? undefined);

          // Basit kapak: kategoriye göre emoji/gradient (görsel dosyası gerekmesin)
          const coverIcon =
            cat === "İmplant"
              ? "🦷"
              : cat === "Kanal"
              ? "🧪"
              : cat === "Dolgu"
              ? "🩹"
              : cat === "Zirkonyum"
              ? "✨"
              : cat === "Lamina"
              ? "😁"
              : cat === "Ortodonti"
              ? "🧷"
              : cat === "Diş Eti"
              ? "🪥"
              : cat === "Beyazlatma"
              ? "🌟"
              : "📘";

          return (
            <article key={p.id} className={styles.card}>
              <Link className={styles.cover} href={`/blog/${encodeURIComponent(p.slug)}`}>
                <div className={styles.coverIcon} aria-hidden>
                  {coverIcon}
                </div>
                <div className={styles.coverText}>
                  <div className={styles.badgeRow}>
                    {cat ? <span className={styles.badge}>{cat}</span> : <span className={styles.badgeMuted}>Genel</span>}
                    <span className={styles.badgeMuted}>⏱ {reading}</span>
                  </div>
                </div>
              </Link>

              <div className={styles.cardBody}>
                <Link className={styles.cardTitle} href={`/blog/${encodeURIComponent(p.slug)}`}>
                  {p.title}
                </Link>

                <div className={styles.metaRow}>
                  <span className={styles.meta}>
                    📅 {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("tr-TR") : ""}
                  </span>

                  {clinicOk ? (
                    clinicHref ? (
                      <Link className={styles.metaLink} href={clinicHref}>
                        🏥 {clinicOk.name}
                      </Link>
                    ) : (
                      <span className={styles.meta}>🏥 {clinicOk.name}</span>
                    )
                  ) : (
                    <span className={styles.meta}>🏥 Klinik</span>
                  )}
                </div>

                {p.excerpt ? (
                  <p className={styles.excerpt}>{p.excerpt}</p>
                ) : (
                  <p className={styles.excerptMuted}>Devamını oku →</p>
                )}

                <div className={styles.actions}>
                  <Link className={styles.btnPrimary} href={`/blog/${encodeURIComponent(p.slug)}`}>
                    Oku →
                  </Link>
                  <Link className={styles.btnSoft} href="/teklif-al">
                    Teklif Al
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}