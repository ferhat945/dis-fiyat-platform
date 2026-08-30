import Link from "next/link";

import { requireAdmin } from "@/lib/admin-guard";
import AdminBlogEditor from "../ui/AdminBlogEditor";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminBlogEditPage({
  params,
}: PageProps): Promise<JSX.Element> {
  await requireAdmin();

  const { id } =
    await params;

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <section
        className="adminCard"
        style={{
          overflow: "hidden",
          border: 0,
          color: "#fff",
          background:
            "linear-gradient(135deg,#101828 0%,#18233d 58%,#4338ca 150%)",
        }}
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 9px",
                border:
                  "1px solid rgba(255,255,255,.12)",
                borderRadius: 999,
                background:
                  "rgba(255,255,255,.06)",
                color:
                  "rgba(255,255,255,.66)",
                fontSize: 9,
                fontWeight: 750,
              }}
            >
              İÇERİK DÜZENLEME
            </div>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: 25,
                lineHeight: 1.1,
                letterSpacing: "-.04em",
              }}
            >
              Blog yazısını düzenle
            </h2>

            <p
              style={{
                maxWidth: 640,
                margin: "8px 0 0",
                color:
                  "rgba(255,255,255,.55)",
                fontSize: 10,
                lineHeight: 1.7,
              }}
            >
              Mevcut içeriği, SEO
              bilgilerini ve yayın
              durumunu buradan
              güncelleyebilirsin.
            </p>

            <div
              style={{
                marginTop: 9,
                maxWidth: 500,
                overflow: "hidden",
                color:
                  "rgba(255,255,255,.34)",
                fontFamily: "monospace",
                fontSize: 8,
                textOverflow:
                  "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={id}
            >
              Post ID: {id}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/admin/blog"
              className="adminButton"
              style={{
                border:
                  "1px solid rgba(255,255,255,.14)",
                background:
                  "rgba(255,255,255,.07)",
                color: "#fff",
              }}
            >
              ← Listeye Dön
            </Link>

            <Link
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="adminButton"
              style={{
                background: "#fff",
                color: "#101828",
              }}
            >
              Blogu Aç ↗
            </Link>
          </div>
        </div>
      </section>

      <AdminBlogEditor postId={id} />
    </div>
  );
}