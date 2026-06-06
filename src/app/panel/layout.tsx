import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyClinicSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  if (!session) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 14 }}>Yetkisiz</h1>
        <div style={{ marginBottom: 16, opacity: 0.85, fontSize: 15 }}>
          Paneli görmek için giriş yapmalısın.
        </div>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            textDecoration: "none",
            fontSize: 15,
          }}
        >
          Giriş Yap →
        </Link>
      </div>
    );
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    select: {
      creditBalance: true,
      isPremium: true,
      premiumExpiresAt: true,
    },
  });

  const now = new Date();
  const isPremiumActive = Boolean(
    clinic?.isPremium && clinic.premiumExpiresAt && clinic.premiumExpiresAt.getTime() > now.getTime()
  );

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
        fontSize: 16,
        lineHeight: 1.7,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900 }}>Klinik Panel</div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/panel/abonelik" style={pillStyle()}>
            💎 Kredi: {clinic?.creditBalance ?? 0}
          </Link>

          {isPremiumActive ? (
            <Link href="/panel/abonelik" style={premiumPillStyle()}>
              ⭐ Premium
            </Link>
          ) : (
            <Link href="/panel/abonelik" style={softPillStyle()}>
              Premium Ol
            </Link>
          )}

          <div style={{ opacity: 0.8, fontSize: 15, fontWeight: 800 }}>{session.name}</div>
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <NavLink href="/panel">Dashboard</NavLink>
        <NavLink href="/panel/leadler">Leadler</NavLink>
        <NavLink href="/panel/hizmetler">Hizmetler</NavLink>
        <NavLink href="/panel/fiyatlar">Fiyatlar</NavLink>
        <NavLink href="/panel/profil">Profil</NavLink>
        <NavLink href="/panel/abonelik">Kredi / Premium</NavLink>
        <NavLink href="/panel/istatistik">İstatistikler</NavLink>
        <NavLink href="/panel/blog">Blog</NavLink>
      </nav>

      {children}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }): JSX.Element {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        fontWeight: 900,
        padding: "10px 14px",
        borderRadius: 12,
        border: "1px solid #ddd",
        color: "#111",
        fontSize: 15,
        background: "rgba(255,255,255,0.8)",
        transition: "all .15s ease",
      }}
    >
      {children}
    </Link>
  );
}

function pillStyle(): React.CSSProperties {
  return {
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(124,58,237,0.22)",
    background: "rgba(124,58,237,0.10)",
    color: "rgba(15,23,42,0.92)",
    fontWeight: 950,
    fontSize: 13,
  };
}

function premiumPillStyle(): React.CSSProperties {
  return {
    ...pillStyle(),
    border: "1px solid rgba(245,158,11,0.28)",
    background: "rgba(245,158,11,0.14)",
  };
}

function softPillStyle(): React.CSSProperties {
  return {
    ...pillStyle(),
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.75)",
  };
}