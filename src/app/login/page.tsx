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
    <section
      style={{
        minHeight: "calc(100vh - 260px)",
        padding: "56px 16px 72px",
        background:
          "radial-gradient(circle at 15% 10%, rgba(59,130,246,0.16), transparent 32%), radial-gradient(circle at 85% 20%, rgba(20,184,166,0.14), transparent 30%)",
      }}
    >
      <div
        style={{
          maxWidth: 1060,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(37,99,235,0.10)",
              border: "1px solid rgba(37,99,235,0.16)",
              color: "#1d4ed8",
              fontWeight: 900,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            🦷 Klinik Paneli
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 44,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              fontWeight: 950,
              color: "#0f172a",
            }}
          >
            Klinik hesabına giriş yap, leadlerini yönet.
          </h1>

          <p
            style={{
              margin: "16px 0 0",
              maxWidth: 560,
              color: "rgba(15,23,42,0.68)",
              fontSize: 16,
              lineHeight: 1.8,
              fontWeight: 700,
            }}
          >
            DişFiyat360 klinik panelinden gelen talepleri takip et, hizmet bölgelerini yönet ve
            hasta adaylarına hızlıca dönüş yap.
          </p>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gap: 12,
              maxWidth: 560,
            }}
          >
            {[
              ["📥", "Leadleri tek ekrandan takip et"],
              ["📍", "Şehir ve hizmet kapsamanı yönet"],
              ["⚡", "Uygun hastalara hızlı dönüş yap"],
            ].map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 14px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(15,23,42,0.08)",
                  boxShadow: "0 14px 34px rgba(2,6,23,0.06)",
                  fontWeight: 850,
                  color: "rgba(15,23,42,0.82)",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(20,184,166,0.14))",
                  }}
                >
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: 30,
            padding: 18,
            background: "rgba(255,255,255,0.60)",
            border: "1px solid rgba(15,23,42,0.08)",
            boxShadow: "0 28px 80px rgba(2,6,23,0.12)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              padding: 24,
              background: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    fontWeight: 950,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Klinik Girişi
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(15,23,42,0.60)",
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  Paneline erişmek için bilgilerini gir.
                </p>
              </div>

              <Link
                href="/register"
                style={{
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: 13,
                  padding: "9px 11px",
                  borderRadius: 999,
                  color: "#2563eb",
                  background: "rgba(37,99,235,0.09)",
                  border: "1px solid rgba(37,99,235,0.14)",
                  whiteSpace: "nowrap",
                }}
              >
                Kayıt Ol →
              </Link>
            </div>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: "rgba(15,23,42,0.78)" }}>
                  Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="klinik@email.com"
                  type="email"
                  autoComplete="email"
                  style={{
                    padding: "13px 14px",
                    border: "1px solid rgba(15,23,42,0.12)",
                    borderRadius: 16,
                    outline: "none",
                    fontWeight: 800,
                    background: "rgba(248,250,252,0.95)",
                    color: "#0f172a",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: "rgba(15,23,42,0.78)" }}>
                  Şifre
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifreniz"
                  type="password"
                  autoComplete="current-password"
                  style={{
                    padding: "13px 14px",
                    border: "1px solid rgba(15,23,42,0.12)",
                    borderRadius: 16,
                    outline: "none",
                    fontWeight: 800,
                    background: "rgba(248,250,252,0.95)",
                    color: "#0f172a",
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: "13px 14px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                  color: "#fff",
                  fontWeight: 950,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 18px 38px rgba(37,99,235,0.24)",
                }}
              >
                {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
              </button>

              {err ? (
                <div
                  style={{
                    marginTop: 4,
                    padding: "11px 12px",
                    borderRadius: 16,
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.16)",
                    color: "#b91c1c",
                    fontWeight: 850,
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {err}
                </div>
              ) : null}
            </form>

            <div
              style={{
                marginTop: 16,
                padding: "12px 13px",
                borderRadius: 18,
                background: "rgba(15,23,42,0.04)",
                color: "rgba(15,23,42,0.66)",
                fontSize: 13,
                lineHeight: 1.6,
                fontWeight: 750,
              }}
            >
              Hesabın onay bekliyorsa admin panelden aktif edilince giriş yapabilirsin.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}