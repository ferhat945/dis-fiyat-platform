"use client";

import { useState } from "react";
import Link from "next/link";

export default function PanelLoginPage(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const r = await fetch("/api/panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!r.ok) {
        setErr("Email/şifre hatalı veya hesabın henüz onaylanmadı.");
        return;
      }

      window.location.href = "/panel/leadler";
    } catch {
      setErr("Giriş sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Klinik Girişi</h1>
        <Link href="/register" style={{ textDecoration: "none", fontWeight: 800 }}>
          Kayıt Ol →
        </Link>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          type="password"
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {loading ? "Giriş..." : "Giriş Yap"}
        </button>

        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>

      <div style={{ marginTop: 12, opacity: 0.75 }}>
        Hesabın onay bekliyorsa admin panelden aktif edilince giriş yapabilirsin.
      </div>
    </div>
  );
}