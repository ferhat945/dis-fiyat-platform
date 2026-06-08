"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PackageCode = "base" | "extra" | "credit_5" | "credit_10" | "credit_25" | "premium";

type StartResp =
  | {
      ok: true;
      mode: "trial" | "created" | "updated" | "credits_added" | "premium_started";
      package: PackageCode;
      creditsAdded?: number;
    }
  | { ok: false; code: string };

type PackageInfo = {
  code: PackageCode;
  title: string;
  subtitle: string;
  price: string;
  credits: number;
  icon: string;
  badge: string;
  accent: "blue" | "purple" | "orange" | "premium" | "dark";
  benefits: string[];
};

function isPackageCode(v: string | null): v is PackageCode {
  return (
    v === "base" ||
    v === "extra" ||
    v === "credit_5" ||
    v === "credit_10" ||
    v === "credit_25" ||
    v === "premium"
  );
}

function packageInfo(pkg: PackageCode): PackageInfo {
  if (pkg === "credit_5") {
    return {
      code: pkg,
      title: "5 Kredi Paketi",
      subtitle: "Başlangıç için hızlı kredi yükleme",
      price: "1500 TL",
      credits: 5,
      icon: "💎",
      badge: "Başlangıç",
      accent: "blue",
      benefits: ["5 lead açma hakkı", "Abonelik zorunluluğu yok", "Anında kredi yükleme"],
    };
  }

  if (pkg === "credit_10") {
    return {
      code: pkg,
      title: "10 Kredi Paketi",
      subtitle: "En popüler ve dengeli kredi paketi",
      price: "2000 TL",
      credits: 10,
      icon: "⚡",
      badge: "En Popüler",
      accent: "purple",
      benefits: ["10 lead açma hakkı", "Daha avantajlı birim maliyet", "Anında kredi yükleme"],
    };
  }

  if (pkg === "credit_25") {
    return {
      code: pkg,
      title: "25 Kredi Paketi",
      subtitle: "Yoğun çalışan klinikler için yüksek avantaj",
      price: "4000 TL",
      credits: 25,
      icon: "🚀",
      badge: "En Avantajlı",
      accent: "orange",
      benefits: ["25 lead açma hakkı", "En düşük birim maliyet", "Yoğun lead kullanımı için ideal"],
    };
  }

  if (pkg === "premium") {
    return {
      code: pkg,
      title: "Premium Üyelik",
      subtitle: "Lead dağıtımında öncelik + aylık kredi",
      price: "2500 TL / ay",
      credits: 10,
      icon: "👑",
      badge: "Premium",
      accent: "premium",
      benefits: ["Aylık 10 kredi", "Premium dağıtım önceliği", "Daha hızlı lead erişimi"],
    };
  }

  if (pkg === "base") {
    return {
      code: pkg,
      title: "Eski Aylık Abonelik",
      subtitle: "Eski kota sistemi için abonelik",
      price: "2000 TL",
      credits: 10,
      icon: "📦",
      badge: "Eski Sistem",
      accent: "dark",
      benefits: ["10 lead kotası", "30 gün kullanım", "Eski sistem uyumluluğu"],
    };
  }

  return {
    code: pkg,
    title: "Eski Ek Lead Paketi",
    subtitle: "Eski kota sistemine ek lead",
    price: "1000 TL",
    credits: 10,
    icon: "➕",
    badge: "Ek Paket",
    accent: "dark",
    benefits: ["+10 lead kotası", "Aktif aboneliğe eklenir", "Eski sistem uyumluluğu"],
  };
}

function successMessage(j: Extract<StartResp, { ok: true }>): string {
  if (j.mode === "credits_added") return `✅ ${j.creditsAdded ?? 0} kredi hesabına eklendi.`;
  if (j.mode === "premium_started") return "✅ Premium üyelik başlatıldı ve 10 kredi yüklendi.";
  if (j.mode === "trial") return "✅ Trial başlatıldı.";
  if (j.mode === "created") return "✅ Abonelik başlatıldı.";
  return "✅ Kota güncellendi.";
}

export default function BuyPage(): JSX.Element {
  const sp = useSearchParams();
  const pkgParam = sp.get("package");
  const pkg: PackageCode = isPackageCode(pkgParam) ? pkgParam : "credit_10";

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const selected = useMemo(() => packageInfo(pkg), [pkg]);

  const startMockPayment = async (): Promise<void> => {
    setLoading(true);
    setErr(null);
    setInfo(null);

    try {
      const r = await fetch("/api/payments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: selected.code }),
      });

      const j = (await r.json()) as StartResp;

      if (!r.ok || !j.ok) {
        setErr("İşlem başarısız: " + (j.ok ? "" : j.code));
        return;
      }

      setInfo(successMessage(j));

      window.setTimeout(() => {
        window.location.href = "/panel/abonelik";
      }, 650);
    } catch {
      setErr("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buyPage">
      <style>{`
        .buyPage {
          position: relative;
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 16px 58px;
          overflow: hidden;
        }

        .buyPage::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            radial-gradient(circle at 12% 0%, rgba(124,58,237,.22), transparent 34%),
            radial-gradient(circle at 95% 20%, rgba(14,165,233,.18), transparent 36%),
            radial-gradient(circle at 50% 100%, rgba(236,72,153,.10), transparent 38%);
        }

        .orb {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 999px;
          filter: blur(40px);
          opacity: .45;
          z-index: -1;
          animation: floatOrb 7s ease-in-out infinite;
        }

        .orbOne {
          top: 60px;
          right: 70px;
          background: rgba(124,58,237,.36);
        }

        .orbTwo {
          bottom: 90px;
          left: 20px;
          background: rgba(14,165,233,.26);
          animation-delay: -2.2s;
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(0,18px,0) scale(1.08); }
        }

        .topBar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 16px;
        }

        .backLink {
          text-decoration: none;
          font-weight: 950;
          color: rgba(15,23,42,.70);
          padding: 10px 13px;
          border-radius: 999px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(255,255,255,.72);
          box-shadow: 0 10px 25px rgba(15,23,42,.06);
        }

        .checkoutGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr);
          gap: 18px;
          align-items: stretch;
        }

        .checkoutHero {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 26px;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255,255,255,.72);
          background:
            linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,255,255,.58)),
            radial-gradient(circle at 10% 0%, rgba(124,58,237,.24), transparent 40%),
            radial-gradient(circle at 100% 20%, rgba(14,165,233,.16), transparent 42%);
          box-shadow: 0 30px 90px rgba(15,23,42,.12);
          backdrop-filter: blur(18px);
        }

        .checkoutHero.premium {
          color: white;
          background:
            radial-gradient(circle at 0% 0%, rgba(250,204,21,.26), transparent 32%),
            radial-gradient(circle at 100% 10%, rgba(168,85,247,.38), transparent 44%),
            linear-gradient(135deg, rgba(15,23,42,.98), rgba(67,56,202,.94));
          border-color: rgba(255,255,255,.22);
          box-shadow: 0 34px 105px rgba(67,56,202,.28);
        }

        .checkoutHero::after {
          content: "";
          position: absolute;
          inset: -120px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.50), transparent);
          transform: rotate(13deg) translateX(-58%);
          animation: shineMove 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shineMove {
          0%, 55% { transform: rotate(13deg) translateX(-62%); opacity: 0; }
          70% { opacity: .75; }
          100% { transform: rotate(13deg) translateX(62%); opacity: 0; }
        }

        .heroInner {
          position: relative;
          z-index: 1;
        }

        .iconBubble {
          width: 64px;
          height: 64px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          font-size: 32px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(15,23,42,.08);
          box-shadow: 0 18px 45px rgba(15,23,42,.08);
        }

        .premium .iconBubble {
          background: rgba(255,255,255,.14);
          border-color: rgba(255,255,255,.20);
        }

        .title {
          margin: 18px 0 0;
          font-size: clamp(36px, 4vw, 58px);
          line-height: .98;
          letter-spacing: -0.065em;
          font-weight: 1000;
        }

        .subtitle {
          margin-top: 14px;
          max-width: 650px;
          opacity: .74;
          font-weight: 850;
          line-height: 1.75;
        }

        .premium .subtitle {
          opacity: .86;
        }

        .priceBox {
          position: relative;
          z-index: 1;
          margin-top: 22px;
          border-radius: 28px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,.68);
          background: rgba(255,255,255,.68);
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: end;
        }

        .premium .priceBox {
          background: rgba(255,255,255,.12);
          border-color: rgba(255,255,255,.18);
        }

        .price {
          font-size: clamp(34px, 4vw, 50px);
          font-weight: 1000;
          letter-spacing: -0.055em;
          line-height: 1;
        }

        .summaryCard {
          border-radius: 34px;
          padding: 22px;
          border: 1px solid rgba(255,255,255,.72);
          background: rgba(255,255,255,.76);
          box-shadow: 0 30px 90px rgba(15,23,42,.10);
          backdrop-filter: blur(18px);
        }

        .benefitList {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 18px;
          padding: 12px;
          background: rgba(255,255,255,.76);
          border: 1px solid rgba(15,23,42,.08);
          font-weight: 900;
        }

        .payButton {
          width: 100%;
          margin-top: 16px;
          border: 0;
          border-radius: 20px;
          padding: 15px 18px;
          color: white;
          font-weight: 1000;
          cursor: pointer;
          background: linear-gradient(135deg, rgba(79,70,229,.98), rgba(168,85,247,.98));
          box-shadow: 0 22px 55px rgba(124,58,237,.25);
          transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
        }

        .payButton:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 28px 70px rgba(124,58,237,.32);
        }

        .payButton:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .trustGrid {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .trustItem {
          border-radius: 16px;
          padding: 10px;
          text-align: center;
          background: rgba(15,23,42,.04);
          border: 1px solid rgba(15,23,42,.06);
          font-size: 12px;
          font-weight: 950;
        }

        .notice {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px;
          border: 1px solid rgba(59,130,246,.20);
          background: rgba(59,130,246,.08);
          font-weight: 850;
          line-height: 1.65;
        }

        .successBox {
          margin-top: 14px;
          border-radius: 18px;
          padding: 12px;
          border: 1px solid rgba(34,197,94,.22);
          background: rgba(34,197,94,.10);
          font-weight: 950;
        }

        .errorBox {
          margin-top: 14px;
          border-radius: 18px;
          padding: 12px;
          border: 1px solid rgba(239,68,68,.22);
          background: rgba(239,68,68,.10);
          color: #b91c1c;
          font-weight: 950;
        }

        @media (max-width: 900px) {
          .checkoutGrid {
            grid-template-columns: 1fr;
          }

          .checkoutHero {
            min-height: auto;
          }

          .trustGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="orb orbOne" />
      <div className="orb orbTwo" />

      <div className="topBar">
        <span style={badgeStyle()}>💳 Güvenli Ödeme Alanı</span>
        <Link href="/panel/abonelik" className="backLink">
          ← Kredi Yönetimine dön
        </Link>
      </div>

      <div className="checkoutGrid">
        <section className={`checkoutHero ${selected.accent === "premium" ? "premium" : ""}`}>
          <div className="heroInner">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div className="iconBubble">{selected.icon}</div>
              <span style={selected.accent === "premium" ? premiumBadgeStyle() : badgeStyle()}>{selected.badge}</span>
            </div>

            <h1 className="title">{selected.title}</h1>
            <div className="subtitle">{selected.subtitle}</div>
          </div>

          <div className="priceBox">
            <div>
              <div style={{ opacity: 0.72, fontWeight: 950, fontSize: 12 }}>Seçilen paket</div>
              <div className="price">{selected.price}</div>
            </div>
            <div style={{ fontWeight: 1000, opacity: 0.84 }}>
              {selected.credits} kredi
            </div>
          </div>
        </section>

        <aside className="summaryCard">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
            <div>
              <div style={{ fontWeight: 1000, fontSize: 24, letterSpacing: "-0.035em" }}>Sipariş Özeti</div>
              <div style={{ opacity: 0.68, fontWeight: 850, marginTop: 4 }}>{selected.title}</div>
            </div>
            <span style={badgeStyle()}>{selected.price}</span>
          </div>

          <div className="benefitList">
            {selected.benefits.map((b) => (
              <div className="benefit" key={b}>
                <span>✅</span>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="notice">
            <strong>Not:</strong> Şu an test/mock işlem çalışır. Ödeme sistemi bağlanınca bu ekran gerçek ödeme akışına bağlanacak.
          </div>

          <button
            type="button"
            onClick={() => void startMockPayment()}
            disabled={loading}
            className="payButton"
          >
            {loading ? "İşlem hazırlanıyor..." : "⚡ İşlemi Başlat"}
          </button>

          {info ? <div className="successBox">{info}</div> : null}
          {err ? <div className="errorBox">Hata: {err}</div> : null}

          <div className="trustGrid">
            <div className="trustItem">🔒 KVKK</div>
            <div className="trustItem">⚡ Anında</div>
            <div className="trustItem">📜 Kayıtlı</div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/panel/abonelik" style={ghostLinkStyle()}>
              Paketlere Dön
            </Link>
            <Link href="/panel/leadler" style={ghostLinkStyle()}>
              Leadler →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function badgeStyle(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.78)",
    fontWeight: 950,
    fontSize: 12,
    boxShadow: "0 10px 22px rgba(15,23,42,0.06)",
  };
}

function premiumBadgeStyle(): CSSProperties {
  return {
    ...badgeStyle(),
    color: "white",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.14)",
  };
}

function ghostLinkStyle(): CSSProperties {
  return {
    flex: "1 1 130px",
    textAlign: "center",
    textDecoration: "none",
    padding: "11px 12px",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.72)",
    color: "rgba(15,23,42,0.86)",
    fontWeight: 950,
  };
}