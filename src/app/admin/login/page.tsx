"use client";

import { useState } from "react";

export default function AdminLoginPage(): JSX.Element {
  const [key, setKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function login(): Promise<void> {
    setErr(null);
    setOk(false);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const j = (await r.json()) as { ok?: boolean; code?: string };
      if (!r.ok || !j.ok) {
        setErr(j.code ?? "LOGIN_FAILED");
        return;
      }
      setOk(true);
      setKey("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    }
  }

  async function logout(): Promise<void> {
    await fetch("/api/admin/logout", { method: "POST" });
    setOk(false);
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Admin Giriş</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="ADMIN_KEY"
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        />

        {err && <div style={{ color: "crimson", fontWeight: 900 }}>Hata: {err}</div>}
        {ok && <div style={{ color: "green", fontWeight: 900 }}>Giriş başarılı ✅</div>}

        <button onClick={login} disabled={!key} style={btn()}>
          Giriş Yap
        </button>

        <button onClick={logout} style={{ ...btn(), background: "#fff", color: "#111" }}>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  };
}
