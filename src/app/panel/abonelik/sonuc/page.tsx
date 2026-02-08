import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ResultPage({ searchParams }: Props): Promise<JSX.Element> {
  const sp = await searchParams;
  const status = sp.status === "success" ? "success" : "fail";

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
        {status === "success" ? "Ödeme Sayfası" : "Ödeme Hatası"}
      </h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        {status === "success" ? (
          <>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Ödeme tamamlandıysa kota kısa süre içinde güncellenir.
            </div>
            <div style={{ opacity: 0.75 }}>
              Kesin sonuç PayTR callback ile gelir; bu sayfa sadece bilgilendirme içindir.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Ödeme başarısız veya iptal edildi.</div>
            <div style={{ opacity: 0.75 }}>Tekrar deneyebilirsin.</div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <Link href="/panel/abonelik" style={{ textDecoration: "none", fontWeight: 900 }}>
          Abonelik sayfasına dön
        </Link>
        <Link href="/panel/leadler" style={{ textDecoration: "none", fontWeight: 900 }}>
          Leadler
        </Link>
      </div>
    </div>
  );
}
