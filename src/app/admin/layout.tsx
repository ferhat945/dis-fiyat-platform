import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 20 }}>Admin</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin" style={lnk()}>Dashboard</Link>
          <Link href="/admin/clinics" style={lnk()}>Klinikler</Link>
          <Link href="/admin/coverages" style={lnk()}>Coverages</Link>
          <Link href="/admin/subscriptions" style={lnk()}>Abonelik</Link>
          <Link href="/admin/assignments" style={lnk()}>Atamalar</Link>
          <Link href="/admin/logs" style={lnk()}>Dağıtım Log</Link>
          <Link href="/admin/login" style={lnk()}>Giriş</Link>
        </div>
      </div>

      {children}
    </div>
  );
}

function lnk(): React.CSSProperties {
  return { textDecoration: "none", fontWeight: 800, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 10, color: "#111" };
}
