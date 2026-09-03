import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type PackageCard = {
  title: string;
  priceText: string;
  credits: number;
  note: string;
  buyHref: string;
  featured?: boolean;
  premium?: boolean;
  badge?: string;
  icon: string;
  durationText: string;
  activationText: string;
  renewalText?: string;
  disclaimer: string;
};

function fmtDate(
  date: Date | null | undefined,
): string {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "tr-TR",
  );
}

function fmtDateTime(
  date: Date | null | undefined,
): string {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString(
    "tr-TR",
  );
}

function typeLabel(
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
    return "Premium üyelik kredisi";
  }

  return type;
}

export default async function PanelSubscriptionPage(): Promise<JSX.Element> {
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
      <div
        style={{
          padding: 24,
        }}
      >
        <h1>
          Yetkisiz
        </h1>

        <p>
          Lütfen{" "}
          <a href="/panel/login">
            /panel/login
          </a>{" "}
          üzerinden giriş yap.
        </p>
      </div>
    );
  }

  const now =
    new Date();

  const [
    clinic,
    activeSub,
    transactions,
  ] = await Promise.all([
    prisma.clinic.findUnique({
      where: {
        id: session.clinicId,
      },

      select: {
        creditBalance: true,
        isPremium: true,
        premiumExpiresAt:
          true,
      },
    }),

    prisma.subscription.findFirst({
      where: {
        clinicId:
          session.clinicId,

        status:
          "active",

        expiresAt: {
          gt: now,
        },
      },

      orderBy: {
        startedAt:
          "desc",
      },

      select: {
        quotaTotal: true,
        quotaUsed: true,
        expiresAt: true,
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

      take: 30,

      select: {
        id: true,
        amount: true,
        type: true,
        note: true,
        createdAt: true,
      },
    }),
  ]);

  const creditBalance =
    clinic?.creditBalance ??
    0;

  const isPremiumActive =
    Boolean(
      clinic?.isPremium &&
        clinic?.premiumExpiresAt &&
        clinic.premiumExpiresAt.getTime() >
          now.getTime(),
    );

  const quotaTotal =
    activeSub?.quotaTotal ??
    0;

  const quotaUsed =
    activeSub?.quotaUsed ??
    0;

  const remaining =
    Math.max(
      0,
      quotaTotal -
        quotaUsed,
    );

  const packages: PackageCard[] =
    [
      {
        title:
          "5 Kredi Paketi",

        priceText:
          "1.500 TL",

        credits: 5,

        note:
          "Başlangıç için ideal. 5 farklı lead kaydının iletişim bilgilerini görüntüleme hakkı verir.",

        buyHref:
          "/panel/abonelik/satin-al?package=credit_5",

        badge:
          "Başlangıç",

        icon:
          "💎",

        durationText:
          "Tek seferlik kredi paketi",

        activationText:
          "Başarılı ödeme onayından sonra tanımlanır",

        disclaimer:
          "Lead; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
      },

      {
        title:
          "10 Kredi Paketi",

        priceText:
          "2.000 TL",

        credits: 10,

        note:
          "En dengeli paket. 10 farklı lead kaydının iletişim bilgilerini görüntüleme hakkı verir.",

        buyHref:
          "/panel/abonelik/satin-al?package=credit_10",

        featured:
          true,

        badge:
          "En Popüler",

        icon:
          "⚡",

        durationText:
          "Tek seferlik kredi paketi",

        activationText:
          "Başarılı ödeme onayından sonra tanımlanır",

        disclaimer:
          "Lead; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
      },

      {
        title:
          "25 Kredi Paketi",

        priceText:
          "4.000 TL",

        credits: 25,

        note:
          "Yoğun çalışan klinikler için hazırlanmıştır. 25 farklı lead kaydının iletişim bilgilerini görüntüleme hakkı verir.",

        buyHref:
          "/panel/abonelik/satin-al?package=credit_25",

        badge:
          "En Avantajlı",

        icon:
          "🚀",

        durationText:
          "Tek seferlik kredi paketi",

        activationText:
          "Başarılı ödeme onayından sonra tanımlanır",

        disclaimer:
          "Lead; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
      },

      {
        title:
          "Premium Üyelik",

        priceText:
          "2.500 TL / 30 gün",

        credits: 10,

        note:
          "30 günlük Premium üyelik, 10 kredi ve uygun lead dağıtımlarında standart kliniklere göre öncelik sağlar.",

        buyHref:
          "/panel/abonelik/satin-al?package=premium",

        featured:
          true,

        premium:
          true,

        badge:
          "Premium",

        icon:
          "👑",

        durationText:
          "30 günlük üyelik",

        activationText:
          "Başarılı ödeme onayından sonra başlar",

        renewalText:
          "Otomatik yenilenmez",

        disclaimer:
          "Premium öncelik; belirli sayıda lead, hasta, randevu, tedavi veya gelir garantisi değildir.",
      },
    ];

  return (
    <div className="creditPage">
      <style>{`
        .creditPage {
          width: 100%;
          position: relative;
          padding: 10px 0 54px;
          color: #151d39;
        }

        .creditPage * {
          box-sizing: border-box;
        }

        .hero {
          position: relative;
          overflow: hidden;
          padding: 35px 38px 32px;
          border: 1px solid rgba(91,75,159,.09);
          border-radius: 30px;
          background:
            radial-gradient(
              650px 330px at 5% 0%,
              rgba(122,82,237,.15),
              transparent 68%
            ),
            radial-gradient(
              600px 340px at 98% 35%,
              rgba(47,166,233,.12),
              transparent 68%
            ),
            linear-gradient(
              135deg,
              #ffffff,
              #faf8ff 50%,
              #f4faff
            );
          box-shadow:
            0 22px 60px
            rgba(53,42,103,.065);
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .heroCopy {
          max-width: 820px;
        }

        .kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 13px;
          border: 1px solid rgba(97,76,190,.09);
          border-radius: 999px;
          background: rgba(255,255,255,.9);
          color: #654bcf;
          font-size: 13px;
          font-weight: 900;
          box-shadow:
            0 7px 18px
            rgba(54,43,106,.04);
        }

        .heroTitle {
          max-width: 850px;
          margin: 17px 0 0;
          color: #111936;
          font-size:
            clamp(
              40px,
              4vw,
              58px
            );
          line-height: 1.02;
          letter-spacing: -.05em;
          font-weight: 950;
        }

        .heroText {
          max-width: 760px;
          margin-top: 14px;
          color: #616a81;
          font-size: 16px;
          font-weight: 650;
          line-height: 1.7;
        }

        .heroVisual {
          position: relative;
          flex: 0 0 220px;
          min-height: 145px;
          display: grid;
          place-items: center;
        }

        .heroDiamond {
          position: relative;
          z-index: 2;
          font-size: 96px;
          filter:
            drop-shadow(
              0 20px 22px
              rgba(91,68,207,.18)
            );
        }

        .heroVisual::before {
          content: "";
          position: absolute;
          width: 170px;
          height: 80px;
          bottom: 8px;
          border-radius: 50%;
          background:
            rgba(109,81,226,.11);
          filter: blur(4px);
        }

        .heroVisual::after {
          content: "✦";
          position: absolute;
          right: 16px;
          top: 10px;
          color: #9b73f0;
          font-size: 28px;
        }

        .metrics {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );
          gap: 14px;
          margin-top: 26px;
        }

        .metric {
          min-height: 124px;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          border: 1px solid rgba(91,75,159,.08);
          border-radius: 20px;
          background: rgba(255,255,255,.9);
          box-shadow:
            0 12px 30px
            rgba(53,42,103,.045);
        }

        .metricIcon {
          width: 52px;
          height: 52px;
          flex: 0 0 52px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              rgba(121,80,237,.13),
              rgba(47,166,233,.09)
            );
          font-size: 22px;
        }

        .metricLabel {
          color: #6e7589;
          font-size: 12px;
          font-weight: 850;
        }

        .metricValue {
          margin-top: 4px;
          color: #6347d2;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .metricHint {
          margin-top: 4px;
          color: #9296a4;
          font-size: 11px;
          font-weight: 650;
          line-height: 1.45;
        }

        .benefitStrip {
          margin-top: 17px;
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );
          border: 1px solid rgba(91,75,159,.08);
          border-radius: 21px;
          background: rgba(255,255,255,.9);
          box-shadow:
            0 12px 30px
            rgba(53,42,103,.04);
          overflow: hidden;
        }

        .benefitItem {
          min-height: 86px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 18px;
          border-right:
            1px solid
            rgba(91,75,159,.07);
        }

        .benefitItem:last-child {
          border-right: 0;
        }

        .benefitIcon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              rgba(121,80,237,.12),
              rgba(47,166,233,.08)
            );
          font-size: 19px;
        }

        .benefitItem strong {
          color: #252d48;
          font-size: 13px;
          font-weight: 900;
        }

        .benefitItem p {
          margin: 3px 0 0;
          color: #858a9a;
          font-size: 10px;
          font-weight: 650;
          line-height: 1.45;
        }

        .sectionHead {
          margin-top: 30px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }

        .sectionHead h2 {
          margin: 0;
          color: #151d39;
          font-size: 29px;
          font-weight: 950;
          letter-spacing: -.035em;
        }

        .sectionHead p {
          max-width: 620px;
          margin: 6px 0 0;
          color: #777e92;
          font-size: 13px;
          font-weight: 650;
          line-height: 1.55;
        }

        .packageGrid {
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(0,1fr)
            );
          gap: 15px;
          margin-top: 17px;
        }

        .packageCard {
          position: relative;
          overflow: hidden;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          padding: 22px;
          border: 1px solid rgba(91,75,159,.09);
          border-radius: 25px;
          background:
            linear-gradient(
              135deg,
              #ffffff,
              #fcfbff
            );
          box-shadow:
            0 16px 42px
            rgba(54,42,103,.055);
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            border-color .18s ease;
        }

        .packageCard:hover {
          transform: translateY(-4px);
          border-color: rgba(107,78,218,.22);
          box-shadow:
            0 24px 55px
            rgba(70,52,150,.11);
        }

        .packageCard.featured:not(.premium) {
          border:
            2px solid
            rgba(117,73,238,.70);
          box-shadow:
            0 20px 52px
            rgba(105,74,224,.13);
        }

        .popularTop {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          min-width: 130px;
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border-radius:
            0 0 13px 13px;
          background:
            linear-gradient(
              110deg,
              #7549eb,
              #9954ee
            );
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        .packageCard.premium {
          color: white;
          border-color:
            rgba(255,255,255,.16);
          background:
            radial-gradient(
              300px 180px at 0% 0%,
              rgba(250,204,21,.18),
              transparent 65%
            ),
            radial-gradient(
              280px 200px at 100% 15%,
              rgba(168,85,247,.30),
              transparent 68%
            ),
            linear-gradient(
              135deg,
              #2f277c,
              #4535b8 56%,
              #35277f
            );
          box-shadow:
            0 24px 62px
            rgba(61,48,165,.20);
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-top: 7px;
        }

        .packageIcon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(100,77,192,.10);
          border-radius: 50%;
          background:
            rgba(255,255,255,.94);
          font-size: 25px;
          box-shadow:
            0 10px 24px
            rgba(51,42,102,.06);
        }

        .premium .packageIcon {
          border-color:
            rgba(255,255,255,.15);
          background:
            rgba(255,255,255,.14);
        }

        .packageBadge {
          display: inline-flex;
          min-height: 29px;
          align-items: center;
          padding: 0 10px;
          border-radius: 999px;
          background:
            rgba(255,245,231,.9);
          color: #ee791c;
          font-size: 10px;
          font-weight: 900;
        }

        .premium .packageBadge {
          color: white;
          background:
            rgba(255,255,255,.13);
        }

        .packageTitle {
          margin-top: 20px;
          color: #202842;
          font-size: 19px;
          font-weight: 950;
          line-height: 1.3;
        }

        .premium .packageTitle {
          color: white;
        }

        .packageSubtitle {
          min-height: 44px;
          margin-top: 4px;
          color: #82889a;
          font-size: 11px;
          font-weight: 650;
          line-height: 1.45;
        }

        .premium .packageSubtitle {
          color:
            rgba(255,255,255,.75);
        }

        .packagePrice {
          margin-top: 20px;
          color: #6649dc;
          font-size:
            clamp(
              27px,
              2.3vw,
              35px
            );
          font-weight: 950;
          letter-spacing: -.045em;
          line-height: 1.1;
        }

        .packageCard:nth-child(3)
        .packagePrice {
          color: #f27724;
        }

        .premium .packagePrice {
          color: white;
        }

        .creditPill {
          align-self: flex-start;
          margin-top: 12px;
          display: inline-flex;
          min-height: 30px;
          align-items: center;
          padding: 0 11px;
          border-radius: 999px;
          background:
            rgba(115,78,227,.08);
          color: #6547ce;
          font-size: 11px;
          font-weight: 900;
        }

        .premium .creditPill {
          color: white;
          background:
            rgba(255,255,255,.12);
        }

        .packageFeatures {
          display: grid;
          gap: 11px;
          margin-top: 21px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #4f566c;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.45;
        }

        .premium .feature {
          color:
            rgba(255,255,255,.88);
        }

        .featureCheck {
          flex: 0 0 auto;
          color: #7551e5;
          font-weight: 950;
        }

        .premium .featureCheck {
          color: #fff;
        }

        .unitPrice {
          margin-top: 17px;
          padding: 11px 12px;
          border: 1px solid rgba(91,75,159,.08);
          border-radius: 12px;
          background: rgba(248,247,253,.82);
          color: #787e90;
          font-size: 10px;
          font-weight: 750;
        }

        .unitPrice strong {
          color: #555c70;
        }

        .premium .unitPrice {
          border-color:
            rgba(255,255,255,.14);
          background:
            rgba(255,255,255,.08);
          color:
            rgba(255,255,255,.74);
        }

        .premium .unitPrice strong {
          color: #fff;
        }

        .packageAction {
          margin-top: auto;
          padding-top: 20px;
        }

        .packageButton {
          width: 100%;
          min-height: 51px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid rgba(102,77,204,.13);
          border-radius: 14px;
          background: #fff;
          color: #6549ce;
          text-decoration: none;
          font-size: 13px;
          font-weight: 950;
          box-shadow:
            0 9px 21px
            rgba(55,43,106,.045);
          transition:
            transform .15s ease,
            box-shadow .15s ease;
        }

        .featured:not(.premium)
        .packageButton {
          border: 0;
          background:
            linear-gradient(
              110deg,
              #7950ed,
              #713fe7
            );
          color: white;
          box-shadow:
            0 13px 27px
            rgba(96,69,217,.23);
        }

        .packageCard:nth-child(3)
        .packageButton {
          border-color:
            rgba(242,119,36,.30);
          color: #ef7623;
        }

        .premium .packageButton {
          border: 0;
          background: #fff;
          color: #2e277c;
        }

        .packageButton:hover {
          transform:
            translateY(-2px);
          box-shadow:
            0 14px 28px
            rgba(65,49,133,.11);
        }

        .legalNote {
          margin-top: 14px;
          color: #9a9dac;
          font-size: 9px;
          font-weight: 650;
          line-height: 1.45;
        }

        .premium .legalNote {
          color:
            rgba(255,255,255,.58);
        }

        .infoCard {
          margin-top: 20px;
          padding: 22px;
          border: 1px solid rgba(91,75,159,.08);
          border-radius: 22px;
          background: rgba(255,255,255,.9);
          box-shadow:
            0 13px 34px
            rgba(54,42,103,.045);
        }

        .infoTitle {
          color: #202842;
          font-size: 18px;
          font-weight: 950;
        }

        .infoGrid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );
          gap: 12px;
          margin-top: 15px;
        }

        .infoItem {
          padding: 14px;
          border: 1px solid rgba(91,75,159,.07);
          border-radius: 14px;
          background: rgba(249,249,252,.78);
          color: #687086;
          font-size: 11px;
          font-weight: 650;
          line-height: 1.55;
        }

        .infoItem strong {
          display: block;
          margin-bottom: 4px;
          color: #343c55;
          font-size: 12px;
          font-weight: 900;
        }

        .transactions {
          margin-top: 20px;
          padding: 23px;
          border: 1px solid rgba(91,75,159,.08);
          border-radius: 23px;
          background: rgba(255,255,255,.93);
          box-shadow:
            0 14px 37px
            rgba(54,42,103,.045);
        }

        .transactionHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .transactionHead h2 {
          margin: 0;
          color: #202842;
          font-size: 21px;
          font-weight: 950;
        }

        .transactionHead p {
          margin: 5px 0 0;
          color: #888d9d;
          font-size: 11px;
          font-weight: 650;
        }

        .balanceBadge {
          display: inline-flex;
          min-height: 34px;
          align-items: center;
          padding: 0 12px;
          border-radius: 999px;
          background:
            rgba(112,79,224,.08);
          color: #6447cf;
          font-size: 11px;
          font-weight: 900;
        }

        .transactionList {
          display: grid;
          gap: 9px;
          margin-top: 16px;
        }

        .transactionRow {
          display: grid;
          grid-template-columns:
            180px
            minmax(0,1fr)
            auto;
          align-items: center;
          gap: 13px;
          min-height: 68px;
          padding: 11px 14px;
          border: 1px solid rgba(91,75,159,.07);
          border-radius: 14px;
          background: rgba(250,250,253,.78);
        }

        .transactionDate {
          color: #8d91a0;
          font-size: 11px;
          font-weight: 650;
        }

        .transactionType {
          color: #343c55;
          font-size: 13px;
          font-weight: 900;
        }

        .transactionNote {
          margin-top: 3px;
          color: #9195a3;
          font-size: 10px;
          font-weight: 650;
        }

        .amountPositive,
        .amountNegative {
          white-space: nowrap;
          font-size: 14px;
          font-weight: 950;
        }

        .amountPositive {
          color: #148056;
        }

        .amountNegative {
          color: #c14444;
        }

        .emptyTransactions {
          margin-top: 16px;
          padding: 25px;
          border: 1px dashed rgba(91,75,159,.12);
          border-radius: 16px;
          color: #858a9a;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
        }

        .legacy {
          margin-top: 15px;
          padding: 13px 15px;
          border: 1px solid rgba(91,75,159,.07);
          border-radius: 14px;
          background: rgba(248,248,251,.68);
          color: #878c9b;
          font-size: 10px;
          font-weight: 650;
          line-height: 1.55;
        }

        .legacy strong {
          color: #656b7d;
        }

        @media (min-width: 1500px) {
          .hero {
            padding: 40px 44px 36px;
          }

          .heroText {
            font-size: 17px;
          }

          .metricLabel {
            font-size: 13px;
          }

          .metricValue {
            font-size: 31px;
          }

          .packageCard {
            min-height: 525px;
            padding: 24px;
          }

          .packageTitle {
            font-size: 21px;
          }

          .packageSubtitle {
            font-size: 12px;
          }

          .feature {
            font-size: 12px;
          }

          .packageButton {
            font-size: 14px;
          }
        }

        @media (max-width: 1250px) {
          .metrics {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }

          .benefitStrip {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }

          .benefitItem:nth-child(2) {
            border-right: 0;
          }

          .benefitItem:nth-child(-n+2) {
            border-bottom:
              1px solid
              rgba(91,75,159,.07);
          }

          .packageGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }
        }

        @media (max-width: 760px) {
          .creditPage {
            padding-top: 0;
          }

          .hero {
            padding: 23px 18px;
            border-radius: 22px;
          }

          .heroTop {
            flex-direction: column;
          }

          .heroVisual {
            display: none;
          }

          .heroTitle {
            font-size: 39px;
          }

          .heroText {
            font-size: 14px;
          }

          .metrics,
          .benefitStrip,
          .packageGrid,
          .infoGrid {
            grid-template-columns: 1fr;
          }

          .metric {
            min-height: 105px;
          }

          .benefitItem {
            border-right: 0;
            border-bottom:
              1px solid
              rgba(91,75,159,.07);
          }

          .benefitItem:last-child {
            border-bottom: 0;
          }

          .sectionHead {
            align-items: flex-start;
            flex-direction: column;
          }

          .packageCard {
            min-height: auto;
          }

          .transactionHead {
            align-items: flex-start;
            flex-direction: column;
          }

          .transactionRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="hero">
        <div className="heroTop">
          <div className="heroCopy">
            <div className="kicker">
              💎 Kredi & Premium Merkezi
            </div>

            <h1 className="heroTitle">
              Lead aç, hastaya daha hızlı ulaş.
            </h1>

            <p className="heroText">
              Kredi paketleriyle sana yönlendirilen lead
              kayıtlarının iletişim bilgilerini görüntüle.
              Premium üyelik ile 10 krediye ek olarak uygun
              lead dağıtımlarında öncelik avantajı kazan.
            </p>
          </div>

          <div
            className="heroVisual"
            aria-hidden
          >
            <div className="heroDiamond">
              💎
            </div>
          </div>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="metricIcon">
              💳
            </div>

            <div>
              <div className="metricLabel">
                Kredi Bakiyesi
              </div>

              <div className="metricValue">
                {creditBalance}
              </div>

              <div className="metricHint">
                Kullanılabilir lead kredin
              </div>
            </div>
          </div>

          <div className="metric">
            <div className="metricIcon">
              👑
            </div>

            <div>
              <div className="metricLabel">
                Premium Durumu
              </div>

              <div className="metricValue">
                {isPremiumActive
                  ? "Aktif"
                  : "Pasif"}
              </div>

              <div className="metricHint">
                {isPremiumActive
                  ? `${fmtDate(
                      clinic?.premiumExpiresAt,
                    )} tarihine kadar`
                  : "Öncelikli dağıtım kapalı"}
              </div>
            </div>
          </div>

          <div className="metric">
            <div className="metricIcon">
              📅
            </div>

            <div>
              <div className="metricLabel">
                Yenileme Modeli
              </div>

              <div className="metricValue">
                Manuel
              </div>

              <div className="metricHint">
                Süre bitiminde sen yenilersin
              </div>
            </div>
          </div>

          <div className="metric">
            <div className="metricIcon">
              📊
            </div>

            <div>
              <div className="metricLabel">
                Son İşlemler
              </div>

              <div className="metricValue">
                {transactions.length}
              </div>

              <div className="metricHint">
                Görüntülenen son kredi hareketi
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="benefitStrip">
        <div className="benefitItem">
          <div className="benefitIcon">
            🛡️
          </div>

          <div>
            <strong>
              Güvenli & Şeffaf
            </strong>

            <p>
              Kredi hareketlerin panelinde kayıtlıdır.
            </p>
          </div>
        </div>

        <div className="benefitItem">
          <div className="benefitIcon">
            ⚡
          </div>

          <div>
            <strong>
              Hızlı Kullanım
            </strong>

            <p>
              Kredinle uygun lead iletişimlerini aç.
            </p>
          </div>
        </div>

        <div className="benefitItem">
          <div className="benefitIcon">
            🎯
          </div>

          <div>
            <strong>
              Uygun Leadlere Ulaş
            </strong>

            <p>
              Hizmet kapsamındaki fırsatları değerlendir.
            </p>
          </div>
        </div>

        <div className="benefitItem">
          <div className="benefitIcon">
            📈
          </div>

          <div>
            <strong>
              Daha Fazla Fırsat
            </strong>

            <p>
              Kredi bakiyeni hazır tut, leadleri kaçırma.
            </p>
          </div>
        </div>
      </section>

      <div className="sectionHead">
        <div>
          <h2>
            Sana uygun paketi seç
          </h2>

          <p>
            İhtiyacına göre kredi paketi satın alabilir
            veya Premium üyelik ile kredi ve dağıtım
            önceliğini birlikte kullanabilirsin.
          </p>
        </div>
      </div>

      <section className="packageGrid">
        {packages.map(
          (
            packageItem,
            index,
          ) => {
            const unitPrice =
              packageItem.premium
                ? null
                : index === 0
                  ? "300 TL"
                  : index === 1
                    ? "200 TL"
                    : "160 TL";

            return (
              <article
                key={
                  packageItem.title
                }
                className={`packageCard ${
                  packageItem.featured
                    ? "featured"
                    : ""
                } ${
                  packageItem.premium
                    ? "premium"
                    : ""
                }`}
              >
                {packageItem.featured &&
                !packageItem.premium ? (
                  <div className="popularTop">
                    ✦ En Popüler
                  </div>
                ) : null}

                <div className="cardTop">
                  <div className="packageIcon">
                    {packageItem.icon}
                  </div>

                  {packageItem.badge ? (
                    <div className="packageBadge">
                      {
                        packageItem.badge
                      }
                    </div>
                  ) : null}
                </div>

                <div className="packageTitle">
                  {packageItem.title}
                </div>

                <div className="packageSubtitle">
                  {packageItem.note}
                </div>

                <div className="packagePrice">
                  {packageItem.priceText}
                </div>

                <div className="creditPill">
                  {packageItem.premium
                    ? "10 Kredi + Premium"
                    : `${packageItem.credits} Kredi`}
                </div>

                <div className="packageFeatures">
                  <div className="feature">
                    <span className="featureCheck">
                      ✓
                    </span>

                    <span>
                      {packageItem.credits} lead iletişim
                      kaydını görüntüleme hakkı
                    </span>
                  </div>

                  {!packageItem.premium ? (
                    <>
                      <div className="feature">
                        <span className="featureCheck">
                          ✓
                        </span>

                        <span>
                          Abonelik zorunluluğu olmadan
                          kullanım
                        </span>
                      </div>

                      <div className="feature">
                        <span className="featureCheck">
                          ✓
                        </span>

                        <span>
                          Kredi bakiyesi tükenene kadar
                          kullanım
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="feature">
                        <span className="featureCheck">
                          ✓
                        </span>

                        <span>
                          Uygun lead dağıtımlarında
                          standart kliniklere göre öncelik
                        </span>
                      </div>

                      <div className="feature">
                        <span className="featureCheck">
                          ✓
                        </span>

                        <span>
                          30 günlük Premium üyelik
                        </span>
                      </div>

                      <div className="feature">
                        <span className="featureCheck">
                          ✓
                        </span>

                        <span>
                          Otomatik yenileme yok
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {unitPrice ? (
                  <div className="unitPrice">
                    Kredi başına yaklaşık{" "}
                    <strong>
                      {unitPrice}
                    </strong>
                  </div>
                ) : (
                  <div className="unitPrice">
                    <strong>
                      Premium avantajı:
                    </strong>{" "}
                    10 kredi + 30 gün dağıtım önceliği
                  </div>
                )}

                <div className="packageAction">
                  <Link
                    href={
                      packageItem.buyHref
                    }
                    className="packageButton"
                  >
                    {packageItem.premium
                      ? "Premium'u Seç"
                      : "Paketi Seç"}

                    <span>
                      →
                    </span>
                  </Link>
                </div>

                <div className="legalNote">
                  {
                    packageItem.disclaimer
                  }
                </div>
              </article>
            );
          },
        )}
      </section>

      <section className="infoCard">
        <div className="infoTitle">
          Paketler nasıl çalışır?
        </div>

        <div className="infoGrid">
          <div className="infoItem">
            <strong>
              💎 1 kredi = 1 lead açma
            </strong>

            Bir kredi, kliniğe yönlendirilmiş bir lead
            kaydının iletişim bilgilerini görüntüleme
            hakkı verir.
          </div>

          <div className="infoItem">
            <strong>
              👑 Premium öncelik
            </strong>

            Premium üyelik uygun lead dağıtımlarında
            standart kliniklere göre öncelik sağlar.
          </div>

          <div className="infoItem">
            <strong>
              ℹ️ Garanti değildir
            </strong>

            Lead kaydı kesin hasta, randevu, tedavi,
            satış veya gelir garantisi anlamına gelmez.
          </div>
        </div>
      </section>

      <section className="transactions">
        <div className="transactionHead">
          <div>
            <h2>
              Kredi Hareketleri
            </h2>

            <p>
              Son 30 kredi işlemin burada görünür.
            </p>
          </div>

          <div className="balanceBadge">
            💎 Bakiye: {creditBalance}
          </div>
        </div>

        {transactions.length ===
        0 ? (
          <div className="emptyTransactions">
            Henüz kredi hareketi yok.
          </div>
        ) : (
          <div className="transactionList">
            {transactions.map(
              (
                transaction,
              ) => (
                <div
                  key={
                    transaction.id
                  }
                  className="transactionRow"
                >
                  <div className="transactionDate">
                    {fmtDateTime(
                      transaction.createdAt,
                    )}
                  </div>

                  <div>
                    <div className="transactionType">
                      {typeLabel(
                        transaction.type,
                      )}
                    </div>

                    <div className="transactionNote">
                      {transaction.note ??
                        "—"}
                    </div>
                  </div>

                  <div
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
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      <div className="legacy">
        <strong>
          Eski kota sistemi:
        </strong>{" "}

        {activeSub ? (
          <>
            Kalan{" "}
            <strong>
              {remaining}
            </strong>{" "}
            / {quotaTotal}. Bitiş:{" "}
            <strong>
              {fmtDate(
                activeSub.expiresAt,
              )}
            </strong>
            . Yeni lead açma sistemi kredi bakiyesi
            üzerinden ilerler.
          </>
        ) : (
          <>
            Aktif eski abonelik bulunmuyor. Yeni
            sistemde lead açma işlemleri kredi bakiyesi
            üzerinden ilerler.
          </>
        )}
      </div>
    </div>
  );
}