import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage(): Promise<JSX.Element> {
  await requireAdmin();

  const posts = await prisma.blogPost.findMany({
    orderBy: [{ isPublished: "desc" }, { publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 300,
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ opacity: 0.7, fontWeight: 900 }}>Admin / Blog</div>
          <h1 style={{ fontSize: 26, fontWeight: 950, margin: "6px 0 0 0" }}>Blog Yönetimi</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link
            href="/admin/blog/new"
            style={{
              textDecoration: "none",
              fontWeight: 950,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
            }}
          >
            Yeni Yazı →
          </Link>

          <Link
            href="/blog"
            style={{
              textDecoration: "none",
              fontWeight: 950,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#111",
            }}
          >
            Blog’u Gör →
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "rgba(255,255,255,0.72)",
          borderRadius: 22,
          padding: 14,
          boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
        }}
      >
        <div style={{ fontWeight: 950, marginBottom: 10 }}>
          Toplam: <span style={{ opacity: 0.75 }}>{posts.length}</span>
        </div>

        {posts.length === 0 ? (
          <div style={{ opacity: 0.75, fontWeight: 800 }}>Henüz blog yazısı yok.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {posts.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.82)",
                  borderRadius: 18,
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 260 }}>
                  <div style={{ fontWeight: 950 }}>{p.title}</div>
                  <div style={{ opacity: 0.7, fontWeight: 800, marginTop: 4 }}>
                    /blog/{p.slug}
                  </div>

                  <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontWeight: 900,
                        fontSize: 12,
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: p.isPublished ? "rgba(16,185,129,0.10)" : "rgba(244,63,94,0.10)",
                      }}
                    >
                      {p.isPublished ? "Yayında" : "Taslak"}
                    </span>

                    <span
                      style={{
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontWeight: 850,
                        fontSize: 12,
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.7)",
                        opacity: 0.8,
                      }}
                    >
                      Güncelleme: {new Date(p.updatedAt).toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <Link
                    href={`/admin/blog/${p.id}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: 950,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      background: "#fff",
                      color: "#111",
                    }}
                  >
                    Düzenle →
                  </Link>

                  <Link
                    href={`/blog/${p.slug}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: 950,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      background: "#fff",
                      color: "#111",
                    }}
                  >
                    Önizleme →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
