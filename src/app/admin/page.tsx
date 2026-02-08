import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import AdminLoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function AdminHomePage(): Promise<JSX.Element> {
  try {
    await requireAdmin();
  } catch {
    return <AdminLoginClient />;
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>Admin Panel</h1>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Çıkış
          </button>
        </form>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <Link href="/admin/clinics" style={card()}>
          Klinikler →
        </Link>
        <Link href="/admin/coverages" style={card()}>
          Coverage (Şehir/Hizmet) →
        </Link>
        <Link href="/admin/subscriptions" style={card()}>
          Abonelik/Kota →
        </Link>
        <Link href="/admin/assignments" style={card()}>
          Atamalar →
        </Link>
        <Link href="/admin/logs" style={card()}>
          Dağıtım Logları →
        </Link>
      </div>
    </div>
  );
}

function card(): React.CSSProperties {
  return {
    display: "block",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #ddd",
    textDecoration: "none",
    color: "#111",
    fontWeight: 900,
  };
}
