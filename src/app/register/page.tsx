"use client";

import Link from "next/link";
import { useState } from "react";

type RegisterResp =
  | { ok: true; mode: "created"; clinicId: string }
  | { ok: false; code: string };

export default function RegisterPage(): JSX.Element {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    setLoading(true);

    try {
      const r = await fetch("/api/panel/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          website: "", // honeypot
        }),
      });

      const j = (await r.json()) as RegisterResp;

      if (!r.ok || !j.ok) {
        const code = j.ok ? "UNKNOWN" : j.code;
        if (code === "EMAIL_ALREADY_EXISTS") {
          setErr("Bu email zaten kayıtlı. Giriş yapmayı deneyin.");
        } else if (code === "VALIDATION_ERROR") {
          setErr("Lütfen bilgileri kontrol edin.");
        } else {
          setErr("Kayıt başarısız: " + code);
        }
        return;
      }

      setOkMsg("✅ Başvurun alındı. Admin onayından sonra giriş yapabileceksin.");
      // İstersen otomatik login sayfasına da atabiliriz:
      // setTimeout(() => (window.location.href = "/login"), 900);
    } catch {
      setErr("Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Klinik Kayıt</h1>
        <Link href="/login" style={{ textDecoration: "none", opacity: 0.8 }}>
          Giriş →
        </Link>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12, opacity: 0.85 }}>
        Kayıt sonrası hesabın <strong>beklemede</strong> oluşturulur. Admin onayından sonra giriş yapabilirsin.
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Klinik Adı"
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefon (opsiyonel)"
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
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>

        {okMsg && <div style={{ fontWeight: 800 }}>{okMsg}</div>}
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}