import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  // ✅ Artık login route'u /login
  if (!session) {
    return (
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Yetkisiz</h1>
        <div style={{ marginBottom: 12, opacity: 0.85 }}>
          Paneli görmek için giriş yapmalısın.
        </div>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Giriş Yap →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900 }}>Klinik Panel</div>
        <div style={{ opacity: 0.75 }}>
          {session.name}
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <NavLink href="/panel">Dashboard</NavLink>
        <NavLink href="/panel/leadler">Leadler</NavLink>
        <NavLink href="/panel/hizmetler">Hizmetler</NavLink>
        <NavLink href="/panel/profil">Profil</NavLink>
        <NavLink href="/panel/abonelik">Abonelik</NavLink>
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
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #ddd",
        color: "#111",
      }}
    >
      {children}
    </Link>
  );
}
