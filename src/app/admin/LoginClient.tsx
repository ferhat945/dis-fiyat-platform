"use client";

import type { JSX } from "react";
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

      window.location.href = "/admin";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="adminLoginPage">
      <div className="adminLoginShell">
        <div className="adminLoginHero">
          <div className="adminLoginBadge">🔐 Yönetici Alanı</div>

          <h1>Admin paneline güvenli giriş</h1>

          <p>
            Klinikler, leadler, abonelikler, atamalar ve dağıtım loglarını yönetmek için
            ADMIN_KEY ile giriş yap.
          </p>

          <div className="adminLoginFeatures">
            <div>
              <span>🏥</span>
              <strong>Klinik yönetimi</strong>
            </div>
            <div>
              <span>📥</span>
              <strong>Lead takibi</strong>
            </div>
            <div>
              <span>📊</span>
              <strong>Dağıtım logları</strong>
            </div>
          </div>
        </div>

        <div className="adminLoginCard">
          <div className="adminLoginCardHead">
            <div className="adminLoginIcon">🔑</div>
            <div>
              <h2>Admin Giriş</h2>
              <p>Devam etmek için yönetici anahtarını gir.</p>
            </div>
          </div>

          <div className="adminLoginForm">
            <label>
              <span>ADMIN_KEY</span>
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="ADMIN_KEY"
                type="password"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && key && !loading) {
                    void submit();
                  }
                }}
              />
            </label>

            {err ? <div className="adminLoginError">Hata: {err}</div> : null}

            <button onClick={submit} disabled={!key || loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
            </button>
          </div>

          <div className="adminLoginNote">
            Bu alan sadece yetkili yöneticiler içindir. Anahtar doğruysa admin paneline yönlendirilirsin.
          </div>
        </div>
      </div>
    </section>
  );
}