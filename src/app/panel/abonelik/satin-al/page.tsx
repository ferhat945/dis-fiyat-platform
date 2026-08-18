"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type PackageCode =
  | "credit_5"
  | "credit_10"
  | "credit_25"
  | "premium";

type PaymentMethod =
  | "bank_transfer"
  | "card";

type CardStartResp =
  | {
      ok: true;
      mode: "payment_redirect";
      package: PackageCode;
      redirectUrl: string;
    }
  | {
      ok: false;
      code: string;
    };

type BankTransferStartResp =
  | {
      ok: true;
      mode: "bank_transfer";
      package: PackageCode;
      paymentLogId: string;
      orderNumber: string;

      bank: {
        bankName: string;
        accountHolder: string;
        iban: string;
      };

      payment: {
        amount: number;
        currency: "TRY";
        amountFormatted: string;
        description: string;
      };
    }
  | {
      ok: false;
      code: string;
    };

type BankTransferNotifyResp =
  | {
      ok: true;
      status: "transfer_notified";
      paymentLogId: string;
      orderNumber: string;
    }
  | {
      ok: false;
      code: string;
    };

type PaymentConfigResp = {
  ok: boolean;

  card?: {
    provider?: string;
    active: boolean;
    checkoutEnabled: boolean;
  };

  bankTransfer?: {
    active: boolean;
  };
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

  accent:
    | "blue"
    | "purple"
    | "orange"
    | "premium";

  benefits: string[];

  serviceType: string;
  duration: string;
  activation: string;
  renewal: string;
  leadPolicy: string;
};

type ActiveBankTransfer = {
  paymentLogId: string;
  orderNumber: string;

  bankName: string;
  accountHolder: string;
  iban: string;

  amountFormatted: string;
  description: string;

  notified: boolean;
};

function isPackageCode(
  value: string | null
): value is PackageCode {
  return (
    value === "credit_5" ||
    value === "credit_10" ||
    value === "credit_25" ||
    value === "premium"
  );
}

function packageInfo(
  pkg: PackageCode
): PackageInfo {
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
        "Ödeme doğrulamasından sonra aktivasyon",
      ],

      serviceType:
        "Tek seferlik dijital kredi paketi",

      duration:
        "Kredi bakiyesi tükenene kadar",

      activation:
        "Ödeme doğrulandıktan sonra hesaba tanımlanır",

      renewal:
        "Otomatik yenilenmez",

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
        "Ödeme doğrulamasından sonra aktivasyon",
      ],

      serviceType:
        "Tek seferlik dijital kredi paketi",

      duration:
        "Kredi bakiyesi tükenene kadar",

      activation:
        "Ödeme doğrulandıktan sonra hesaba tanımlanır",

      renewal:
        "Otomatik yenilenmez",

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

      serviceType:
        "Tek seferlik dijital kredi paketi",

      duration:
        "Kredi bakiyesi tükenene kadar",

      activation:
        "Ödeme doğrulandıktan sonra hesaba tanımlanır",

      renewal:
        "Otomatik yenilenmez",

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

    serviceType:
      "30 günlük dijital Premium üyelik",

    duration:
      "Başarılı ödeme onayından itibaren 30 gün",

    activation:
      "Ödeme doğrulandıktan sonra başlatılır",

    renewal:
      "Otomatik yenilenmez; yeniden satın alınması gerekir",

    leadPolicy:
      "Premium öncelik; münhasır lead, belirli sayıda talep, kesin hasta, randevu veya gelir garantisi değildir.",
  };
}

function errorMessage(
  code: string
): string {
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
    return "Gönderilen paket veya işlem bilgileri doğrulanamadı.";
  }

  if (
    code === "AGREEMENTS_REQUIRED"
  ) {
    return "Devam etmek için sözleşme ve hizmet onaylarını kabul etmelisiniz.";
  }

  if (
    code === "CLINIC_NOT_FOUND"
  ) {
    return "Aktif klinik hesabı bulunamadı.";
  }

  if (
    code ===
    "BANK_TRANSFER_NOT_ACTIVE"
  ) {
    return "Havale / EFT / FAST ödeme yöntemi şu anda aktif değildir.";
  }

  if (
    code ===
    "BANK_TRANSFER_CONFIG_INVALID"
  ) {
    return "Banka transferi hesap bilgileri yapılandırılmamış. Lütfen destek ile iletişime geçin.";
  }

  if (
    code ===
    "BANK_TRANSFER_START_ERROR"
  ) {
    return "Banka transferi siparişi oluşturulamadı. Lütfen tekrar deneyin.";
  }

  if (
    code ===
    "BANK_TRANSFER_NOTIFY_ERROR"
  ) {
    return "Ödeme bildirimi alınamadı. Lütfen tekrar deneyin.";
  }

  if (
    code === "PAYMENT_NOT_FOUND"
  ) {
    return "Ödeme kaydı bulunamadı.";
  }

  if (
    code ===
    "PAYMENT_ALREADY_DELIVERED"
  ) {
    return "Bu siparişin dijital hakları zaten hesabınıza tanımlanmış.";
  }

  if (
    code ===
    "INVALID_PAYMENT_STATUS"
  ) {
    return "Bu sipariş mevcut durumunda ödeme bildirimi almaya uygun değil.";
  }

  if (
    code ===
    "PAYMENT_PROVIDER_NOT_ACTIVE"
  ) {
    return "Kartla ödeme altyapısı henüz aktif değildir.";
  }

  if (
    code ===
      "PAYMENT_START_ERROR" ||
    code ===
      "PAYMENT_FAILED"
  ) {
    return "Kartla ödeme işlemi başlatılamadı. Lütfen daha sonra tekrar deneyin.";
  }

  return (
    code ||
    "İşlem tamamlanamadı."
  );
}

function formatIban(
  value: string
): string {
  const normalized =
    value
      .replace(/\s+/g, "")
      .toUpperCase();

  return (
    normalized
      .match(/.{1,4}/g)
      ?.join(" ") ??
    normalized
  );
}

export default function BuyPage(): JSX.Element {
  const searchParams =
    useSearchParams();

  const packageParam =
    searchParams.get("package");

  const pkg: PackageCode =
    isPackageCode(packageParam)
      ? packageParam
      : "credit_10";

  const selected =
    useMemo(
      () => packageInfo(pkg),
      [pkg]
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PaymentMethod>(
      "bank_transfer"
    );

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(false);

  const [
    notifyLoading,
    setNotifyLoading,
  ] =
    useState<boolean>(false);

  const [
    err,
    setErr,
  ] =
    useState<string | null>(
      null
    );

  const [
    info,
    setInfo,
  ] =
    useState<string | null>(
      null
    );

  const [
    cardActive,
    setCardActive,
  ] =
    useState<boolean>(false);

  const [
    bankTransferActive,
    setBankTransferActive,
  ] =
    useState<boolean>(false);

  const [
    paymentConfigLoading,
    setPaymentConfigLoading,
  ] =
    useState<boolean>(true);

  const [
    serviceAgreementAccepted,
    setServiceAgreementAccepted,
  ] =
    useState<boolean>(false);

  const [
    refundPolicyAccepted,
    setRefundPolicyAccepted,
  ] =
    useState<boolean>(false);

  const [
    immediatePerformanceAccepted,
    setImmediatePerformanceAccepted,
  ] =
    useState<boolean>(false);

  const [
    bankTransfer,
    setBankTransfer,
  ] =
    useState<ActiveBankTransfer | null>(
      null
    );

  const [
    copiedField,
    setCopiedField,
  ] =
    useState<
      "iban" | "description" | null
    >(null);

  const allApprovalsAccepted =
    serviceAgreementAccepted &&
    refundPolicyAccepted &&
    immediatePerformanceAccepted;

  useEffect(() => {
    let cancelled = false;

    async function loadPaymentConfig(): Promise<void> {
      try {
        const response =
          await fetch(
            "/api/payments/config",
            {
              method: "GET",
              cache: "no-store",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "PAYMENT_CONFIG_REQUEST_FAILED"
          );
        }

        const data =
          (await response.json()) as PaymentConfigResp;

        if (cancelled) {
          return;
        }

        const nextCardActive =
          Boolean(
            data.ok &&
              data.card?.active &&
              data.card
                ?.checkoutEnabled
          );

        const nextBankActive =
          Boolean(
            data.ok &&
              data.bankTransfer
                ?.active
          );

        setCardActive(
          nextCardActive
        );

        setBankTransferActive(
          nextBankActive
        );

        if (
          nextBankActive
        ) {
          setPaymentMethod(
            "bank_transfer"
          );
        } else if (
          nextCardActive
        ) {
          setPaymentMethod(
            "card"
          );
        }
      } catch {
        if (!cancelled) {
          setCardActive(false);
          setBankTransferActive(
            false
          );
        }
      } finally {
        if (!cancelled) {
          setPaymentConfigLoading(
            false
          );
        }
      }
    }

    void loadPaymentConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const copyText =
    async (
      value: string,
      field:
        | "iban"
        | "description"
    ): Promise<void> => {
      try {
        await navigator.clipboard.writeText(
          value
        );

        setCopiedField(
          field
        );

        window.setTimeout(
          () => {
            setCopiedField(
              null
            );
          },
          1700
        );
      } catch {
        setErr(
          "Kopyalama işlemi yapılamadı. Bilgiyi elle kopyalayabilirsiniz."
        );
      }
    };

  const startBankTransfer =
    async (): Promise<void> => {
      if (
        paymentConfigLoading
      ) {
        setErr(
          "Ödeme yöntemleri kontrol ediliyor. Lütfen birkaç saniye sonra tekrar deneyin."
        );
        return;
      }

      if (
        !bankTransferActive
      ) {
        setErr(
          "Havale / EFT / FAST ödeme yöntemi şu anda aktif değildir."
        );
        return;
      }

      if (
        !allApprovalsAccepted
      ) {
        setErr(
          "Ödeme talimatı oluşturmak için sözleşme ve hizmet onaylarını kabul etmelisiniz."
        );
        return;
      }

      if (
        bankTransfer
      ) {
        return;
      }

      setLoading(true);
      setErr(null);
      setInfo(null);

      try {
        const response =
          await fetch(
            "/api/payments/bank-transfer/start",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  package:
                    selected.code,

                  serviceAgreementAccepted,

                  refundPolicyAccepted,

                  immediatePerformanceAccepted,
                }),
            }
          );

        const data =
          (await response.json()) as BankTransferStartResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          setErr(
            "İşlem başarısız: " +
              (
                data.ok
                  ? "Bilinmeyen hata"
                  : errorMessage(
                      data.code
                    )
              )
          );

          return;
        }

        setBankTransfer({
          paymentLogId:
            data.paymentLogId,

          orderNumber:
            data.orderNumber,

          bankName:
            data.bank.bankName,

          accountHolder:
            data.bank
              .accountHolder,

          iban:
            data.bank.iban,

          amountFormatted:
            data.payment
              .amountFormatted,

          description:
            data.payment
              .description,

          notified: false,
        });

        setInfo(
          "✅ Banka transferi siparişiniz oluşturuldu. Aşağıdaki bilgileri kullanarak ödemenizi gerçekleştirebilirsiniz."
        );
      } catch {
        setErr(
          "Banka transferi siparişi oluşturulurken bağlantı hatası oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

  const notifyBankTransfer =
    async (): Promise<void> => {
      if (
        !bankTransfer
      ) {
        return;
      }

      if (
        bankTransfer.notified
      ) {
        return;
      }

      setNotifyLoading(true);
      setErr(null);
      setInfo(null);

      try {
        const response =
          await fetch(
            "/api/payments/bank-transfer/notify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  paymentLogId:
                    bankTransfer
                      .paymentLogId,

                  orderNumber:
                    bankTransfer
                      .orderNumber,
                }),
            }
          );

        const data =
          (await response.json()) as BankTransferNotifyResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          setErr(
            "Ödeme bildirimi başarısız: " +
              (
                data.ok
                  ? "Bilinmeyen hata"
                  : errorMessage(
                      data.code
                    )
              )
          );

          return;
        }

        setBankTransfer(
          (current) =>
            current
              ? {
                  ...current,
                  notified: true,
                }
              : current
        );

        setInfo(
          "✅ Ödeme bildiriminiz alındı. Banka transferiniz kontrol edildikten sonra kredi veya Premium hakkınız hesabınıza tanımlanacaktır."
        );
      } catch {
        setErr(
          "Ödeme bildirimi gönderilirken bağlantı hatası oluştu."
        );
      } finally {
        setNotifyLoading(
          false
        );
      }
    };

  const startCardPayment =
    async (): Promise<void> => {
      if (
        paymentConfigLoading
      ) {
        setErr(
          "Ödeme altyapısı kontrol ediliyor. Lütfen birkaç saniye sonra tekrar deneyin."
        );
        return;
      }

      if (!cardActive) {
        setErr(
          "Kartla ödeme altyapısı henüz aktif değildir."
        );
        return;
      }

      if (
        !allApprovalsAccepted
      ) {
        setErr(
          "Ödeme işlemine devam etmek için sözleşme ve hizmet onaylarını kabul etmelisiniz."
        );
        return;
      }

      setLoading(true);
      setErr(null);
      setInfo(null);

      try {
        const response =
          await fetch(
            "/api/payments/start",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  package:
                    selected.code,

                  serviceAgreementAccepted,

                  refundPolicyAccepted,

                  immediatePerformanceAccepted,
                }),
            }
          );

        const data =
          (await response.json()) as CardStartResp;

        if (
          !response.ok ||
          !data.ok
        ) {
          setErr(
            "İşlem başarısız: " +
              (
                data.ok
                  ? "Bilinmeyen hata"
                  : errorMessage(
                      data.code
                    )
              )
          );

          return;
        }

        if (
          data.mode !==
            "payment_redirect" ||
          typeof data.redirectUrl !==
            "string" ||
          !data.redirectUrl.trim()
        ) {
          setErr(
            "Ödeme yönlendirme adresi oluşturulamadı. Kartınızdan herhangi bir tahsilat yapılmadı."
          );
          return;
        }

        setInfo(
          "✅ Güvenli ödeme sayfasına yönlendiriliyorsunuz..."
        );

        window.location.assign(
          data.redirectUrl
        );
      } catch {
        setErr(
          "Bağlantı hatası oluştu. İnternet bağlantınızı kontrol ederek tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    };

  const handlePaymentAction =
    async (): Promise<void> => {
      if (
        paymentMethod ===
        "bank_transfer"
      ) {
        await startBankTransfer();
        return;
      }

      await startCardPayment();
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
              rgba(124, 58, 237, 0.22),
              transparent 34%
            ),
            radial-gradient(
              circle at 95% 20%,
              rgba(14, 165, 233, 0.18),
              transparent 36%
            ),
            radial-gradient(
              circle at 50% 100%,
              rgba(236, 72, 153, 0.10),
              transparent 38%
            );
        }

        .orb {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.45;
          z-index: -1;
          animation: floatOrb 7s ease-in-out infinite;
        }

        .orbOne {
          top: 60px;
          right: 70px;
          background: rgba(124, 58, 237, 0.36);
        }

        .orbTwo {
          bottom: 90px;
          left: 20px;
          background: rgba(14, 165, 233, 0.26);
          animation-delay: -2.2s;
        }

        @keyframes floatOrb {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(0, 18px, 0) scale(1.08);
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
          color: rgba(15, 23, 42, 0.70);
          padding: 10px 13px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.10);
          background: rgba(255, 255, 255, 0.72);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
        }

        .checkoutGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(320px, 0.85fr);
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
          border: 1px solid rgba(255, 255, 255, 0.72);
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.88),
              rgba(255, 255, 255, 0.58)
            ),
            radial-gradient(
              circle at 10% 0%,
              rgba(124, 58, 237, 0.24),
              transparent 40%
            ),
            radial-gradient(
              circle at 100% 20%,
              rgba(14, 165, 233, 0.16),
              transparent 42%
            );
          box-shadow: 0 30px 90px rgba(15, 23, 42, 0.12);
          backdrop-filter: blur(18px);
        }

        .checkoutHero.premium {
          color: white;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(250, 204, 21, 0.26),
              transparent 32%
            ),
            radial-gradient(
              circle at 100% 10%,
              rgba(168, 85, 247, 0.38),
              transparent 44%
            ),
            linear-gradient(
              135deg,
              rgba(15, 23, 42, 0.98),
              rgba(67, 56, 202, 0.94)
            );
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: 0 34px 105px rgba(67, 56, 202, 0.28);
        }

        .heroInner {
          position: relative;
          z-index: 1;
        }

        .packageTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .iconBubble {
          width: 64px;
          height: 64px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          font-size: 32px;
          background: rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }

        .premium .iconBubble {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.20);
        }

        .title {
          margin: 18px 0 0;
          font-size: clamp(36px, 4vw, 58px);
          line-height: 0.98;
          letter-spacing: -0.065em;
          font-weight: 1000;
        }

        .subtitle {
          margin-top: 14px;
          max-width: 650px;
          opacity: 0.74;
          font-weight: 850;
          line-height: 1.75;
        }

        .premium .subtitle {
          opacity: 0.86;
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
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(255, 255, 255, 0.68);
          font-size: 13px;
          line-height: 1.55;
        }

        .premium .heroDetail {
          background: rgba(255, 255, 255, 0.10);
          border-color: rgba(255, 255, 255, 0.16);
        }

        .heroDetailLabel {
          font-weight: 1000;
          opacity: 0.68;
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
          border: 1px solid rgba(255, 255, 255, 0.68);
          background: rgba(255, 255, 255, 0.68);
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: end;
        }

        .premium .priceBox {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .priceLabel {
          opacity: 0.72;
          font-weight: 950;
          font-size: 12px;
        }

        .price {
          font-size: clamp(34px, 4vw, 50px);
          font-weight: 1000;
          letter-spacing: -0.055em;
          line-height: 1;
        }

        .creditText {
          font-weight: 1000;
          opacity: 0.84;
        }

        .summaryCard {
          border-radius: 34px;
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: rgba(255, 255, 255, 0.76);
          box-shadow: 0 30px 90px rgba(15, 23, 42, 0.10);
          backdrop-filter: blur(18px);
        }

        .summaryTitle {
          font-weight: 1000;
          font-size: 24px;
          letter-spacing: -0.035em;
        }

        .summarySubtitle {
          opacity: 0.68;
          font-weight: 850;
          margin-top: 4px;
        }

        .paymentMethods {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .paymentMethod {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: 20px;
          border: 1px solid rgba(15,23,42,.09);
          background: rgba(255,255,255,.78);
          cursor: pointer;
        }

        .paymentMethod.active {
          border-color: rgba(79,70,229,.32);
          box-shadow: inset 0 0 0 1px rgba(79,70,229,.12);
          background: rgba(238,242,255,.72);
        }

        .paymentMethod.disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .paymentMethod input {
          margin-top: 4px;
        }

        .methodTitle {
          font-weight: 1000;
          color: rgba(15,23,42,.94);
        }

        .methodText {
          margin-top: 3px;
          font-size: 11px;
          line-height: 1.55;
          color: rgba(15,23,42,.60);
          font-weight: 800;
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
          background: rgba(255, 255, 255, 0.76);
          border: 1px solid rgba(15, 23, 42, 0.08);
          font-weight: 900;
          line-height: 1.5;
        }

        .orderTable {
          margin-top: 16px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.09);
          background: rgba(255, 255, 255, 0.68);
        }

        .orderRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 11px 13px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.07);
          font-size: 13px;
        }

        .orderRow:last-child {
          border-bottom: 0;
        }

        .orderLabel {
          color: rgba(15, 23, 42, 0.66);
          font-weight: 850;
        }

        .orderValue {
          color: rgba(15, 23, 42, 0.92);
          font-weight: 1000;
          text-align: right;
        }

        .orderRow.total {
          background: rgba(79, 70, 229, 0.07);
        }

        .notice {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px;
          border: 1px solid rgba(59, 130, 246, 0.20);
          background: rgba(59, 130, 246, 0.08);
          font-weight: 850;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.78);
          font-size: 13px;
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
          border: 1px solid rgba(15, 23, 42, 0.09);
          background: rgba(255, 255, 255, 0.70);
          cursor: pointer;
        }

        .approvalItem input {
          width: 18px;
          height: 18px;
          margin: 2px 0 0;
          accent-color: #4f46e5;
        }

        .approvalText {
          color: rgba(15, 23, 42, 0.78);
          font-size: 12px;
          font-weight: 820;
          line-height: 1.65;
        }

        .approvalText a {
          color: #4338ca;
          font-weight: 1000;
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
              rgba(79, 70, 229, 0.98),
              rgba(168, 85, 247, 0.98)
            );
        }

        .payButton:disabled {
          opacity: .52;
          cursor: not-allowed;
        }

        .bankBox {
          margin-top: 16px;
          padding: 17px;
          border-radius: 24px;
          border: 1px solid rgba(34,197,94,.22);
          background:
            linear-gradient(
              135deg,
              rgba(240,253,244,.96),
              rgba(255,255,255,.94)
            );
        }

        .bankTitle {
          font-size: 18px;
          font-weight: 1000;
          color: #14532d;
        }

        .bankRow {
          margin-top: 10px;
          padding: 11px 12px;
          border-radius: 15px;
          background: white;
          border: 1px solid rgba(15,23,42,.08);
        }

        .bankLabel {
          font-size: 10px;
          font-weight: 900;
          color: rgba(15,23,42,.55);
        }

        .bankValue {
          margin-top: 3px;
          font-weight: 1000;
          color: rgba(15,23,42,.94);
          word-break: break-word;
        }

        .copyButton {
          margin-top: 7px;
          border: 1px solid rgba(15,23,42,.10);
          background: rgba(248,250,252,.95);
          border-radius: 10px;
          padding: 7px 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .transferWarning {
          margin-top: 12px;
          padding: 12px;
          border-radius: 15px;
          background: rgba(245,158,11,.10);
          color: #92400e;
          font-size: 12px;
          font-weight: 850;
          line-height: 1.65;
        }

        .notifyButton {
          width: 100%;
          margin-top: 14px;
          border: 0;
          border-radius: 16px;
          padding: 14px;
          background: #15803d;
          color: white;
          font-weight: 1000;
          cursor: pointer;
        }

        .notifyButton:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .successBox {
          margin-top: 14px;
          border-radius: 18px;
          padding: 12px;
          border: 1px solid rgba(34, 197, 94, 0.22);
          background: rgba(34, 197, 94, 0.10);
          font-weight: 950;
        }

        .errorBox {
          margin-top: 14px;
          border-radius: 18px;
          padding: 12px;
          border: 1px solid rgba(239, 68, 68, 0.22);
          background: rgba(239, 68, 68, 0.10);
          color: #b91c1c;
          font-weight: 950;
        }

        .bottomLinks {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .checkoutGrid {
            grid-template-columns: 1fr;
          }

          .checkoutHero {
            min-height: auto;
          }
        }

        @media (max-width: 560px) {
          .heroDetail {
            grid-template-columns: 1fr;
          }

          .orderRow {
            flex-direction: column;
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
          🏦 Güvenli Ödeme Alanı
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
            selected.accent ===
            "premium"
              ? "premium"
              : ""
          }`}
        >
          <div className="heroInner">
            <div className="packageTop">
              <div className="iconBubble">
                {selected.icon}
              </div>

              <span
                style={
                  selected.accent ===
                  "premium"
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
              <HeroDetail
                label="Hizmet türü"
                value={
                  selected.serviceType
                }
              />

              <HeroDetail
                label="Kapsam"
                value={`${selected.credits} kredi`}
              />

              <HeroDetail
                label="Geçerlilik"
                value={
                  selected.duration
                }
              />

              <HeroDetail
                label="Aktivasyon"
                value={
                  selected.activation
                }
              />

              <HeroDetail
                label="Yenileme"
                value={
                  selected.renewal
                }
              />
            </div>
          </div>

          <div className="priceBox">
            <div>
              <div className="priceLabel">
                Seçilen paket
              </div>

              <div className="price">
                {selected.price}
              </div>
            </div>

            <div className="creditText">
              {selected.credits} kredi
            </div>
          </div>
        </section>

        <aside className="summaryCard">
          <div className="summaryTitle">
            Sipariş Özeti
          </div>

          <div className="summarySubtitle">
            {selected.title}
          </div>

          <div className="paymentMethods">
            <label
              className={`paymentMethod ${
                paymentMethod ===
                "bank_transfer"
                  ? "active"
                  : ""
              } ${
                !bankTransferActive
                  ? "disabled"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                disabled={
                  !bankTransferActive ||
                  Boolean(
                    bankTransfer
                  )
                }
                checked={
                  paymentMethod ===
                  "bank_transfer"
                }
                onChange={() =>
                  setPaymentMethod(
                    "bank_transfer"
                  )
                }
              />

              <div>
                <div className="methodTitle">
                  🏦 Havale / EFT / FAST
                </div>

                <div className="methodText">
                  Garanti BBVA işletme
                  hesabına banka
                  transferi yaparak ödeme.
                  Ödeme banka hesabında
                  doğrulandıktan sonra
                  paket hesabına
                  tanımlanır.
                </div>
              </div>
            </label>

            <label
              className={`paymentMethod ${
                paymentMethod === "card"
                  ? "active"
                  : ""
              } ${
                !cardActive
                  ? "disabled"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                disabled={
                  !cardActive ||
                  Boolean(
                    bankTransfer
                  )
                }
                checked={
                  paymentMethod ===
                  "card"
                }
                onChange={() =>
                  setPaymentMethod(
                    "card"
                  )
                }
              />

              <div>
                <div className="methodTitle">
                  💳 Kredi / Banka Kartı
                </div>

                <div className="methodText">
                  {cardActive
                    ? "Kartla güvenli online ödeme."
                    : "Sanal POS entegrasyonu tamamlandığında aktif olacaktır."}
                </div>
              </div>
            </label>
          </div>

          <div className="benefitList">
            {selected.benefits.map(
              (benefit) => (
                <div
                  className="benefit"
                  key={benefit}
                >
                  <span>✅</span>
                  <span>{benefit}</span>
                </div>
              )
            )}
          </div>

          <div className="orderTable">
            <OrderRow
              label="Paket"
              value={
                selected.title
              }
            />

            <OrderRow
              label="Kredi miktarı"
              value={`${selected.credits} kredi`}
            />

            <OrderRow
              label="Hizmet süresi"
              value={
                selected.duration
              }
            />

            <OrderRow
              label="Yenileme"
              value={
                selected.renewal
              }
            />

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

          {!bankTransfer ? (
            <>
              <div className="approvalList">
                <ApprovalCheckbox
                  checked={
                    serviceAgreementAccepted
                  }
                  onChange={
                    setServiceAgreementAccepted
                  }
                >
                  <Link
                    href="/mesafeli-satis-sozlesmesi"
                    target="_blank"
                  >
                    Dijital Hizmet Satış ve
                    Kullanım Sözleşmesi
                  </Link>
                  ’ni okudum ve kabul
                  ediyorum.
                </ApprovalCheckbox>

                <ApprovalCheckbox
                  checked={
                    refundPolicyAccepted
                  }
                  onChange={
                    setRefundPolicyAccepted
                  }
                >
                  <Link
                    href="/teslimat-iade"
                    target="_blank"
                  >
                    Teslimat ve İade
                    Şartları
                  </Link>
                  ’nı ve{" "}
                  <Link
                    href="/iptal-iade"
                    target="_blank"
                  >
                    İptal ve İade
                    Politikası
                  </Link>
                  ’nı okudum ve kabul
                  ediyorum.
                </ApprovalCheckbox>

                <ApprovalCheckbox
                  checked={
                    immediatePerformanceAccepted
                  }
                  onChange={
                    setImmediatePerformanceAccepted
                  }
                >
                  Ödeme doğrulandıktan
                  sonra dijital hizmetin
                  hemen başlatılmasını ve
                  satın aldığım kredi veya
                  üyelik hakkının hesabıma
                  tanımlanmasını talep
                  ediyorum.
                </ApprovalCheckbox>
              </div>

              <button
                type="button"
                onClick={() =>
                  void handlePaymentAction()
                }
                disabled={
                  loading ||
                  paymentConfigLoading ||
                  !allApprovalsAccepted ||
                  (
                    paymentMethod ===
                      "bank_transfer" &&
                    !bankTransferActive
                  ) ||
                  (
                    paymentMethod ===
                      "card" &&
                    !cardActive
                  )
                }
                className="payButton"
              >
                {loading
                  ? "İşlem hazırlanıyor..."
                  : paymentConfigLoading
                    ? "Ödeme yöntemleri kontrol ediliyor..."
                    : paymentMethod ===
                        "bank_transfer"
                      ? `${selected.totalPrice} için Havale / EFT Talimatı Oluştur`
                      : `${selected.totalPrice} Kartla Öde`}
              </button>
            </>
          ) : null}

          {bankTransfer ? (
            <div className="bankBox">
              <div className="bankTitle">
                🏦 Banka Transferi
              </div>

              <div className="bankRow">
                <div className="bankLabel">
                  BANKA
                </div>

                <div className="bankValue">
                  {bankTransfer.bankName}
                </div>
              </div>

              <div className="bankRow">
                <div className="bankLabel">
                  HESAP SAHİBİ
                </div>

                <div className="bankValue">
                  {
                    bankTransfer.accountHolder
                  }
                </div>

                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color:
                      "rgba(15,23,42,.58)",
                    fontWeight: 800,
                  }}
                >
                  DişFiyat360
                </div>
              </div>

              <div className="bankRow">
                <div className="bankLabel">
                  IBAN
                </div>

                <div className="bankValue">
                  {formatIban(
                    bankTransfer.iban
                  )}
                </div>

                <button
                  type="button"
                  className="copyButton"
                  onClick={() =>
                    void copyText(
                      bankTransfer.iban,
                      "iban"
                    )
                  }
                >
                  {copiedField === "iban"
                    ? "✓ Kopyalandı"
                    : "IBAN'ı Kopyala"}
                </button>
              </div>

              <div className="bankRow">
                <div className="bankLabel">
                  GÖNDERİLECEK TUTAR
                </div>

                <div
                  className="bankValue"
                  style={{
                    fontSize: 21,
                  }}
                >
                  {
                    bankTransfer.amountFormatted
                  }
                </div>
              </div>

              <div className="bankRow">
                <div className="bankLabel">
                  TRANSFER AÇIKLAMASI
                </div>

                <div className="bankValue">
                  {
                    bankTransfer.description
                  }
                </div>

                <button
                  type="button"
                  className="copyButton"
                  onClick={() =>
                    void copyText(
                      bankTransfer.description,
                      "description"
                    )
                  }
                >
                  {copiedField ===
                  "description"
                    ? "✓ Kopyalandı"
                    : "Açıklamayı Kopyala"}
                </button>
              </div>

              <div className="transferWarning">
                <strong>
                  Önemli:
                </strong>{" "}
                Ödemenizin doğru klinik
                hesabıyla
                eşleştirilebilmesi için
                banka transferinin
                açıklama alanına{" "}
                <strong>
                  {
                    bankTransfer.description
                  }
                </strong>{" "}
                kodunu aynen yazınız.
              </div>

              {!bankTransfer.notified ? (
                <button
                  type="button"
                  className="notifyButton"
                  disabled={
                    notifyLoading
                  }
                  onClick={() =>
                    void notifyBankTransfer()
                  }
                >
                  {notifyLoading
                    ? "Bildirim gönderiliyor..."
                    : "✓ Ödemeyi Yaptım"}
                </button>
              ) : (
                <div
                  className="successBox"
                  style={{
                    marginTop: 14,
                  }}
                >
                  ✅ Ödeme bildiriminiz
                  alınmıştır.
                  <br />
                  <br />
                  Banka transferi
                  kontrol edildikten sonra
                  satın aldığınız kredi
                  veya Premium hakkı
                  hesabınıza
                  tanımlanacaktır.
                </div>
              )}

              <div
                style={{
                  marginTop: 11,
                  fontSize: 11,
                  lineHeight: 1.6,
                  color:
                    "rgba(15,23,42,.60)",
                  fontWeight: 800,
                }}
              >
                DişFiyat360 bu işlem
                sırasında kart bilgisi,
                banka şifresi veya
                internet bankacılığı
                giriş bilgisi istemez.
                Transfer işlemini kendi
                bankanızın mobil veya
                internet bankacılığı
                üzerinden
                gerçekleştirirsiniz.
              </div>
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

          <div className="bottomLinks">
            <Link
              href="/panel/abonelik"
              style={ghostLinkStyle()}
            >
              Paketlere Dön
            </Link>

            <Link
              href="/panel/islemler"
              style={ghostLinkStyle()}
            >
              İşlem Geçmişi →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HeroDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="heroDetail">
      <div className="heroDetailLabel">
        {label}
      </div>

      <div className="heroDetailValue">
        {value}
      </div>
    </div>
  );
}

function OrderRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="orderRow">
      <span className="orderLabel">
        {label}
      </span>

      <span className="orderValue">
        {value}
      </span>
    </div>
  );
}

function ApprovalCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label className="approvalItem">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
      />

      <span className="approvalText">
        {children}
      </span>
    </label>
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