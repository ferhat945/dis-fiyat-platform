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

  if (!session) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 14 }}>
          Yetkisiz
        </h1>
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

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
        fontSize: 16,            // 🔥 TÜM PANEL YAZILARI BÜYÜDÜ
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
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          Klinik Panel
        </div>

        <div style={{ opacity: 0.8, fontSize: 15 }}>
          {session.name}
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
        <NavLink href="/panel/abonelik">Abonelik</NavLink>
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
        fontSize: 15,      // 🔥 Menü yazıları büyüdü
        background: "rgba(255,255,255,0.8)",
        transition: "all .15s ease",
      }}
    >
      {children}
    </Link>
  );
}