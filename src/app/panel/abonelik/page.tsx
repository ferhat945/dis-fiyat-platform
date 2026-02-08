import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PackageCard = {
  title: string;
  priceText: string;
  leads: number;
  note: string;
  buyHref: string;
};

export default async function PanelSubscriptionPage(): Promise<JSX.Element> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Yetkisiz</h1>
        <div>
          Lütfen <a href="/panel/login">/panel/login</a> üzerinden giriş yap.
        </div>
      </div>
    );
  }

  const activeSub = await prisma.subscription.findFirst({
    where: {
      clinicId: session.clinicId,
      status: "active",
      expiresAt: { gt: new Date() },
    },
    orderBy: { startedAt: "desc" },
    select: {
      quotaTotal: true,
      quotaUsed: true,
      expiresAt: true,
    },
  });

  const quotaTotal = activeSub?.quotaTotal ?? 0;
  const quotaUsed = activeSub?.quotaUsed ?? 0;
  const remaining = Math.max(0, quotaTotal - quotaUsed);

  const packages: PackageCard[] = [
    {
      title: "Başlangıç Paketi",
      priceText: "800 TL / ay",
      leads: 10,
      note: "10 lead kotası yüklenir.",
      buyHref: "/panel/abonelik/satin-al?package=base",
    },
    {
      title: "Ek Lead Paketi",
      priceText: "600 TL",
      leads: 10,
      note: "Mevcut aboneliğe +10 lead ekler.",
      buyHref: "/panel/abonelik/satin-al?package=extra",
    },
  ];

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Abonelik</h1>
        <div style={{ opacity: 0.75 }}>Klinik: {session.name}</div>
      </div>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          display: "grid",
          gap: 6,
        }}
      >
        <div style={{ fontWeight: 800 }}>Mevcut Kota</div>

        {activeSub ? (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div>
              <strong>Kullanılan:</strong> {quotaUsed}
            </div>
            <div>
              <strong>Toplam:</strong> {quotaTotal}
            </div>
            <div>
              <strong>Kalan:</strong> {remaining}
            </div>
            <div style={{ opacity: 0.75 }}>
              <strong>Bitiş:</strong>{" "}
              {new Date(activeSub.expiresAt).toLocaleDateString("tr-TR")}
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.75 }}>
            Aktif abonelik bulunamadı. Paket satın alarak lead almaya başlayabilirsin.
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {packages.map((p) => (
          <div
            key={p.title}
            style={{
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: 14,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900 }}>{p.title}</div>

            <div style={{ fontSize: 26, fontWeight: 900 }}>{p.priceText}</div>

            <div style={{ opacity: 0.85 }}>
              <strong>{p.leads} lead</strong> kotası
            </div>

            <div style={{ opacity: 0.7 }}>{p.note}</div>

            <Link
              href={p.buyHref}
              style={{
                display: "inline-block",
                textAlign: "center",
                padding: "10px 12px",
                borderRadius: 10,
                background: "#111",
                color: "#fff",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Satın Al
            </Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, opacity: 0.75 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Not</div>
        <div>
          Ödeme entegrasyonu (PayTR) bir sonraki adımda eklenecek. Şu an bu sayfa sadece paketleri gösterir.
        </div>
      </div>
    </div>
  );
}
