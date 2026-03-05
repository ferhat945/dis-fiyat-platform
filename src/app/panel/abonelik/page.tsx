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
  featured?: boolean;
};

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
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

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    select: { trialUsedAt: true, trialEndsAt: true },
  });

  const activeSub = await prisma.subscription.findFirst({
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
  });

  const quotaTotal = activeSub?.quotaTotal ?? 0;
  const quotaUsed = activeSub?.quotaUsed ?? 0;
  const remaining = Math.max(0, quotaTotal - quotaUsed);
  const usedPct = quotaTotal > 0 ? clamp(Math.round((quotaUsed / quotaTotal) * 100), 0, 100) : 0;

  const trialUsedAt = clinic?.trialUsedAt ?? null;
  const trialEndsAt = clinic?.trialEndsAt ?? null;

  const hasTrial = Boolean(trialUsedAt && trialEndsAt);
  const trialIsActive = Boolean(trialEndsAt && trialEndsAt.getTime() > now.getTime());
  const trialIsExpired = Boolean(hasTrial && trialEndsAt && trialEndsAt.getTime() <= now.getTime());

  let trialInfo: string;
  if (!hasTrial) {
    trialInfo = "1 hafta ücretsiz deneme hakkın var.";
  } else if (trialIsActive && trialEndsAt) {
    const left = Math.max(0, daysBetween(now, trialEndsAt));
    trialInfo = `Deneme süren aktif. Kalan: ${left} gün (bitiş: ${trialEndsAt.toLocaleDateString("tr-TR")})`;
  } else {
    trialInfo = `Deneme süresi doldu (bitiş: ${trialEndsAt ? trialEndsAt.toLocaleDateString("tr-TR") : "—"}).`;
  }

  const packages: PackageCard[] = [
    {
      title: "Aylık Abonelik",
      priceText: "2000 TL / ay",
      leads: 10,
      note: `10 lead kotası yüklenir. ${trialInfo}`,
      buyHref: "/panel/abonelik/satin-al?package=base",
      featured: true,
    },
    {
      title: "Ek Lead Paketi",
      priceText: "1000 TL",
      leads: 10,
      note: "Mevcut aboneliğe +10 lead ekler.",
      buyHref: "/panel/abonelik/satin-al?package=extra",
    },
  ];

  const statusBlock = (() => {
    if (activeSub) {
      return (
        <div style={noticeBox("ok")}>
          <div style={{ fontWeight: 950 }}>
            ✅ Lead alımın açık • Kalan kota: <strong>{remaining}</strong>
          </div>
          <div style={{ opacity: 0.85, fontWeight: 850, marginTop: 6 }}>
            Bitiş: <strong>{new Date(activeSub.expiresAt).toLocaleDateString("tr-TR")}</strong>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 900, opacity: 0.85 }}>Kota kullanımı</div>
              <div style={{ fontWeight: 900, opacity: 0.75 }}>{quotaUsed}/{quotaTotal} ({usedPct}%)</div>
            </div>

            <div
              style={{
                marginTop: 8,
                height: 12,
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(255,255,255,0.70)",
                overflow: "hidden",
              }}
              aria-label="Kota progress"
            >
              <div
                style={{
                  width: `${usedPct}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
                  boxShadow: "0 16px 30px rgba(2,6,23,0.10)",
                }}
              />
            </div>

            {remaining <= 0 ? (
              <div style={{ marginTop: 10, fontWeight: 900 }}>
                ⚠️ Kota bitti. Ek paket alırsan lead alımın devam eder.
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (trialIsExpired) {
      return (
        <div style={noticeBox("danger")}>
          <div style={{ fontWeight: 950 }}>⚠️ Deneme süren bitti.</div>
          <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 850 }}>
            Klinik dizinde görünmeye devam edersin ama <strong>yeni lead alamazsın</strong>. Lead almak için abonelik satın al.
          </div>
        </div>
      );
    }

    return (
      <div style={noticeBox("info")}>
        <div style={{ fontWeight: 950 }}>ℹ️ {trialInfo}</div>
        <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 850 }}>
          Trial başlatmak veya aboneliğe geçmek için “Aylık Abonelik” satın alabilirsin.
        </div>
      </div>
    );
  })();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 44px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.72)",
              fontWeight: 950,
              fontSize: 12,
              boxShadow: "0 10px 18px rgba(2,6,23,0.05)",
            }}
          >
            💎 Premium Paketler
          </div>

          <h1 style={{ margin: "10px 0 0", fontSize: 30, lineHeight: 1.1, fontWeight: 950, letterSpacing: "-0.02em" }}>
            Abonelik
          </h1>
          <div style={{ marginTop: 8, color: "rgba(15,23,42,0.72)", fontWeight: 750, lineHeight: 1.75 }}>
            Lead alımını açmak ve kotanı yönetmek için paket seç.
          </div>
        </div>

        <div style={{ opacity: 0.75, fontWeight: 900 }}>
          Klinik: <strong>{session.name}</strong>
        </div>
      </div>

      {/* STATUS */}
      <div style={{ marginTop: 12 }}>{statusBlock}</div>

      {/* CURRENT QUOTA */}
      <div
        style={{
          marginTop: 12,
          borderRadius: 22,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "rgba(255,255,255,0.78)",
          boxShadow: "0 18px 45px rgba(2,6,23,0.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 14, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Mevcut Kota</div>
            <div style={{ opacity: 0.72, fontWeight: 800, fontSize: 12, marginTop: 4 }}>
              Aktif aboneliğin varsa kotayı burada görürsün.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={badgeStyle()}>🧾 Şeffaf kullanım</span>
            <span style={{ ...badgeStyle(), borderColor: "rgba(124,58,237,0.18)", background: "rgba(124,58,237,0.10)" }}>
              ⚡ Hızlı aktivasyon
            </span>
          </div>
        </div>

        <div style={{ padding: 14, paddingTop: 0 }}>
          {activeSub ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
                <InfoCard title="Kullanılan" value={String(quotaUsed)} hint="Şu ana kadar" />
                <InfoCard title="Toplam" value={String(quotaTotal)} hint="Bu dönem" />
                <InfoCard title="Kalan" value={String(remaining)} hint="Lead alımı için" />
                <InfoCard title="Bitiş" value={new Date(activeSub.expiresAt).toLocaleDateString("tr-TR")} hint="Abonelik sonu" />
              </div>

              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.72)",
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900, opacity: 0.85 }}>Kota progress</div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>{usedPct}%</div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    height: 12,
                    borderRadius: 999,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.70)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${usedPct}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
                      boxShadow: "0 16px 30px rgba(2,6,23,0.10)",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.78, fontWeight: 850 }}>
              Aktif abonelik bulunamadı. Paket satın alarak lead almaya başlayabilirsin.
            </div>
          )}
        </div>
      </div>

      {/* PACKAGES */}
      <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
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
              {p.featured ? <span style={{ ...badgeStyle(), background: "rgba(124,58,237,0.10)", borderColor: "rgba(124,58,237,0.18)" }}>⭐ Önerilen</span> : null}
            </div>

            <div style={{ fontSize: 30, fontWeight: 950, lineHeight: 1.05 }}>{p.priceText}</div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={chipStyle()}>🎯 {p.leads} lead</span>
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

      <div style={{ marginTop: 16, opacity: 0.75 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Not</div>
        <div style={{ fontWeight: 800, lineHeight: 1.7 }}>
          PayTR entegrasyonu sonraki adım. Şu an “mock ödeme” ile kota güncellenir ve PaymentLog kaydı tutulur.
        </div>
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