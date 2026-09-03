import type { CSSProperties } from "react";
import Link from "next/link";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(
  value: Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(
  amount: number,
  currency: string,
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function packageLabel(
  packageCode: string | null,
  kind: string,
): string {
  if (packageCode === "credit_5") {
    return "5 Kredi Paketi";
  }

  if (packageCode === "credit_10") {
    return "10 Kredi Paketi";
  }

  if (packageCode === "credit_25") {
    return "25 Kredi Paketi";
  }

  if (
    packageCode === "premium" ||
    kind === "premium"
  ) {
    return "Premium Üyelik";
  }

  return (
    packageCode ||
    kind ||
    "Dijital hizmet"
  );
}

function creditTypeLabel(
  type: string,
): string {
  if (type === "purchase") {
    return "Kredi satın alma";
  }

  if (type === "lead_unlock") {
    return "Lead açma";
  }

  if (
    type ===
    "premium_monthly_credit"
  ) {
    return "Premium kredisi";
  }

  return type;
}

function statusInfo(
  status: string,
): {
  label: string;
  className: string;
} {
  if (
    status === "paid" ||
    status === "success" ||
    status === "completed"
  ) {
    return {
      label: "Başarılı",
      className:
        "status statusSuccess",
    };
  }

  if (status === "started") {
    return {
      label: "Başlatıldı",
      className:
        "status statusStarted",
    };
  }

  if (status === "canceled") {
    return {
      label: "İptal Edildi",
      className:
        "status statusCanceled",
    };
  }

  if (status === "failed") {
    return {
      label: "Başarısız",
      className:
        "status statusFailed",
    };
  }

  return {
    label: status,
    className:
      "status statusDefault",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ClinicTransactionsPage(): Promise<JSX.Element> {
  const token =
    (await cookies()).get(
      "clinic_session",
    )?.value ?? "";

  const session = token
    ? await verifyClinicSession(
        token,
      )
    : null;

  if (!session) {
    return (
      <div style={unauthorizedStyle}>
        <div style={unauthorizedIconStyle}>
          🔒
        </div>

        <h1 style={unauthorizedTitleStyle}>
          Oturum gerekli
        </h1>

        <p style={unauthorizedTextStyle}>
          İşlem geçmişini görüntülemek için
          klinik hesabına giriş yapmalısın.
        </p>

        <Link
          href="/login"
          style={loginButtonStyle}
        >
          Giriş Yap →
        </Link>
      </div>
    );
  }

  /*
   * ========================================================
   * MEVCUT VERİ SORGULARI
   * ========================================================
   *
   * Buradaki iş mantığı değiştirilmedi.
   */
  const [
    payments,
    creditTransactions,
  ] = await Promise.all([
    prisma.paymentLog.findMany({
      where: {
        clinicId:
          session.clinicId,
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take: 100,

      select: {
        id: true,
        packageCode: true,
        kind: true,
        credits: true,
        amount: true,
        currency: true,
        status: true,

        /*
         * provider veritabanında tutulmaya devam eder.
         * Ancak kullanıcı arayüzünde ödeme sağlayıcısı
         * ismi göstermiyoruz.
         */
        provider: true,

        orderNumber: true,
        providerRef: true,
        callbackVerified: true,

        serviceAgreementAccepted:
          true,

        refundPolicyAccepted:
          true,

        immediatePerformanceAccepted:
          true,

        agreementVersion:
          true,

        agreementAcceptedAt:
          true,

        paidAt: true,
        failedAt: true,
        canceledAt: true,

        deliveredAt: true,

        balanceBefore: true,
        balanceAfter: true,

        premiumStartedAt:
          true,

        premiumExpiresAt:
          true,

        errorCode: true,
        errorMessage: true,

        createdAt: true,
        updatedAt: true,

        creditTransactions: {
          orderBy: {
            createdAt:
              "desc",
          },

          select: {
            id: true,
            amount: true,
            type: true,
            note: true,

            balanceBefore:
              true,

            balanceAfter:
              true,

            deliveredAt:
              true,

            createdAt:
              true,
          },
        },
      },
    }),

    prisma.creditTransaction.findMany({
      where: {
        clinicId:
          session.clinicId,
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take: 100,

      select: {
        id: true,
        paymentLogId: true,
        amount: true,
        type: true,
        note: true,

        balanceBefore:
          true,

        balanceAfter:
          true,

        deliveredAt:
          true,

        createdAt:
          true,
      },
    }),
  ]);

  /* =========================================================
     METRICS
  ========================================================= */

  const successfulPayments =
    payments.filter(
      (payment) =>
        payment.status ===
          "paid" ||
        payment.status ===
          "success" ||
        payment.status ===
          "completed",
    ).length;

  const deliveredPayments =
    payments.filter(
      (payment) =>
        Boolean(
          payment.deliveredAt,
        ),
    ).length;

  const totalPurchasedCredits =
    creditTransactions
      .filter(
        (transaction) =>
          transaction.amount >
            0 &&
          (transaction.type ===
            "purchase" ||
            transaction.type ===
              "premium_monthly_credit"),
      )
      .reduce(
        (
          total,
          transaction,
        ) =>
          total +
          transaction.amount,
        0,
      );

  /*
   * Mevcut kredi hareketleri içinden en son
   * bilinen bakiyeyi gösteriyoruz.
   *
   * Yeni bir veri modeli veya sorgu eklenmedi.
   */
  const currentCreditBalance =
    creditTransactions[0]
      ?.balanceAfter ?? 0;

  return (
    <div className="transactionsPage">
      <style>{`
        .transactionsPage {
          width: 100%;
          display: grid;
          gap: 20px;
          padding: 6px 0 60px;
          color: #151d39;
        }

        .transactionsPage * {
          box-sizing: border-box;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .historyHero {
          position: relative;
          overflow: hidden;

          min-height: 220px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 32px;

          padding: 34px 38px;

          border:
            1px solid
            rgba(93,75,165,.09);

          border-radius: 29px;

          background:
            radial-gradient(
              680px 330px at 3% 5%,
              rgba(124,85,238,.14),
              transparent 68%
            ),
            radial-gradient(
              580px 320px at 98% 30%,
              rgba(47,166,233,.11),
              transparent 70%
            ),
            linear-gradient(
              135deg,
              #ffffff,
              #faf9ff 50%,
              #f4faff
            );

          box-shadow:
            0 22px 58px
            rgba(52,40,103,.065);
        }

        .historyHero::after {
          content: "▤";

          position: absolute;
          z-index: 0;

          right: 250px;
          top: 50%;

          transform:
            translateY(-50%)
            rotate(-8deg);

          color:
            rgba(101,74,210,.045);

          font-size: 145px;
          font-weight: 950;

          pointer-events: none;
        }

        .heroCopy {
          position: relative;
          z-index: 2;

          max-width: 820px;
        }

        .historyKicker {
          display: inline-flex;

          min-height: 41px;

          align-items: center;

          gap: 8px;

          padding: 0 13px;

          border:
            1px solid
            rgba(96,77,178,.09);

          border-radius: 999px;

          background:
            rgba(255,255,255,.86);

          color: #624ac7;

          font-size: 13px;
          font-weight: 900;

          box-shadow:
            0 7px 18px
            rgba(58,46,112,.04);
        }

        .historyTitle {
          margin: 16px 0 0;

          color: #111936;

          font-size:
            clamp(
              42px,
              4vw,
              59px
            );

          line-height: 1;

          letter-spacing: -.05em;

          font-weight: 950;
        }

        .historySubtitle {
          max-width: 780px;

          margin: 15px 0 0;

          color: #626a80;

          font-size: 17px;

          line-height: 1.68;

          font-weight: 650;
        }

        .premiumLink {
          position: relative;
          z-index: 2;

          min-height: 57px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          padding: 0 22px;

          border-radius: 16px;

          background:
            linear-gradient(
              110deg,
              #7950ed,
              #654ce8
            );

          color: #ffffff;

          text-decoration: none;

          font-size: 15px;
          font-weight: 950;

          box-shadow:
            0 13px 29px
            rgba(89,68,211,.22);

          transition:
            transform .15s ease,
            box-shadow .15s ease;
        }

        .premiumLink:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 17px 35px
            rgba(89,68,211,.29);
        }

        /* =====================================================
           METRICS
        ===================================================== */

        .metricsGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );

          gap: 14px;
        }

        .metricCard {
          min-height: 140px;

          display: flex;

          align-items: center;

          gap: 16px;

          padding: 20px;

          border:
            1px solid
            rgba(91,75,159,.08);

          border-radius: 22px;

          background:
            rgba(255,255,255,.93);

          box-shadow:
            0 14px 35px
            rgba(54,42,103,.05);
        }

        .metricIcon {
          width: 62px;
          height: 62px;

          flex: 0 0 62px;

          display: grid;

          place-items: center;

          border-radius: 18px;

          font-size: 27px;
        }

        .metricPurple {
          background:
            linear-gradient(
              135deg,
              rgba(121,80,237,.15),
              rgba(165,85,247,.10)
            );
        }

        .metricGreen {
          background:
            linear-gradient(
              135deg,
              rgba(34,197,94,.14),
              rgba(45,212,191,.10)
            );
        }

        .metricBlue {
          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,.14),
              rgba(56,189,248,.10)
            );
        }

        .metricDiamond {
          background:
            linear-gradient(
              135deg,
              rgba(124,58,237,.13),
              rgba(168,85,247,.10)
            );
        }

        .metricLabel {
          color: #646c81;

          font-size: 13px;
          font-weight: 850;
        }

        .metricValue {
          margin-top: 5px;

          color: #111936;

          font-size: 35px;
          line-height: 1;

          font-weight: 950;

          letter-spacing: -.04em;
        }

        .metricHint {
          margin-top: 7px;

          color: #9195a4;

          font-size: 11px;
          line-height: 1.45;

          font-weight: 650;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .historySection {
          overflow: hidden;

          border:
            1px solid
            rgba(91,75,159,.08);

          border-radius: 25px;

          background:
            rgba(255,255,255,.94);

          box-shadow:
            0 16px 43px
            rgba(54,42,103,.05);
        }

        .sectionHeader {
          min-height: 102px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 18px;

          padding: 22px 25px;

          border-bottom:
            1px solid
            rgba(91,75,159,.07);
        }

        .sectionTitleArea {
          display: flex;
          align-items: center;

          gap: 13px;
        }

        .sectionIcon {
          width: 48px;
          height: 48px;

          flex: 0 0 48px;

          display: grid;

          place-items: center;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(121,80,237,.13),
              rgba(47,166,233,.09)
            );

          font-size: 21px;
        }

        .sectionTitle {
          margin: 0;

          color: #19213d;

          font-size: 23px;

          font-weight: 950;

          letter-spacing: -.025em;
        }

        .sectionDescription {
          margin: 5px 0 0;

          color: #7c8294;

          font-size: 13px;
          font-weight: 650;
        }

        .sectionBadge {
          min-height: 39px;

          display: inline-flex;

          align-items: center;

          gap: 6px;

          padding: 0 12px;

          border-radius: 999px;

          background:
            rgba(112,79,224,.08);

          color: #6447cf;

          font-size: 12px;
          font-weight: 900;
        }

        /* =====================================================
           EMPTY STATES
        ===================================================== */

        .emptyState {
          min-height: 295px;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          padding: 32px;

          text-align: center;

          background:
            radial-gradient(
              380px 180px at 50% 50%,
              rgba(118,82,232,.045),
              transparent 72%
            );
        }

        .emptyIcon {
          width: 82px;
          height: 82px;

          display: grid;

          place-items: center;

          border-radius: 23px;

          background:
            linear-gradient(
              135deg,
              rgba(121,80,237,.13),
              rgba(47,166,233,.10)
            );

          font-size: 37px;

          box-shadow:
            0 12px 28px
            rgba(66,53,140,.07);
        }

        .emptyTitle {
          margin: 17px 0 0;

          color: #27304c;

          font-size: 17px;

          font-weight: 900;
        }

        .emptyText {
          max-width: 470px;

          margin: 7px 0 0;

          color: #858a9b;

          font-size: 13px;

          line-height: 1.55;

          font-weight: 650;
        }

        .emptyButton {
          min-height: 46px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          margin-top: 17px;

          padding: 0 17px;

          border:
            1px solid
            rgba(107,80,211,.15);

          border-radius: 13px;

          background: #ffffff;

          color: #6547d2;

          text-decoration: none;

          font-size: 13px;
          font-weight: 900;

          box-shadow:
            0 8px 19px
            rgba(58,45,119,.055);
        }

        /* =====================================================
           PAYMENT LIST
        ===================================================== */

        .paymentList {
          display: grid;

          gap: 13px;

          padding: 19px;
        }

        .paymentCard {
          overflow: hidden;

          border:
            1px solid
            rgba(91,75,159,.085);

          border-radius: 19px;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #fcfbff
            );

          box-shadow:
            0 8px 21px
            rgba(53,42,103,.035);
        }

        .paymentTop {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 18px;

          padding: 17px 18px;

          border-bottom:
            1px solid
            rgba(91,75,159,.065);

          background:
            rgba(249,248,255,.55);
        }

        .paymentIdentity {
          display: flex;

          align-items: center;

          gap: 12px;

          min-width: 0;
        }

        .packageIcon {
          width: 48px;
          height: 48px;

          flex: 0 0 48px;

          display: grid;

          place-items: center;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              rgba(121,80,237,.12),
              rgba(47,166,233,.08)
            );

          font-size: 21px;
        }

        .packageName {
          color: #222a45;

          font-size: 16px;
          font-weight: 950;
        }

        .orderNumber {
          margin-top: 4px;

          color: #8d91a0;

          font-size: 11px;
          font-weight: 650;

          word-break: break-all;
        }

        .paymentTopRight {
          display: flex;

          align-items: center;

          gap: 10px;

          flex-wrap: wrap;
        }

        .status {
          min-height: 31px;

          display: inline-flex;

          align-items: center;

          padding: 0 10px;

          border-radius: 999px;

          font-size: 11px;

          font-weight: 900;
        }

        .statusSuccess {
          border:
            1px solid
            rgba(34,197,94,.18);

          background:
            rgba(34,197,94,.09);

          color: #168154;
        }

        .statusStarted {
          border:
            1px solid
            rgba(59,130,246,.18);

          background:
            rgba(59,130,246,.09);

          color: #2666bd;
        }

        .statusCanceled {
          border:
            1px solid
            rgba(245,158,11,.20);

          background:
            rgba(245,158,11,.09);

          color: #a66a13;
        }

        .statusFailed {
          border:
            1px solid
            rgba(239,68,68,.17);

          background:
            rgba(239,68,68,.08);

          color: #bd4040;
        }

        .statusDefault {
          border:
            1px solid
            rgba(91,75,159,.09);

          background:
            rgba(245,245,249,.94);

          color: #686e7e;
        }

        .paymentAmount {
          color: #1c2441;

          font-size: 18px;

          font-weight: 950;
        }

        /* =====================================================
           DETAILS
        ===================================================== */

        .detailGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );

          gap: 9px;

          padding: 16px 18px;
        }

        .detailCard {
          min-height: 74px;

          padding: 11px 12px;

          border:
            1px solid
            rgba(91,75,159,.07);

          border-radius: 13px;

          background:
            rgba(250,250,253,.75);
        }

        .detailLabel {
          color: #9498a6;

          font-size: 10px;
          font-weight: 750;
        }

        .detailValue {
          margin-top: 5px;

          color: #424a62;

          font-size: 12px;

          line-height: 1.4;

          font-weight: 850;

          word-break: break-word;
        }

        /* =====================================================
           AGREEMENTS
        ===================================================== */

        .agreementBox {
          margin: 0 18px 16px;

          padding: 14px;

          border:
            1px solid
            rgba(105,79,209,.10);

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              rgba(247,244,255,.80),
              rgba(249,251,255,.80)
            );
        }

        .agreementTitle {
          color: #5140b3;

          font-size: 13px;
          font-weight: 900;
        }

        .agreementGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );

          gap: 8px;

          margin-top: 11px;
        }

        .approval {
          min-height: 40px;

          display: flex;

          align-items: center;

          gap: 7px;

          padding: 7px 9px;

          border:
            1px solid
            rgba(91,75,159,.07);

          border-radius: 11px;

          background:
            rgba(255,255,255,.78);

          color: #62697d;

          font-size: 10px;

          font-weight: 750;
        }

        /* =====================================================
           DELIVERY
        ===================================================== */

        .deliveryBox {
          margin: 0 18px 16px;

          padding: 13px 14px;

          border-radius: 14px;

          font-size: 12px;

          line-height: 1.6;

          font-weight: 650;
        }

        .deliveryComplete {
          border:
            1px solid
            rgba(34,197,94,.18);

          background:
            rgba(232,250,240,.82);

          color: #1b7652;
        }

        .deliveryPending {
          border:
            1px solid
            rgba(245,158,11,.18);

          background:
            rgba(255,248,232,.83);

          color: #96611b;
        }

        .paymentError {
          margin: 0 18px 16px;

          padding: 12px 13px;

          border:
            1px solid
            rgba(239,68,68,.15);

          border-radius: 13px;

          background:
            rgba(255,242,242,.88);

          color: #a13b3b;

          font-size: 11px;

          line-height: 1.55;
        }

        /* =====================================================
           LINKED CREDIT MOVEMENTS
        ===================================================== */

        .linkedMovements {
          margin:
            0
            18px
            16px;

          overflow: hidden;

          border:
            1px solid
            rgba(91,75,159,.07);

          border-radius: 14px;
        }

        .linkedTitle {
          padding:
            10px
            12px;

          background:
            rgba(248,248,252,.85);

          color: #535b72;

          font-size: 11px;

          font-weight: 900;
        }

        .linkedRow {
          min-height: 57px;

          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding:
            9px
            12px;

          border-top:
            1px solid
            rgba(91,75,159,.06);
        }

        .linkedName {
          color: #454d65;

          font-size: 12px;

          font-weight: 850;
        }

        .smallMuted {
          margin-top: 3px;

          color: #9296a5;

          font-size: 10px;

          font-weight: 650;
        }

        .amountPositive {
          color: #168057;

          font-size: 13px;

          font-weight: 950;
        }

        .amountNegative {
          color: #bd4141;

          font-size: 13px;

          font-weight: 950;
        }

        /* =====================================================
           CREDIT TABLE
        ===================================================== */

        .creditTable {
          overflow-x: auto;
        }

        .creditTableHeader,
        .creditRow {
          min-width: 850px;

          display: grid;

          grid-template-columns:
            180px
            minmax(170px,1fr)
            minmax(250px,1.4fr)
            110px
            130px
            130px;

          align-items: center;

          gap: 12px;

          padding:
            0
            18px;
        }

        .creditTableHeader {
          min-height: 46px;

          border-bottom:
            1px solid
            rgba(91,75,159,.07);

          background:
            linear-gradient(
              90deg,
              rgba(121,80,237,.075),
              rgba(47,166,233,.055)
            );

          color: #777e92;

          font-size: 10px;

          font-weight: 850;

          text-transform: uppercase;

          letter-spacing: .035em;
        }

        .creditRow {
          min-height: 72px;

          border-bottom:
            1px solid
            rgba(91,75,159,.06);

          background:
            rgba(255,255,255,.88);

          transition:
            background .15s ease;
        }

        .creditRow:last-child {
          border-bottom: 0;
        }

        .creditRow:hover {
          background:
            rgba(249,248,255,.82);
        }

        .creditDate {
          color: #828797;

          font-size: 11px;

          font-weight: 650;
        }

        .creditType {
          color: #3c445c;

          font-size: 12px;

          font-weight: 900;
        }

        .creditDescription {
          color: #777e90;

          font-size: 11px;

          font-weight: 650;

          line-height: 1.45;
        }

        .creditAmount {
          font-size: 13px;

          font-weight: 950;
        }

        .balanceValue {
          color: #555d73;

          font-size: 11px;

          font-weight: 800;
        }

        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (min-width: 1500px) {
          .historyHero {
            padding:
              39px
              44px;

            min-height: 240px;
          }

          .historySubtitle {
            font-size: 18px;
          }

          .metricCard {
            min-height: 150px;

            padding: 23px;
          }

          .metricLabel {
            font-size: 14px;
          }

          .metricValue {
            font-size: 39px;
          }

          .sectionTitle {
            font-size: 25px;
          }

          .sectionDescription {
            font-size: 14px;
          }

          .packageName {
            font-size: 17px;
          }

          .detailValue {
            font-size: 13px;
          }
        }

        @media (max-width: 1200px) {
          .metricsGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }

          .detailGrid {
            grid-template-columns:
              repeat(
                3,
                minmax(0,1fr)
              );
          }

          .agreementGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }
        }

        @media (max-width: 800px) {
          .historyHero {
            align-items: flex-start;

            flex-direction: column;

            padding:
              24px
              19px;

            border-radius: 22px;
          }

          .historyHero::after {
            display: none;
          }

          .historyTitle {
            font-size: 40px;
          }

          .historySubtitle {
            font-size: 15px;
          }

          .premiumLink {
            width: 100%;
          }

          .metricsGrid {
            grid-template-columns: 1fr;
          }

          .metricCard {
            min-height: 115px;
          }

          .sectionHeader {
            align-items: flex-start;

            flex-direction: column;

            padding:
              20px
              17px;
          }

          .paymentTop {
            align-items: flex-start;

            flex-direction: column;
          }

          .paymentTopRight {
            width: 100%;

            justify-content:
              space-between;
          }

          .detailGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );

            padding:
              14px;
          }

          .agreementGrid {
            grid-template-columns: 1fr;
          }

          .emptyState {
            min-height: 250px;

            padding: 24px 16px;
          }
        }

        @media (max-width: 520px) {
          .historyTitle {
            font-size: 36px;
          }

          .detailGrid {
            grid-template-columns: 1fr;
          }

          .paymentList {
            padding: 12px;
          }

          .agreementBox,
          .deliveryBox,
          .paymentError,
          .linkedMovements {
            margin-left: 12px;
            margin-right: 12px;
          }

          .sectionBadge {
            font-size: 11px;
          }
        }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="historyHero">
        <div className="heroCopy">
          <div className="historyKicker">
            <span>⌂</span>

            Klinik Paneli
          </div>

          <h1 className="historyTitle">
            İşlem Geçmişi
          </h1>

          <p className="historySubtitle">
            Satın alma, ödeme ve hesabına
            tanımlanan dijital hakları tek
            ekrandan takip et. Ödeme durumları,
            teslim kayıtları ve kredi
            hareketlerin burada saklanır.
          </p>
        </div>

        <Link
          href="/panel/abonelik"
          className="premiumLink"
        >
          💎 Kredi & Premium
          <span>→</span>
        </Link>
      </section>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <section className="metricsGrid">
        <article className="metricCard">
          <div className="metricIcon metricPurple">
            💳
          </div>

          <div>
            <div className="metricLabel">
              Toplam ödeme kaydı
            </div>

            <div className="metricValue">
              {payments.length}
            </div>

            <div className="metricHint">
              Son 100 ödeme işlemi
            </div>
          </div>
        </article>

        <article className="metricCard">
          <div className="metricIcon metricGreen">
            ✓
          </div>

          <div>
            <div className="metricLabel">
              Başarılı ödeme
            </div>

            <div className="metricValue">
              {successfulPayments}
            </div>

            <div className="metricHint">
              Ödeme onayı alınan işlemler
            </div>
          </div>
        </article>

        <article className="metricCard">
          <div className="metricIcon metricBlue">
            📦
          </div>

          <div>
            <div className="metricLabel">
              Teslim edilen işlem
            </div>

            <div className="metricValue">
              {deliveredPayments}
            </div>

            <div className="metricHint">
              Hesabına tanımlanan dijital haklar
            </div>
          </div>
        </article>

        <article className="metricCard">
          <div className="metricIcon metricDiamond">
            💎
          </div>

          <div>
            <div className="metricLabel">
              Satın alınan kredi
            </div>

            <div className="metricValue">
              {totalPurchasedCredits}
            </div>

            <div className="metricHint">
              Toplam pozitif kredi kazanımı
            </div>
          </div>
        </article>
      </section>

      {/* =====================================================
          PAYMENT HISTORY
      ===================================================== */}

      <section className="historySection">
        <div className="sectionHeader">
          <div className="sectionTitleArea">
            <div className="sectionIcon">
              📄
            </div>

            <div>
              <h2 className="sectionTitle">
                Ödeme Geçmişi
              </h2>

              <p className="sectionDescription">
                Son 100 ödeme denemesi ve satın
                alma işlemi.
              </p>
            </div>
          </div>

          <div className="sectionBadge">
            📋 {payments.length} kayıt
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">
              📋
            </div>

            <h3 className="emptyTitle">
              Henüz ödeme kaydı bulunmuyor.
            </h3>

            <p className="emptyText">
              Kredi veya Premium satın alma
              işlemlerin burada detaylı olarak
              görüntülenecek.
            </p>

            <Link
              href="/panel/abonelik"
              className="emptyButton"
            >
              Paketleri Gör →
            </Link>
          </div>
        ) : (
          <div className="paymentList">
            {payments.map(
              (payment) => {
                const status =
                  statusInfo(
                    payment.status,
                  );

                const deliveryCompleted =
                  Boolean(
                    payment.deliveredAt,
                  );

                return (
                  <article
                    key={
                      payment.id
                    }
                    className="paymentCard"
                  >
                    {/* HEADER */}

                    <div className="paymentTop">
                      <div className="paymentIdentity">
                        <div className="packageIcon">
                          {payment.kind ===
                          "premium"
                            ? "👑"
                            : "💎"}
                        </div>

                        <div>
                          <div className="packageName">
                            {packageLabel(
                              payment.packageCode,
                              payment.kind,
                            )}
                          </div>

                          <div className="orderNumber">
                            Sipariş no:{" "}
                            {payment.orderNumber ??
                              "—"}
                          </div>
                        </div>
                      </div>

                      <div className="paymentTopRight">
                        <span
                          className={
                            status.className
                          }
                        >
                          {status.label}
                        </span>

                        <strong className="paymentAmount">
                          {formatMoney(
                            payment.amount,
                            payment.currency,
                          )}
                        </strong>
                      </div>
                    </div>

                    {/* DETAILS */}

                    <div className="detailGrid">
                      <Detail
                        label="İşlem tarihi"
                        value={formatDateTime(
                          payment.createdAt,
                        )}
                      />

                      <Detail
                        label="Ödeme tarihi"
                        value={formatDateTime(
                          payment.paidAt,
                        )}
                      />

                      <Detail
                        label="Teslim tarihi"
                        value={formatDateTime(
                          payment.deliveredAt,
                        )}
                      />

                      <Detail
                        label="Kredi miktarı"
                        value={
                          payment.credits !=
                          null
                            ? `${payment.credits} kredi`
                            : "—"
                        }
                      />

                      <Detail
                        label="Önceki bakiye"
                        value={
                          payment.balanceBefore !=
                          null
                            ? `${payment.balanceBefore} kredi`
                            : "—"
                        }
                      />

                      <Detail
                        label="Sonraki bakiye"
                        value={
                          payment.balanceAfter !=
                          null
                            ? `${payment.balanceAfter} kredi`
                            : "—"
                        }
                      />

                      <Detail
                        label="Premium başlangıç"
                        value={formatDateTime(
                          payment.premiumStartedAt,
                        )}
                      />

                      <Detail
                        label="Premium bitiş"
                        value={formatDateTime(
                          payment.premiumExpiresAt,
                        )}
                      />

                      <Detail
                        label="İşlem referansı"
                        value={
                          payment.providerRef ??
                          "—"
                        }
                      />

                      <Detail
                        label="Sözleşme sürümü"
                        value={
                          payment.agreementVersion ??
                          "—"
                        }
                      />

                      <Detail
                        label="Sözleşme onayı"
                        value={formatDateTime(
                          payment.agreementAcceptedAt,
                        )}
                      />

                      <Detail
                        label="Son güncelleme"
                        value={formatDateTime(
                          payment.updatedAt,
                        )}
                      />
                    </div>

                    {/* AGREEMENTS */}

                    <div className="agreementBox">
                      <div className="agreementTitle">
                        Sözleşme ve teslimat onayları
                      </div>

                      <div className="agreementGrid">
                        <Approval
                          accepted={
                            payment.serviceAgreementAccepted
                          }
                          label="Dijital hizmet sözleşmesi"
                        />

                        <Approval
                          accepted={
                            payment.refundPolicyAccepted
                          }
                          label="Teslimat ve iade şartları"
                        />

                        <Approval
                          accepted={
                            payment.immediatePerformanceAccepted
                          }
                          label="Hizmetin hemen başlatılması"
                        />

                        <Approval
                          accepted={
                            payment.callbackVerified
                          }
                          label="Ödeme doğrulaması"
                        />
                      </div>
                    </div>

                    {/* DELIVERY */}

                    <div
                      className={
                        deliveryCompleted
                          ? "deliveryBox deliveryComplete"
                          : "deliveryBox deliveryPending"
                      }
                    >
                      {deliveryCompleted ? (
                        <>
                          <strong>
                            ✓ Dijital hizmet teslim
                            edilmiştir.
                          </strong>{" "}

                          Satın alınan kredi veya Premium
                          hakkı hesabına tanımlanmıştır.
                        </>
                      ) : (
                        <>
                          <strong>
                            ℹ Dijital teslim kaydı
                            bulunmuyor.
                          </strong>{" "}

                          Başarılı ödeme doğrulanmadan
                          kredi veya Premium hakkı
                          tanımlanmaz.
                        </>
                      )}
                    </div>

                    {/* ERROR */}

                    {payment.errorMessage ? (
                      <div className="paymentError">
                        <strong>
                          İşlem açıklaması:
                        </strong>{" "}

                        {payment.errorMessage}

                        {payment.errorCode ? (
                          <>
                            {" "}
                            (
                            {
                              payment.errorCode
                            }
                            )
                          </>
                        ) : null}
                      </div>
                    ) : null}

                    {/* LINKED CREDIT TRANSACTIONS */}

                    {payment
                      .creditTransactions
                      .length > 0 ? (
                      <div className="linkedMovements">
                        <div className="linkedTitle">
                          Bu işleme bağlı kredi
                          hareketleri
                        </div>

                        {payment.creditTransactions.map(
                          (
                            transaction,
                          ) => (
                            <div
                              key={
                                transaction.id
                              }
                              className="linkedRow"
                            >
                              <div>
                                <div className="linkedName">
                                  {transaction.note ??
                                    creditTypeLabel(
                                      transaction.type,
                                    )}
                                </div>

                                <div className="smallMuted">
                                  {formatDateTime(
                                    transaction.deliveredAt ??
                                      transaction.createdAt,
                                  )}
                                </div>
                              </div>

                              <strong
                                className={
                                  transaction.amount >=
                                  0
                                    ? "amountPositive"
                                    : "amountNegative"
                                }
                              >
                                {transaction.amount >
                                0
                                  ? `+${transaction.amount}`
                                  : transaction.amount}{" "}
                                kredi
                              </strong>
                            </div>
                          ),
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          CREDIT MOVEMENTS
      ===================================================== */}

      <section className="historySection">
        <div className="sectionHeader">
          <div className="sectionTitleArea">
            <div className="sectionIcon">
              🪙
            </div>

            <div>
              <h2 className="sectionTitle">
                Kredi Hareketleri
              </h2>

              <p className="sectionDescription">
                Satın alma, lead açma ve diğer
                kredi hareketlerinin detaylı dökümü.
              </p>
            </div>
          </div>

          <div className="sectionBadge">
            💎 Güncel bakiye:{" "}
            {currentCreditBalance} kredi
          </div>
        </div>

        {creditTransactions.length ===
        0 ? (
          <div className="emptyState">
            <div className="emptyIcon">
              🪙
            </div>

            <h3 className="emptyTitle">
              Henüz kredi hareketi yok.
            </h3>

            <p className="emptyText">
              Kredi satın aldığında veya bir lead
              açmak için kredi kullandığında tüm
              hareketler burada görüntülenecek.
            </p>
          </div>
        ) : (
          <div className="creditTable">
            <div className="creditTableHeader">
              <span>
                Tarih
              </span>

              <span>
                İşlem Türü
              </span>

              <span>
                Açıklama
              </span>

              <span>
                Miktar
              </span>

              <span>
                Bakiye Öncesi
              </span>

              <span>
                Bakiye Sonrası
              </span>
            </div>

            {creditTransactions.map(
              (
                transaction,
              ) => (
                <div
                  key={
                    transaction.id
                  }
                  className="creditRow"
                >
                  <div className="creditDate">
                    {formatDateTime(
                      transaction.deliveredAt ??
                        transaction.createdAt,
                    )}
                  </div>

                  <div className="creditType">
                    {creditTypeLabel(
                      transaction.type,
                    )}
                  </div>

                  <div className="creditDescription">
                    {transaction.note ??
                      "—"}
                  </div>

                  <div
                    className={
                      transaction.amount >=
                      0
                        ? "creditAmount amountPositive"
                        : "creditAmount amountNegative"
                    }
                  >
                    {transaction.amount >
                    0
                      ? `+${transaction.amount}`
                      : transaction.amount}
                  </div>

                  <div className="balanceValue">
                    {transaction.balanceBefore !=
                    null
                      ? `${transaction.balanceBefore} kredi`
                      : "—"}
                  </div>

                  <div className="balanceValue">
                    {transaction.balanceAfter !=
                    null
                      ? `${transaction.balanceAfter} kredi`
                      : "—"}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="detailCard">
      <div className="detailLabel">
        {label}
      </div>

      <div className="detailValue">
        {value}
      </div>
    </div>
  );
}

function Approval({
  accepted,
  label,
}: {
  accepted: boolean;
  label: string;
}): JSX.Element {
  return (
    <div className="approval">
      <span>
        {accepted
          ? "✅"
          : "➖"}
      </span>

      <span>
        {label}
      </span>
    </div>
  );
}

/* =========================================================
   UNAUTHORIZED
========================================================= */

const unauthorizedStyle:
  CSSProperties = {
  maxWidth: 640,

  margin:
    "50px auto",

  padding:
    "38px",

  textAlign:
    "center",

  border:
    "1px solid rgba(91,75,159,.09)",

  borderRadius:
    26,

  background:
    "rgba(255,255,255,.94)",

  boxShadow:
    "0 20px 52px rgba(54,42,103,.07)",
};

const unauthorizedIconStyle:
  CSSProperties = {
  width: 66,
  height: 66,

  display:
    "grid",

  placeItems:
    "center",

  margin:
    "0 auto",

  borderRadius:
    20,

  background:
    "linear-gradient(135deg,rgba(121,80,237,.14),rgba(47,166,233,.10))",

  fontSize:
    29,
};

const unauthorizedTitleStyle:
  CSSProperties = {
  margin:
    "18px 0 0",

  color:
    "#18203c",

  fontSize:
    27,

  fontWeight:
    950,
};

const unauthorizedTextStyle:
  CSSProperties = {
  maxWidth:
    460,

  margin:
    "9px auto 0",

  color:
    "#777e91",

  fontSize:
    14,

  fontWeight:
    650,

  lineHeight:
    1.6,
};

const loginButtonStyle:
  CSSProperties = {
  minHeight:
    49,

  display:
    "inline-flex",

  alignItems:
    "center",

  justifyContent:
    "center",

  marginTop:
    19,

  padding:
    "0 18px",

  borderRadius:
    14,

  background:
    "linear-gradient(115deg,#7950ed,#654ce8)",

  color:
    "#fff",

  textDecoration:
    "none",

  fontSize:
    14,

  fontWeight:
    950,
};