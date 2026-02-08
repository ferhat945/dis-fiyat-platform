"use client";

import { useState } from "react";

export default function AdminLoginClient(): JSX.Element {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const j = (await r.json()) as { ok?: boolean; code?: string };
      if (!r.ok || !j.ok) {
        setErr(j.code ?? `HTTP_${r.status}`);
        return;
      }

      // cookie set edildi, sayfayı yenile
      window.location.href = "/admin";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Admin Giriş</h1>

      <div style={{ display: "grid", gap: 10 }}>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="ADMIN_KEY"
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        />

        {err && <div style={{ color: "crimson", fontWeight: 900 }}>Hata: {err}</div>}

        <button
          onClick={submit}
          disabled={!key || loading}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
            opacity: !key || loading ? 0.6 : 1,
          }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </div>
    </div>
  );
}
