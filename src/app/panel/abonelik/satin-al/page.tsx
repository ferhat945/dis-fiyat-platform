"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PackageCode =
  | "credit_5"
  | "credit_10"
  | "credit_25"
  | "premium";

type StartResp =
  | {
      ok: true;
      mode:
        | "trial"
        | "created"
        | "updated"
        | "credits_added"
        | "premium_started";
      package: PackageCode;
      creditsAdded?: number;
    }
  | {
      ok: false;
      code: string;
    };

type PackageInfo = {
  code: PackageCode;
  title: string;
  subtitle: string;
  price: string;
  totalPrice: string;
  credits: number;
  icon: string;
  badge: string;
  accent: "blue" | "purple" | "orange" | "premium";
  benefits: string[];
  serviceType: string;
  duration: string;
  activation: string;
  renewal: string;
  leadPolicy: string;
};

function isPackageCode(value: string | null): value is PackageCode {
  return (
    value === "credit_5" ||
    value === "credit_10" ||
    value === "credit_25" ||
    value === "premium"
  );
}

function packageInfo(pkg: PackageCode): PackageInfo {
  if (pkg === "credit_5") {
    return {
      code: pkg,
      title: "5 Kredi Paketi",
      subtitle:
        "Başlangıç için hazırlanmış tek seferlik lead görüntüleme paketi",
      price: "1.500 TL",
      totalPrice: "1.500 TL",
      credits: 5,
      icon: "💎",
      badge: "Başlangıç",
      accent: "blue",
      benefits: [
        "5 lead iletişim kaydını görüntüleme hakkı",
        "Abonelik zorunluluğu olmadan kullanım",
        "Başarılı ödeme onayından sonra aktivasyon",
      ],
      serviceType: "Tek seferlik dijital kredi paketi",
      duration: "Kredi bakiyesi tükenene kadar",
      activation:
        "Başarılı ödeme onayından sonra hesaba tanımlanır",
      renewal: "Otomatik yenilenmez",
      leadPolicy:
        "Lead kaydı; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
    };
  }

  if (pkg === "credit_10") {
    return {
      code: pkg,
      title: "10 Kredi Paketi",
      subtitle:
        "Dengeli kullanım için hazırlanmış tek seferlik kredi paketi",
      price: "2.000 TL",
      totalPrice: "2.000 TL",
      credits: 10,
      icon: "⚡",
      badge: "En Popüler",
      accent: "purple",
      benefits: [
        "10 lead iletişim kaydını görüntüleme hakkı",
        "5 kredi paketine göre daha avantajlı birim maliyet",
        "Başarılı ödeme onayından sonra aktivasyon",
      ],
      serviceType: "Tek seferlik dijital kredi paketi",
      duration: "Kredi bakiyesi tükenene kadar",
      activation:
        "Başarılı ödeme onayından sonra hesaba tanımlanır",
      renewal: "Otomatik yenilenmez",
      leadPolicy:
        "Lead kaydı; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
    };
  }

  if (pkg === "credit_25") {
    return {
      code: pkg,
      title: "25 Kredi Paketi",
      subtitle:
        "Yoğun lead kullanan klinikler için hazırlanmış kredi paketi",
      price: "4.000 TL",
      totalPrice: "4.000 TL",
      credits: 25,
      icon: "🚀",
      badge: "En Avantajlı",
      accent: "orange",
      benefits: [
        "25 lead iletişim kaydını görüntüleme hakkı",
        "Paketler arasındaki en düşük birim maliyet",
        "Yoğun lead kullanımı için yüksek kredi bakiyesi",
      ],
      serviceType: "Tek seferlik dijital kredi paketi",
      duration: "Kredi bakiyesi tükenene kadar",
      activation:
        "Başarılı ödeme onayından sonra hesaba tanımlanır",
      renewal: "Otomatik yenilenmez",
      leadPolicy:
        "Lead kaydı; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
    };
  }

  return {
    code: "premium",
    title: "Premium Üyelik",
    subtitle:
      "30 günlük Premium üyelik, 10 kredi ve uygun lead dağıtımlarında öncelik",
    price: "2.500 TL / 30 gün",
    totalPrice: "2.500 TL",
    credits: 10,
    icon: "👑",
    badge: "Premium",
    accent: "premium",
    benefits: [
      "Üyelik başlangıcında 10 kredi",
      "Uygun lead dağıtımlarında standart kliniklere göre öncelik",
      "30 günlük Premium üyelik süresi",
    ],
    serviceType: "30 günlük dijital Premium üyelik",
    duration: "Başarılı ödeme onayından itibaren 30 gün",
    activation:
      "Başarılı ödeme onayından sonra başlatılır",
    renewal:
      "Otomatik yenilenmez; yeniden satın alınması gerekir",
    leadPolicy:
      "Premium öncelik; münhasır lead, belirli sayıda talep, kesin hasta, randevu veya gelir garantisi değildir.",
  };
}

function successMessage(
  response: Extract<StartResp, { ok: true }>
): string {
  if (response.mode === "credits_added") {
    return `✅ ${response.creditsAdded ?? 0} kredi hesabına eklendi.`;
  }

  if (response.mode === "premium_started") {
    return "✅ Premium üyelik başlatıldı ve 10 kredi yüklendi.";
  }

  if (response.mode === "trial") {
    return "✅ Deneme üyeliği başlatıldı.";
  }

  if (response.mode === "created") {
    return "✅ Abonelik başlatıldı.";
  }

  return "✅ Kota güncellendi.";
}

function errorMessage(code: string): string {
  if (
    code === "UNAUTHORIZED" ||
    code === "UNAUTHORIZED_CLINIC"
  ) {
    return "Oturum bulunamadı. Lütfen tekrar giriş yap.";
  }

  if (
    code === "INVALID_PACKAGE" ||
    code === "VALIDATION_ERROR"
  ) {
    return "Gönderilen ödeme veya paket bilgileri doğrulanamadı.";
  }

  if (code === "CLINIC_NOT_FOUND") {
    return "Aktif klinik hesabı bulunamadı.";
  }

  if (code === "PAYMENT_PROVIDER_NOT_ACTIVE") {
    return "iyzico ödeme altyapısı henüz aktif değildir. Ödeme alınmamış ve hesabına herhangi bir kredi veya üyelik hakkı tanımlanmamıştır.";
  }

  if (
    code === "PAYMENT_START_ERROR" ||
    code === "PAYMENT_FAILED"
  ) {
    return "Ödeme işlemi başlatılamadı. Lütfen daha sonra tekrar dene.";
  }

  return code || "İşlem tamamlanamadı.";
}

export default function BuyPage(): JSX.Element {
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package");

  const pkg: PackageCode = isPackageCode(packageParam)
    ? packageParam
    : "credit_10";

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [
    serviceAgreementAccepted,
    setServiceAgreementAccepted,
  ] = useState<boolean>(false);

  const [
    refundPolicyAccepted,
    setRefundPolicyAccepted,
  ] = useState<boolean>(false);

  const [
    immediatePerformanceAccepted,
    setImmediatePerformanceAccepted,
  ] = useState<boolean>(false);

  const selected = useMemo(
    () => packageInfo(pkg),
    [pkg]
  );

  const allApprovalsAccepted =
    serviceAgreementAccepted &&
    refundPolicyAccepted &&
    immediatePerformanceAccepted;

  /*
   * iyzico ödeme entegrasyonu tamamlandığında bu değer,
   * sunucu tarafındaki ödeme yapılandırmasından alınmalıdır.
   *
   * Başvuru ve entegrasyon tamamlanana kadar false kalır.
   * Böylece karttan ödeme alınmaz ve yanlışlıkla kredi ya da
   * Premium üyelik tanımlanmaz.
   */
  const paymentProviderActive = false;

  const startPayment = async (): Promise<void> => {
    if (!paymentProviderActive) {
      setInfo(null);
      setErr(
        "iyzico ödeme altyapısı henüz aktif değildir. Bu nedenle ödeme işlemi başlatılamaz."
      );
      return;
    }

    if (!allApprovalsAccepted) {
      setInfo(null);
      setErr(
        "Ödeme işlemine devam etmek için sözleşme ve hizmet onaylarını kabul etmelisin."
      );
      return;
    }

    setLoading(true);
    setErr(null);
    setInfo(null);

    try {
      const response = await fetch(
        "/api/payments/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            package: selected.code,
            serviceAgreementAccepted,
            refundPolicyAccepted,
            immediatePerformanceAccepted,
          }),
        }
      );

      const data = (await response.json()) as StartResp;

      if (!response.ok || !data.ok) {
        setErr(
          "İşlem başarısız: " +
            (data.ok
              ? "Bilinmeyen hata"
              : errorMessage(data.code))
        );
        return;
      }

      setInfo(successMessage(data));

      window.setTimeout(() => {
        window.location.href = "/panel/abonelik";
      }, 650);
    } catch {
      setErr(
        "Bağlantı hatası oluştu. Lütfen internet bağlantını kontrol ederek tekrar dene."
      );
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
            radial-gradient(
              circle at 12% 0%,
              rgba(124,58,237,.22),
              transparent 34%
            ),
            radial-gradient(
              circle at 95% 20%,
              rgba(14,165,233,.18),
              transparent 36%
            ),
            radial-gradient(
              circle at 50% 100%,
              rgba(236,72,153,.10),
              transparent 38%
            );
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
          0%,
          100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(0,18px,0) scale(1.08);
          }
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
          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(320px, .85fr);
          gap: 18px;
          align-items: start;
        }

        .checkoutHero {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 26px;
          min-height: 540px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid rgba(255,255,255,.72);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.88),
              rgba(255,255,255,.58)
            ),
            radial-gradient(
              circle at 10% 0%,
              rgba(124,58,237,.24),
              transparent 40%
            ),
            radial-gradient(
              circle at 100% 20%,
              rgba(14,165,233,.16),
              transparent 42%
            );
          box-shadow: 0 30px 90px rgba(15,23,42,.12);
          backdrop-filter: blur(18px);
        }

        .checkoutHero.premium {
          color: white;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(250,204,21,.26),
              transparent 32%
            ),
            radial-gradient(
              circle at 100% 10%,
              rgba(168,85,247,.38),
              transparent 44%
            ),
            linear-gradient(
              135deg,
              rgba(15,23,42,.98),
              rgba(67,56,202,.94)
            );
          border-color: rgba(255,255,255,.22);
          box-shadow: 0 34px 105px rgba(67,56,202,.28);
        }

        .checkoutHero::after {
          content: "";
          position: absolute;
          inset: -120px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.50),
              transparent
            );
          transform: rotate(13deg) translateX(-58%);
          animation: shineMove 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes shineMove {
          0%,
          55% {
            transform: rotate(13deg) translateX(-62%);
            opacity: 0;
          }

          70% {
            opacity: .75;
          }

          100% {
            transform: rotate(13deg) translateX(62%);
            opacity: 0;
          }
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

        .heroDetails {
          position: relative;
          z-index: 1;
          margin-top: 24px;
          display: grid;
          gap: 10px;
        }

        .heroDetail {
          display: grid;
          grid-template-columns: 145px 1fr;
          gap: 12px;
          align-items: start;
          border-radius: 17px;
          padding: 11px 13px;
          background: rgba(255,255,255,.58);
          border: 1px solid rgba(255,255,255,.68);
          font-size: 13px;
          line-height: 1.55;
        }

        .premium .heroDetail {
          background: rgba(255,255,255,.10);
          border-color: rgba(255,255,255,.16);
        }

        .heroDetailLabel {
          font-weight: 1000;
          opacity: .68;
        }

        .heroDetailValue {
          font-weight: 900;
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

        .iyzicoCheckoutBox {
          margin-top: 16px;
          border-radius: 20px;
          padding: 14px;
          border: 1px solid rgba(15,23,42,.09);
          background: #ffffff;
          display: grid;
          gap: 10px;
          justify-items: center;
          text-align: center;
          overflow: hidden;
        }

        .iyzicoCheckoutLabel {
          color: rgba(15,23,42,.66);
          font-size: 11px;
          font-weight: 900;
          line-height: 1.5;
        }

        .iyzicoCheckoutLogo {
          display: block;
          width: 100%;
          max-width: 280px;
          height: auto;
          object-fit: contain;
        }

        .benefitList {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 18px;
          padding: 12px;
          background: rgba(255,255,255,.76);
          border: 1px solid rgba(15,23,42,.08);
          font-weight: 900;
          line-height: 1.5;
        }

        .orderTable {
          margin-top: 16px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(15,23,42,.09);
          background: rgba(255,255,255,.68);
        }

        .orderRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 11px 13px;
          border-bottom: 1px solid rgba(15,23,42,.07);
          font-size: 13px;
          line-height: 1.5;
        }

        .orderRow:last-child {
          border-bottom: 0;
        }

        .orderLabel {
          color: rgba(15,23,42,.66);
          font-weight: 850;
        }

        .orderValue {
          color: rgba(15,23,42,.92);
          font-weight: 1000;
          text-align: right;
        }

        .orderRow.total {
          background: rgba(79,70,229,.07);
          padding-top: 14px;
          padding-bottom: 14px;
        }

        .orderRow.total .orderLabel,
        .orderRow.total .orderValue {
          font-size: 17px;
          color: rgba(15,23,42,.96);
        }

        .approvalList {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .approvalItem {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 18px;
          padding: 12px;
          border: 1px solid rgba(15,23,42,.09);
          background: rgba(255,255,255,.70);
          cursor: pointer;
        }

        .approvalItem:hover {
          border-color: rgba(79,70,229,.24);
          background: rgba(248,250,252,.90);
        }

        .approvalItem input {
          width: 18px;
          height: 18px;
          margin: 2px 0 0;
          flex: 0 0 auto;
          accent-color: #4f46e5;
          cursor: pointer;
        }

        .approvalText {
          color: rgba(15,23,42,.78);
          font-size: 12px;
          font-weight: 820;
          line-height: 1.65;
        }

        .approvalText a {
          color: #4338ca;
          font-weight: 1000;
          text-decoration: underline;
          text-underline-offset: 2px;
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
          background:
            linear-gradient(
              135deg,
              rgba(79,70,229,.98),
              rgba(168,85,247,.98)
            );
          box-shadow: 0 22px 55px rgba(124,58,237,.25);
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            opacity .18s ease;
        }

        .payButton:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.015);
          box-shadow: 0 28px 70px rgba(124,58,237,.32);
        }

        .payButton:disabled {
          opacity: .52;
          cursor: not-allowed;
          box-shadow: none;
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
          color: rgba(15,23,42,.78);
          font-size: 13px;
        }

        .warningNotice {
          margin-top: 12px;
          border-radius: 20px;
          padding: 14px;
          border: 1px solid rgba(245,158,11,.24);
          background: rgba(245,158,11,.09);
          font-weight: 850;
          line-height: 1.65;
          color: rgba(120,53,15,.92);
          font-size: 13px;
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
          line-height: 1.55;
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

        @media (max-width: 560px) {
          .heroDetail {
            grid-template-columns: 1fr;
            gap: 3px;
          }

          .orderRow {
            flex-direction: column;
            gap: 3px;
          }

          .orderValue {
            text-align: left;
          }
        }
      `}</style>

      <div className="orb orbOne" />
      <div className="orb orbTwo" />

      <div className="topBar">
        <span style={badgeStyle()}>
          💳 Güvenli Ödeme Alanı
        </span>

        <Link
          href="/panel/abonelik"
          className="backLink"
        >
          ← Kredi Yönetimine dön
        </Link>
      </div>

      <div className="checkoutGrid">
        <section
          className={`checkoutHero ${
            selected.accent === "premium"
              ? "premium"
              : ""
          }`}
        >
          <div className="heroInner">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div className="iconBubble">
                {selected.icon}
              </div>

              <span
                style={
                  selected.accent === "premium"
                    ? premiumBadgeStyle()
                    : badgeStyle()
                }
              >
                {selected.badge}
              </span>
            </div>

            <h1 className="title">
              {selected.title}
            </h1>

            <div className="subtitle">
              {selected.subtitle}
            </div>

            <div className="heroDetails">
              <div className="heroDetail">
                <div className="heroDetailLabel">
                  Hizmet türü
                </div>

                <div className="heroDetailValue">
                  {selected.serviceType}
                </div>
              </div>

              <div className="heroDetail">
                <div className="heroDetailLabel">
                  Kapsam
                </div>

                <div className="heroDetailValue">
                  {selected.credits} kredi
                </div>
              </div>

              <div className="heroDetail">
                <div className="heroDetailLabel">
                  Geçerlilik
                </div>

                <div className="heroDetailValue">
                  {selected.duration}
                </div>
              </div>

              <div className="heroDetail">
                <div className="heroDetailLabel">
                  Aktivasyon
                </div>

                <div className="heroDetailValue">
                  {selected.activation}
                </div>
              </div>

              <div className="heroDetail">
                <div className="heroDetailLabel">
                  Yenileme
                </div>

                <div className="heroDetailValue">
                  {selected.renewal}
                </div>
              </div>
            </div>
          </div>

          <div className="priceBox">
            <div>
              <div
                style={{
                  opacity: 0.72,
                  fontWeight: 950,
                  fontSize: 12,
                }}
              >
                Seçilen paket
              </div>

              <div className="price">
                {selected.price}
              </div>
            </div>

            <div
              style={{
                fontWeight: 1000,
                opacity: 0.84,
              }}
            >
              {selected.credits} kredi
            </div>
          </div>
        </section>

        <aside className="summaryCard">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "start",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 1000,
                  fontSize: 24,
                  letterSpacing: "-0.035em",
                }}
              >
                Sipariş Özeti
              </div>

              <div
                style={{
                  opacity: 0.68,
                  fontWeight: 850,
                  marginTop: 4,
                }}
              >
                {selected.title}
              </div>
            </div>

            <span style={badgeStyle()}>
              {selected.totalPrice}
            </span>
          </div>

          <div className="iyzicoCheckoutBox">
            <div className="iyzicoCheckoutLabel">
              Ödemeler iyzico güvenli ödeme altyapısı üzerinden
              gerçekleştirilecektir.
            </div>

            <Image
              src="/payment/iyzico-checkout.png"
              alt="iyzico ile Öde"
              width={720}
              height={214}
              className="iyzicoCheckoutLogo"
              sizes="(max-width: 900px) 100vw, 280px"
            />
          </div>

          <div className="benefitList">
            {selected.benefits.map((benefit) => (
              <div
                className="benefit"
                key={benefit}
              >
                <span>✅</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="orderTable">
            <div className="orderRow">
              <span className="orderLabel">
                Paket
              </span>

              <span className="orderValue">
                {selected.title}
              </span>
            </div>

            <div className="orderRow">
              <span className="orderLabel">
                Kredi miktarı
              </span>

              <span className="orderValue">
                {selected.credits} kredi
              </span>
            </div>

            <div className="orderRow">
              <span className="orderLabel">
                Hizmet süresi
              </span>

              <span className="orderValue">
                {selected.duration}
              </span>
            </div>

            <div className="orderRow">
              <span className="orderLabel">
                Yenileme
              </span>

              <span className="orderValue">
                {selected.renewal}
              </span>
            </div>

            <div className="orderRow total">
              <span className="orderLabel">
                Ödenecek toplam
              </span>

              <span className="orderValue">
                {selected.totalPrice}
              </span>
            </div>
          </div>

          <div className="notice">
            <strong>
              Lead bilgilendirmesi:
            </strong>{" "}
            {selected.leadPolicy}
          </div>

          <div className="warningNotice">
            <strong>
              iyzico başvuru ve entegrasyon süreci:
            </strong>{" "}
            iyzico ödeme bağlantısı henüz etkin değildir. Bu
            ekranda şu anda karttan tahsilat yapılmaz ve kredi ya
            da Premium üyelik tanımlanmaz.
          </div>

          <div className="approvalList">
            <label className="approvalItem">
              <input
                type="checkbox"
                checked={serviceAgreementAccepted}
                onChange={(event) =>
                  setServiceAgreementAccepted(
                    event.target.checked
                  )
                }
              />

              <span className="approvalText">
                <Link
                  href="/mesafeli-satis-sozlesmesi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dijital Hizmet Satış ve Kullanım Sözleşmesi
                </Link>
                ’ni okudum, paket kapsamını ve kullanım
                koşullarını kabul ediyorum.
              </span>
            </label>

            <label className="approvalItem">
              <input
                type="checkbox"
                checked={refundPolicyAccepted}
                onChange={(event) =>
                  setRefundPolicyAccepted(
                    event.target.checked
                  )
                }
              />

              <span className="approvalText">
                <Link
                  href="/teslimat-iade"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Teslimat ve İade Şartları
                </Link>
                ’nı ve{" "}
                <Link
                  href="/iptal-iade"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  İptal ve İade Politikası
                </Link>
                ’nı okudum ve kabul ediyorum.
              </span>
            </label>

            <label className="approvalItem">
              <input
                type="checkbox"
                checked={immediatePerformanceAccepted}
                onChange={(event) =>
                  setImmediatePerformanceAccepted(
                    event.target.checked
                  )
                }
              />

              <span className="approvalText">
                Satın aldığım dijital hizmetin başarılı ödeme
                onayından sonra elektronik ortamda hemen
                başlatılmasını ve kredi veya üyelik hakkının
                hesabıma tanımlanmasını talep ediyorum.
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => void startPayment()}
            disabled={
              loading ||
              !allApprovalsAccepted ||
              !paymentProviderActive
            }
            className="payButton"
          >
            {loading
              ? "İşlem hazırlanıyor..."
              : paymentProviderActive
                ? `${selected.totalPrice} Öde ve Paketi Aktifleştir`
                : "iyzico Entegrasyonu Hazırlanıyor"}
          </button>

          {!allApprovalsAccepted && !loading ? (
            <div
              style={{
                marginTop: 9,
                textAlign: "center",
                color: "rgba(15,23,42,.58)",
                fontSize: 11,
                fontWeight: 850,
                lineHeight: 1.5,
              }}
            >
              Bilgilendirme, teslimat ve sözleşme metinlerini
              incelemek için onay kutularını işaretleyebilirsin.
              iyzico entegrasyonu tamamlanana kadar ödeme işlemi
              kapalıdır.
            </div>
          ) : null}

          {info ? (
            <div className="successBox">
              {info}
            </div>
          ) : null}

          {err ? (
            <div className="errorBox">
              Hata: {err}
            </div>
          ) : null}

          <div className="trustGrid">
            <div className="trustItem">
              🔒 SSL korumalı bağlantı
            </div>

            <div className="trustItem">
              🛡️ iyzico güvenli ödeme
            </div>

            <div className="trustItem">
              💳 Visa ve Mastercard
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/panel/abonelik"
              style={ghostLinkStyle()}
            >
              Paketlere Dön
            </Link>

            <Link
              href="/panel/leadler"
              style={ghostLinkStyle()}
            >
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
    border:
      "1px solid rgba(15,23,42,0.10)",
    background:
      "rgba(255,255,255,0.78)",
    fontWeight: 950,
    fontSize: 12,
    boxShadow:
      "0 10px 22px rgba(15,23,42,0.06)",
  };
}

function premiumBadgeStyle(): CSSProperties {
  return {
    ...badgeStyle(),
    color: "white",
    border:
      "1px solid rgba(255,255,255,0.18)",
    background:
      "rgba(255,255,255,0.14)",
  };
}

function ghostLinkStyle(): CSSProperties {
  return {
    flex: "1 1 130px",
    textAlign: "center",
    textDecoration: "none",
    padding: "11px 12px",
    borderRadius: 16,
    border:
      "1px solid rgba(15,23,42,0.10)",
    background:
      "rgba(255,255,255,0.72)",
    color:
      "rgba(15,23,42,0.86)",
    fontWeight: 950,
  };
}