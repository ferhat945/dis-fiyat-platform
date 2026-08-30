import Link from "next/link";

import { requireAdmin } from "@/lib/admin-guard";
import AdminBlogEditor from "../ui/AdminBlogEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage(): Promise<JSX.Element> {
  await requireAdmin();

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
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
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
              YENİ İÇERİK
            </div>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: 25,
                lineHeight: 1.1,
                letterSpacing: "-.04em",
              }}
            >
              Yeni blog yazısı oluştur
            </h2>

            <p
              style={{
                maxWidth: 610,
                margin: "8px 0 0",
                color:
                  "rgba(255,255,255,.55)",
                fontSize: 10,
                lineHeight: 1.7,
              }}
            >
              SEO uyumlu içerik oluştur,
              URL adresini belirle ve
              hazır olduğunda yayına al.
            </p>
          </div>

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
            ← Blog Listesine Dön
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 10,
        }}
      >
        <InfoCard
          title="Başlık"
          text="Arama sonucunda dikkat çekici ve açıklayıcı bir başlık kullan."
        />

        <InfoCard
          title="SEO Özeti"
          text="Google sonuçlarında gösterilecek kısa açıklamayı hazırla."
        />

        <InfoCard
          title="İçerik"
          text="Başlıklar ve açıklayıcı paragraflarla detaylı içerik oluştur."
        />

        <InfoCard
          title="Yayın"
          text="Hazır değilse taslak olarak kaydet, tamamlanınca yayına al."
        />
      </section>

      <AdminBlogEditor postId="new" />
    </div>
  );
}

function InfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}): JSX.Element {
  return (
    <div
      className="adminCard"
      style={{
        padding: 14,
      }}
    >
      <div
        style={{
          color: "#101828",
          fontSize: 10,
          fontWeight: 800,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 5,
          color: "#98a2b3",
          fontSize: 8,
          lineHeight: 1.55,
        }}
      >
        {text}
      </div>
    </div>
  );
}