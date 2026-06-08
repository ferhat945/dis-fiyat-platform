import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PackageCard = {
  title: string;
  priceText: string;
  credits: number;
  note: string;
  buyHref: string;
  featured?: boolean;
  badge?: string;
};

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

function fmtDateTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("tr-TR");
}

function typeLabel(type: string): string {
  if (type === "purchase") return "Kredi satın alma";
  if (type === "lead_unlock") return "Lead açma";
  if (type === "premium_monthly_credit") return "Premium aylık kredi";
  return type;
}

export default async function PanelSubscriptionPage(): Promise<JSX.Element> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Yetkisiz</h1>
        <div>
          Lütfen <a href="/panel/login">/panel/login</a> üzerinden giriş yap.
        </div>
      </div>
    );
  }

  const now = new Date();

  const [clinic, activeSub, transactions] = await Promise.all([
    prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        creditBalance: true,
        isPremium: true,
        premiumStartedAt: true,
        premiumExpiresAt: true,
        autoRenewPremium: true,
      },
    }),
    prisma.subscription.findFirst({
      where: {
        clinicId: session.clinicId,
        status: "active",
        expiresAt: { gt: now },
      },
      orderBy: { startedAt: "desc" },
      select: {
        quotaTotal: true,
        quotaUsed: true,
        expiresAt: true,
      },
    }),
    prisma.creditTransaction.findMany({
      where: { clinicId: session.clinicId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        amount: true,
        type: true,
        note: true,
        createdAt: true,
      },
    }),
  ]);

  const creditBalance = clinic?.creditBalance ?? 0;
  const isPremiumActive = Boolean(
    clinic?.isPremium && clinic?.premiumExpiresAt && clinic.premiumExpiresAt.getTime() > now.getTime()
  );

  const quotaTotal = activeSub?.quotaTotal ?? 0;
  const quotaUsed = activeSub?.quotaUsed ?? 0;
  const remaining = Math.max(0, quotaTotal - quotaUsed);

  const packages: PackageCard[] = [
    {
      title: "5 Kredi Paketi",
      priceText: "1500 TL",
      credits: 5,
      note: "5 adet lead açma hakkı. Abonelik zorunluluğu yoktur.",
      buyHref: "/panel/abonelik/satin-al?package=credit_5",
      badge: "Başlangıç",
    },
    {
      title: "10 Kredi Paketi",
      priceText: "2000 TL",
      credits: 10,
      note: "Daha avantajlı kredi paketi. 1 kredi = 1 lead açma hakkı.",
      buyHref: "/panel/abonelik/satin-al?package=credit_10",
      featured: true,
      badge: "Popüler",
    },
    {
      title: "25 Kredi Paketi",
      priceText: "4000 TL",
      credits: 25,
      note: "Yoğun lead alan klinikler için en avantajlı kredi paketi.",
      buyHref: "/panel/abonelik/satin-al?package=credit_25",
      badge: "En avantajlı",
    },
    {
      title: "Premium Üyelik",
      priceText: "2500 TL / ay",
      credits: 10,
      note: "Aylık 10 kredi + premium öncelik hakkı. Gerçek ödeme altyapısı bağlanınca otomatik yenileme aktif kullanılır.",
      buyHref: "/panel/abonelik/satin-al?package=premium",
      featured: true,
      badge: "Premium",
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 44px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div style={badgeStyle()}>💳 Kredi & Premium</div>

          <h1 style={{ margin: "10px 0 0", fontSize: 30, lineHeight: 1.1, fontWeight: 950 }}>
            Kredi Yönetimi
          </h1>

          <div style={{ marginTop: 8, color: "rgba(15,23,42,0.72)", fontWeight: 750, lineHeight: 1.75 }}>
            Lead detaylarını görüntülemek için kredi kullanırsın. 1 kredi = 1 lead açma hakkı.
          </div>
        </div>

        <div style={{ opacity: 0.75, fontWeight: 900 }}>
          Klinik: <strong>{session.name}</strong>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <InfoCard title="Kredi Bakiyesi" value={String(creditBalance)} hint="1 kredi = 1 lead açma" />
        <InfoCard
          title="Premium Durumu"
          value={isPremiumActive ? "Aktif" : "Pasif"}
          hint={isPremiumActive ? `Bitiş: ${fmtDate(clinic?.premiumExpiresAt)}` : "Premium öncelik kapalı"}
        />
        <InfoCard
          title="Otomatik Yenileme"
          value={clinic?.autoRenewPremium ? "Açık" : "Kapalı"}
          hint="Gerçek ödeme altyapısı bağlanınca kullanılacak"
        />
      </div>

      <div style={{ marginTop: 12 }}>{isPremiumActive ? premiumBox(clinic?.premiumExpiresAt) : normalBox()}</div>

      <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {packages.map((p) => (
          <div
            key={p.title}
            style={{
              borderRadius: 22,
              border: p.featured ? "1px solid rgba(124,58,237,0.18)" : "1px solid rgba(15,23,42,0.10)",
              background: p.featured
                ? "radial-gradient(900px 240px at 10% 0%, rgba(124,58,237,0.20), transparent 60%), rgba(255,255,255,0.78)"
                : "rgba(255,255,255,0.78)",
              boxShadow: "0 18px 45px rgba(2,6,23,0.08)",
              padding: 14,
              display: "grid",
              gap: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start", flexWrap: "wrap" }}>
              <div style={{ fontSize: 18, fontWeight: 950 }}>{p.title}</div>
              {p.badge ? <span style={badgeStyle()}>{p.badge}</span> : null}
            </div>

            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.05 }}>{p.priceText}</div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={chipStyle()}>🎯 {p.credits} kredi</span>
              <span style={chipStyle()}>🔒 KVKK uyumlu</span>
              <span style={chipStyle()}>⚡ Hızlı aktivasyon</span>
            </div>

            <div style={{ opacity: 0.78, fontWeight: 850, lineHeight: 1.7 }}>{p.note}</div>

            <Link href={p.buyHref} style={p.featured ? buyPrimary() : buySoft()}>
              Satın Al →
            </Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, borderRadius: 22, border: "1px solid rgba(15,23,42,0.10)", background: "rgba(255,255,255,0.78)", boxShadow: "0 18px 45px rgba(2,6,23,0.08)", padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 18 }}>📜 Kredi Hareketleri</div>
            <div style={{ opacity: 0.72, fontWeight: 800, marginTop: 4 }}>
              Son 30 kredi işlemi.
            </div>
          </div>

          <span style={badgeStyle()}>Bakiye: {creditBalance}</span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.75, fontWeight: 850 }}>
            Henüz kredi hareketi yok.
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {transactions.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(140px, 180px) 1fr auto",
                  gap: 10,
                  alignItems: "center",
                  border: "1px solid rgba(15,23,42,0.08)",
                  background: "rgba(255,255,255,0.70)",
                  borderRadius: 14,
                  padding: "10px 12px",
                }}
              >
                <div style={{ opacity: 0.72, fontWeight: 850, fontSize: 13 }}>{fmtDateTime(t.createdAt)}</div>
                <div>
                  <div style={{ fontWeight: 950 }}>{typeLabel(t.type)}</div>
                  <div style={{ opacity: 0.7, fontWeight: 800, fontSize: 12 }}>{t.note ?? "—"}</div>
                </div>
                <div
                  style={{
                    fontWeight: 950,
                    color: t.amount >= 0 ? "#15803d" : "#b91c1c",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.amount > 0 ? `+${t.amount}` : t.amount} kredi
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, opacity: 0.75 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Eski kota bilgisi</div>
        {activeSub ? (
          <div style={{ fontWeight: 800, lineHeight: 1.7 }}>
            Eski abonelik/kota sisteminde kalan: <strong>{remaining}</strong> / {quotaTotal}. Bitiş:{" "}
            <strong>{fmtDate(activeSub.expiresAt)}</strong>. Yeni sistemde lead açma işlemleri kredi bakiyesi üzerinden ilerler.
          </div>
        ) : (
          <div style={{ fontWeight: 800, lineHeight: 1.7 }}>
            Aktif eski abonelik bulunamadı. Yeni sistemde kredi bakiyesi kullanılacak.
          </div>
        )}
      </div>
    </div>
  );
}

function normalBox(): JSX.Element {
  return (
    <div style={noticeBox("info")}>
      <div style={{ fontWeight: 950 }}>ℹ️ Premium kapalı</div>
      <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 850 }}>
        Normal klinikler kredi satın alarak lead açabilir. Premium klinikler ise dağıtımda öncelik kazanır.
      </div>
    </div>
  );
}

function premiumBox(expiresAt: Date | null | undefined): JSX.Element {
  return (
    <div style={noticeBox("ok")}>
      <div style={{ fontWeight: 950 }}>✅ Premium aktif</div>
      <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 850 }}>
        Premium öncelik hakkın aktif. Bitiş: <strong>{fmtDate(expiresAt)}</strong>
      </div>
    </div>
  );
}

function noticeBox(kind: "ok" | "info" | "danger"): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.78)",
    boxShadow: "0 18px 45px rgba(2,6,23,0.08)",
    padding: 14,
  };

  if (kind === "ok") {
    return { ...base, border: "1px solid rgba(34,197,94,0.22)", background: "rgba(34,197,94,0.10)" };
  }
  if (kind === "danger") {
    return { ...base, border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.08)" };
  }
  return { ...base, border: "1px solid rgba(59,130,246,0.22)", background: "rgba(59,130,246,0.08)" };
}

function badgeStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.75)",
    fontWeight: 900,
    fontSize: 12,
  };
}

function chipStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.72)",
    fontWeight: 900,
    fontSize: 12,
  };
}

function buyPrimary(): React.CSSProperties {
  return {
    display: "inline-block",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(11,18,32,0.92)",
    color: "#fff",
    fontWeight: 950,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 16px 35px rgba(2,6,23,0.16)",
  };
}

function buySoft(): React.CSSProperties {
  return {
    display: "inline-block",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.82)",
    color: "rgba(15,23,42,0.92)",
    fontWeight: 950,
    textDecoration: "none",
    border: "1px solid rgba(15,23,42,0.12)",
    boxShadow: "0 12px 26px rgba(2,6,23,0.06)",
  };
}

function InfoCard({ title, value, hint }: { title: string; value: string; hint: string }): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.78)",
        borderRadius: 18,
        padding: "12px 14px",
        boxShadow: "0 12px 26px rgba(2,6,23,0.06)",
      }}
    >
      <div style={{ opacity: 0.75, fontWeight: 900, fontSize: 12 }}>{title}</div>
      <div style={{ marginTop: 6, fontWeight: 950, fontSize: 22 }}>{value}</div>
      <div style={{ marginTop: 4, opacity: 0.7, fontWeight: 850, fontSize: 12 }}>{hint}</div>
    </div>
  );
}