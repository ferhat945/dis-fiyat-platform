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
    <section className="loginPageModern">
      <div className="loginGrid">
        <div className="loginHeroSide">
          <div className="loginBadge">🦷 Klinik Paneli</div>

          <h1 className="loginHeroTitle">
            Klinik hesabına giriş yap, leadlerini yönet.
          </h1>

          <p className="loginHeroText">
            DişFiyat360 klinik panelinden gelen talepleri takip et, hizmet bölgelerini yönet ve
            hasta adaylarına hızlıca dönüş yap.
          </p>

          <div className="loginFeatureGrid">
            <div className="loginFeatureCard">
              <span>📥</span>
              <strong>Leadleri tek ekrandan takip et</strong>
            </div>

            <div className="loginFeatureCard">
              <span>📍</span>
              <strong>Şehir ve hizmet kapsamını yönet</strong>
            </div>

            <div className="loginFeatureCard">
              <span>⚡</span>
              <strong>Uygun hastalara hızlı dönüş yap</strong>
            </div>
          </div>
        </div>

        <div className="loginCardShell">
          <div className="loginCard">
            <div className="loginCardTop">
              <div>
                <h2>Klinik Girişi</h2>
                <p>Paneline erişmek için bilgilerini gir.</p>
              </div>

              <Link href="/register" className="loginRegisterLink">
                Kayıt Ol →
              </Link>
            </div>

            <form onSubmit={onSubmit} className="loginForm">
              <label>
                <span>Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="klinik@email.com"
                  type="email"
                  autoComplete="email"
                />
              </label>

              <label>
                <span>Şifre</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifreniz"
                  type="password"
                  autoComplete="current-password"
                />
              </label>

              <button type="submit" disabled={loading}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
              </button>

              {err ? <div className="loginError">{err}</div> : null}
            </form>

            <div className="loginInfo">
              Hesabın onay bekliyorsa admin panelden aktif edilince giriş yapabilirsin.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}