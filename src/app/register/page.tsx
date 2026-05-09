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
          website: "",
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
    } catch {
      setErr("Kayıt sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="clinicRegisterPage">
      <div className="clinicRegisterGrid">
        <div className="clinicRegisterHero">
          <div className="clinicRegisterBadge">🏥 Klinik Başvurusu</div>

          <h1>DişFiyat360 klinik ağına katıl.</h1>

          <p>
            Kliniğini kaydet, admin onayından sonra paneline giriş yaparak leadleri,
            hizmet bölgelerini ve abonelik sürecini yönet.
          </p>

          <div className="clinicRegisterFeatures">
            <div>
              <span>📥</span>
              <strong>Yeni hasta taleplerini takip et</strong>
            </div>

            <div>
              <span>📍</span>
              <strong>Şehir ve hizmet kapsamını belirle</strong>
            </div>

            <div>
              <span>🔒</span>
              <strong>KVKK onaylı başvuru akışı</strong>
            </div>
          </div>
        </div>

        <div className="clinicRegisterCard">
          <div className="clinicRegisterTop">
            <div>
              <h2>Klinik Kayıt</h2>
              <p>Başvurunu oluştur, admin onayından sonra giriş yap.</p>
            </div>

            <Link href="/login" className="clinicRegisterLoginLink">
              Giriş →
            </Link>
          </div>

          <div className="clinicRegisterInfo">
            Kayıt sonrası hesabın <strong>beklemede</strong> oluşturulur. Admin onayından sonra
            giriş yapabilirsin.
          </div>

          <form onSubmit={onSubmit} className="clinicRegisterForm">
            <label>
              <span>Klinik Adı</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Klinik Adı"
                autoComplete="organization"
              />
            </label>

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
              <span>Telefon</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon (opsiyonel)"
                type="tel"
                autoComplete="tel"
              />
            </label>

            <label>
              <span>Şifre</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifre"
                type="password"
                autoComplete="new-password"
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kayıt Ol →"}
            </button>

            {okMsg ? <div className="clinicRegisterSuccess">{okMsg}</div> : null}
            {err ? <div className="clinicRegisterError">{err}</div> : null}
          </form>
        </div>
      </div>
    </section>
  );
}