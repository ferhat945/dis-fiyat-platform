import type { CSSProperties } from "react";
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
  date: Date | null | undefined
): string {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "tr-TR"
  );
}

function fmtDateTime(
  date: Date | null | undefined
): string {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleString(
    "tr-TR"
  );
}

function typeLabel(type: string): string {
  if (type === "purchase") {
    return "Kredi satın alma";
  }

  if (type === "lead_unlock") {
    return "Lead açma";
  }

  if (type === "premium_monthly_credit") {
    return "Premium üyelik kredisi";
  }

  return type;
}

export default async function PanelSubscriptionPage(): Promise<JSX.Element> {
  const token =
    (await cookies()).get("clinic_session")
      ?.value ?? "";

  const session = token
    ? await verifyClinicSession(token)
    : null;

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 900,
            marginBottom: 8,
          }}
        >
          Yetkisiz
        </h1>

        <div>
          Lütfen{" "}
          <a href="/panel/login">
            /panel/login
          </a>{" "}
          üzerinden giriş yap.
        </div>
      </div>
    );
  }

  const now = new Date();

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
        premiumExpiresAt: true,
      },
    }),

    prisma.subscription.findFirst({
      where: {
        clinicId: session.clinicId,
        status: "active",
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      select: {
        quotaTotal: true,
        quotaUsed: true,
        expiresAt: true,
      },
    }),

    prisma.creditTransaction.findMany({
      where: {
        clinicId: session.clinicId,
      },
      orderBy: {
        createdAt: "desc",
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
    clinic?.creditBalance ?? 0;

  const isPremiumActive = Boolean(
    clinic?.isPremium &&
      clinic?.premiumExpiresAt &&
      clinic.premiumExpiresAt.getTime() >
        now.getTime()
  );

  const quotaTotal =
    activeSub?.quotaTotal ?? 0;

  const quotaUsed =
    activeSub?.quotaUsed ?? 0;

  const remaining = Math.max(
    0,
    quotaTotal - quotaUsed
  );

  const packages: PackageCard[] = [
    {
      title: "5 Kredi Paketi",
      priceText: "1.500 TL",
      credits: 5,
      note:
        "Başlangıç için ideal. 5 farklı lead kaydının iletişim bilgilerini görüntüleme hakkı verir.",
      buyHref:
        "/panel/abonelik/satin-al?package=credit_5",
      badge: "Başlangıç",
      icon: "💎",
      durationText:
        "Tek seferlik kredi paketi",
      activationText:
        "Başarılı ödeme onayından sonra tanımlanır",
      disclaimer:
        "Lead; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
    },
    {
      title: "10 Kredi Paketi",
      priceText: "2.000 TL",
      credits: 10,
      note:
        "En dengeli paket. 10 farklı lead kaydının iletişim bilgilerini görüntüleme hakkı verir.",
      buyHref:
        "/panel/abonelik/satin-al?package=credit_10",
      featured: true,
      badge: "En Popüler",
      icon: "⚡",
      durationText:
        "Tek seferlik kredi paketi",
      activationText:
        "Başarılı ödeme onayından sonra tanımlanır",
      disclaimer:
        "Lead; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
    },
    {
      title: "25 Kredi Paketi",
      priceText: "4.000 TL",
      credits: 25,
      note:
        "Yoğun çalışan klinikler için hazırlanmıştır. 25 farklı lead kaydının iletişim bilgilerini görüntüleme hakkı verir.",
      buyHref:
        "/panel/abonelik/satin-al?package=credit_25",
      badge: "En Avantajlı",
      icon: "🚀",
      durationText:
        "Tek seferlik kredi paketi",
      activationText:
        "Başarılı ödeme onayından sonra tanımlanır",
      disclaimer:
        "Lead; kesin hasta, randevu, tedavi, satış veya gelir garantisi değildir.",
    },
    {
      title: "Premium Üyelik",
      priceText: "2.500 TL / 30 gün",
      credits: 10,
      note:
        "30 günlük Premium üyelik, 10 kredi ve uygun lead dağıtımlarında standart kliniklere göre öncelik sağlar.",
      buyHref:
        "/panel/abonelik/satin-al?package=premium",
      featured: true,
      premium: true,
      badge: "Premium",
      icon: "👑",
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
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          padding: 22px 16px 56px;
          overflow: hidden;
        }

        .creditPage::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            radial-gradient(
              circle at 8% 0%,
              rgba(124,58,237,.22),
              transparent 34%
            ),
            radial-gradient(
              circle at 100% 22%,
              rgba(14,165,233,.18),
              transparent 35%
            ),
            radial-gradient(
              circle at 50% 100%,
              rgba(236,72,153,.12),
              transparent 38%
            );
        }

        .glowOrb {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          filter: blur(35px);
          opacity: .42;
          z-index: -1;
          animation: floatGlow 7s ease-in-out infinite;
        }

        .glowOne {
          top: 20px;
          right: 90px;
          background: rgba(124,58,237,.35);
        }

        .glowTwo {
          bottom: 240px;
          left: 10px;
          background: rgba(14,165,233,.26);
          animation-delay: -2s;
        }

        @keyframes floatGlow {
          0%, 100% {
            transform:
              translate3d(0,0,0)
              scale(1);
          }

          50% {
            transform:
              translate3d(0,18px,0)
              scale(1.08);
          }
        }

        .heroCard {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          padding: 24px;
          border:
            1px solid
            rgba(255,255,255,.62);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.82),
              rgba(255,255,255,.54)
            ),
            radial-gradient(
              circle at 10% 0%,
              rgba(124,58,237,.22),
              transparent 36%
            ),
            radial-gradient(
              circle at 90% 15%,
              rgba(14,165,233,.18),
              transparent 40%
            );
          box-shadow:
            0 28px 80px
            rgba(15,23,42,.12);
          backdrop-filter: blur(18px);
        }

        .heroCard::after {
          content: "";
          position: absolute;
          inset: -120px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.48),
              transparent
            );
          transform:
            rotate(12deg)
            translateX(-55%);
          animation:
            shineMove
            6s
            ease-in-out
            infinite;
          pointer-events: none;
        }

        @keyframes shineMove {
          0%, 55% {
            transform:
              rotate(12deg)
              translateX(-60%);
            opacity: 0;
          }

          70% {
            opacity: .8;
          }

          100% {
            transform:
              rotate(12deg)
              translateX(60%);
            opacity: 0;
          }
        }

        .heroContent {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content:
            space-between;
          gap: 18px;
          flex-wrap: wrap;
          align-items: center;
        }

        .heroTitle {
          margin: 12px 0 0;
          font-size:
            clamp(32px, 4vw, 52px);
          line-height: 1;
          letter-spacing: -.055em;
          font-weight: 1000;
          color: rgba(2,6,23,.96);
        }

        .heroText {
          margin-top: 12px;
          max-width: 720px;
          color: rgba(15,23,42,.72);
          font-weight: 850;
          line-height: 1.75;
        }

        .heroMetrics {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(170px, 1fr)
            );
          gap: 12px;
          margin-top: 16px;
        }

        .metricCard {
          position: relative;
          border-radius: 24px;
          padding: 16px;
          border:
            1px solid
            rgba(255,255,255,.72);
          background:
            rgba(255,255,255,.70);
          box-shadow:
            0 18px 45px
            rgba(15,23,42,.08);
          overflow: hidden;
        }

        .metricCard::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at top right,
              rgba(124,58,237,.14),
              transparent 45%
            );
          pointer-events: none;
        }

        .metricLabel {
          position: relative;
          opacity: .72;
          font-weight: 950;
          font-size: 12px;
        }

        .metricValue {
          position: relative;
          margin-top: 8px;
          font-weight: 1000;
          font-size: 30px;
          letter-spacing: -.035em;
          color: rgba(2,6,23,.96);
        }

        .metricHint {
          position: relative;
          margin-top: 4px;
          opacity: .68;
          font-weight: 850;
          font-size: 12px;
          line-height: 1.5;
        }

        .paymentNotice {
          margin-top: 14px;
          border-radius: 24px;
          padding: 16px;
          border:
            1px solid
            rgba(245,158,11,.26);
          background:
            linear-gradient(
              135deg,
              rgba(245,158,11,.13),
              rgba(255,255,255,.70)
            );
          box-shadow:
            0 18px 50px
            rgba(15,23,42,.08);
          backdrop-filter: blur(16px);
          color: rgba(120,53,15,.94);
          font-weight: 850;
          line-height: 1.65;
        }

        .packageGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(255px, 1fr)
            );
          gap: 14px;
        }

        .packageCard {
          position: relative;
          min-height: 430px;
          border-radius: 30px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
          border:
            1px solid
            rgba(255,255,255,.72);
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.88),
              rgba(255,255,255,.62)
            );
          box-shadow:
            0 22px 58px
            rgba(15,23,42,.10);
          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease;
        }

        .packageCard:hover {
          transform:
            translateY(-7px);
          box-shadow:
            0 32px 78px
            rgba(79,70,229,.18);
          border-color:
            rgba(124,58,237,.30);
        }

        .packageCard.featured {
          background:
            radial-gradient(
              circle at 12% 0%,
              rgba(124,58,237,.24),
              transparent 42%
            ),
            linear-gradient(
              135deg,
              rgba(255,255,255,.92),
              rgba(245,243,255,.74)
            );
          border-color:
            rgba(124,58,237,.28);
        }

        .packageCard.premium {
          color: white;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(250,204,21,.25),
              transparent 32%
            ),
            radial-gradient(
              circle at 100% 15%,
              rgba(168,85,247,.38),
              transparent 42%
            ),
            linear-gradient(
              135deg,
              rgba(15,23,42,.98),
              rgba(67,56,202,.94)
            );
          border-color:
            rgba(255,255,255,.22);
          box-shadow:
            0 30px 90px
            rgba(67,56,202,.28);
        }

        .packageCard::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at top right,
              rgba(255,255,255,.44),
              transparent 38%
            );
          opacity: .6;
          pointer-events: none;
        }

        .packageTop,
        .packagePrice,
        .packageChips,
        .packageNote,
        .packageAction {
          position: relative;
          z-index: 1;
        }

        .packageTop {
          display: flex;
          justify-content:
            space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .packageIcon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background:
            rgba(255,255,255,.78);
          box-shadow:
            inset 0 0 0 1px
            rgba(15,23,42,.08);
          font-size: 22px;
        }

        .premium .packageIcon {
          background:
            rgba(255,255,255,.14);
          box-shadow:
            inset 0 0 0 1px
            rgba(255,255,255,.18);
        }

        .packageTitle {
          margin-top: 12px;
          font-size: 20px;
          font-weight: 1000;
          letter-spacing: -.025em;
        }

        .packagePrice {
          font-size: 34px;
          font-weight: 1000;
          letter-spacing: -.045em;
          line-height: 1.05;
        }

        .packageChips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .packageNote {
          opacity: .78;
          font-weight: 850;
          line-height: 1.65;
        }

        .premium .packageNote {
          opacity: .9;
        }

        .packageAction {
          margin-top: auto;
        }

        .buyButton {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          width: 100%;
          text-align: center;
          padding: 14px 16px;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              rgba(79,70,229,.98),
              rgba(168,85,247,.98)
            );
          color: white;
          font-weight: 1000;
          text-decoration: none;
          border:
            1px solid
            rgba(255,255,255,.20);
          box-shadow:
            0 18px 42px
            rgba(124,58,237,.22);
          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .buyButton:hover {
          transform: scale(1.025);
          box-shadow:
            0 24px 55px
            rgba(124,58,237,.30);
        }

        .premium .buyButton {
          background:
            linear-gradient(
              135deg,
              #facc15,
              #fb923c
            );
          color: rgba(15,23,42,.96);
          box-shadow:
            0 18px 45px
            rgba(250,204,21,.20);
        }

        .informationCard {
          margin-top: 16px;
          border-radius: 24px;
          padding: 18px;
          border:
            1px solid
            rgba(59,130,246,.20);
          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,.10),
              rgba(255,255,255,.74)
            );
          box-shadow:
            0 18px 50px
            rgba(15,23,42,.07);
          backdrop-filter: blur(16px);
        }

        .informationList {
          margin-top: 10px;
          display: grid;
          gap: 8px;
          line-height: 1.65;
          font-weight: 800;
          color: rgba(15,23,42,.76);
        }

        .transactionCard {
          margin-top: 16px;
          border-radius: 30px;
          border:
            1px solid
            rgba(255,255,255,.72);
          background:
            rgba(255,255,255,.74);
          box-shadow:
            0 24px 70px
            rgba(15,23,42,.10);
          backdrop-filter: blur(16px);
          padding: 18px;
          overflow: hidden;
        }

        .transactionRow {
          display: grid;
          grid-template-columns:
            minmax(140px, 190px)
            1fr
            auto;
          gap: 12px;
          align-items: center;
          border:
            1px solid
            rgba(15,23,42,.08);
          background:
            rgba(255,255,255,.72);
          border-radius: 18px;
          padding: 12px 14px;
        }

        @media (max-width: 760px) {
          .heroMetrics {
            grid-template-columns: 1fr;
          }

          .packageCard {
            min-height: unset;
          }

          .transactionRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="glowOrb glowOne" />
      <div className="glowOrb glowTwo" />

      <section className="heroCard">
        <div className="heroContent">
          <div>
            <span style={badgeStyle()}>
              💎 Kredi & Premium Merkezi
            </span>

            <h1 className="heroTitle">
              Lead aç, hastaya daha hızlı ulaş.
            </h1>

            <div className="heroText">
              Kredi satın alarak sana
              yönlendirilmiş lead kayıtlarının
              iletişim bilgilerini
              görüntüleyebilir, Premium üyelik ile
              uygun lead dağıtımlarında öncelik
              kazanabilirsin. Tüm kredi alış ve
              harcama hareketlerin burada şeffaf
              şekilde tutulur.
            </div>
          </div>

          <div
            style={{
              opacity: 0.78,
              fontWeight: 950,
            }}
          >
            Klinik:{" "}
            <strong>{session.name}</strong>
          </div>
        </div>

        <div className="heroMetrics">
          <div className="metricCard">
            <div className="metricLabel">
              Kredi Bakiyesi
            </div>

            <div className="metricValue">
              {creditBalance}
            </div>

            <div className="metricHint">
              1 kredi = 1 lead iletişim
              kaydını görüntüleme
            </div>
          </div>

          <div className="metricCard">
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
                ? `Bitiş: ${fmtDate(
                    clinic?.premiumExpiresAt
                  )}`
                : "Dağıtım önceliği kapalı"}
            </div>
          </div>

          <div className="metricCard">
            <div className="metricLabel">
              Yenileme Modeli
            </div>

            <div className="metricValue">
              Manuel
            </div>

            <div className="metricHint">
              Premium üyelik süresi sonunda
              kullanıcı tarafından yeniden satın
              alınır
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 14 }}>
        {isPremiumActive
          ? premiumBox(
              clinic?.premiumExpiresAt
            )
          : normalBox()}
      </div>

      <div className="paymentNotice">
        <strong>
          🏦 Garanti BBVA Sanal POS başvuru
          sürecindedir.
        </strong>{" "}
        Paketleri ve sözleşme bilgilerini
        inceleyebilirsin. Ödeme altyapısı
        etkinleştirilene kadar karttan tahsilat
        yapılmaz ve hesabına otomatik kredi ya da
        Premium üyelik tanımlanmaz.
      </div>

      <section className="packageGrid">
        {packages.map((packageItem) => (
          <div
            key={packageItem.title}
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
            <div className="packageTop">
              <div>
                <div className="packageIcon">
                  {packageItem.icon}
                </div>

                <div className="packageTitle">
                  {packageItem.title}
                </div>
              </div>

              {packageItem.badge ? (
                <span
                  style={
                    packageItem.premium
                      ? premiumBadgeStyle()
                      : badgeStyle()
                  }
                >
                  {packageItem.badge}
                </span>
              ) : null}
            </div>

            <div className="packagePrice">
              {packageItem.priceText}
            </div>

            <div className="packageChips">
              <span
                style={
                  packageItem.premium
                    ? premiumChipStyle()
                    : chipStyle()
                }
              >
                🎯 {packageItem.credits} kredi
              </span>

              <span
                style={
                  packageItem.premium
                    ? premiumChipStyle()
                    : chipStyle()
                }
              >
                🛡️ Bilgilendirmeli veri süreci
              </span>

              <span
                style={
                  packageItem.premium
                    ? premiumChipStyle()
                    : chipStyle()
                }
              >
                🏦 Sanal POS hazırlığı
              </span>
            </div>

            <div className="packageNote">
              <div>{packageItem.note}</div>

              <div
                style={{
                  marginTop: 10,
                  display: "grid",
                  gap: 5,
                  fontSize: 12,
                  lineHeight: 1.55,
                  opacity:
                    packageItem.premium
                      ? 0.92
                      : 0.78,
                }}
              >
                <div>
                  <strong>Süre:</strong>{" "}
                  {packageItem.durationText}
                </div>

                <div>
                  <strong>
                    Aktivasyon:
                  </strong>{" "}
                  {packageItem.activationText}
                </div>

                {packageItem.renewalText ? (
                  <div>
                    <strong>
                      Yenileme:
                    </strong>{" "}
                    {
                      packageItem.renewalText
                    }
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop:
                    packageItem.premium
                      ? "1px solid rgba(255,255,255,0.16)"
                      : "1px solid rgba(15,23,42,0.08)",
                  fontSize: 11,
                  lineHeight: 1.55,
                  fontWeight: 800,
                  opacity:
                    packageItem.premium
                      ? 0.86
                      : 0.7,
                }}
              >
                {packageItem.disclaimer}
              </div>
            </div>

            <div className="packageAction">
              <Link
                href={packageItem.buyHref}
                className="buyButton"
              >
                🔎 Paketi İncele
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="informationCard">
        <div
          style={{
            fontWeight: 1000,
            fontSize: 18,
          }}
        >
          ℹ️ Paketler hakkında önemli
          bilgilendirme
        </div>

        <div className="informationList">
          <div>
            • Bir kredi, kliniğe
            yönlendirilmiş bir lead kaydının
            iletişim bilgilerini görüntüleme
            hakkı verir.
          </div>

          <div>
            • Lead kaydı; kesin hasta,
            randevu, tedavi, satış veya gelir
            garantisi anlamına gelmez.
          </div>

          <div>
            • Premium üyelik, uygun lead
            dağıtımlarında standart kliniklere
            göre öncelik sağlar; münhasır lead
            veya belirli sayıda talep garantisi
            vermez.
          </div>

          <div>
            • Paket kapsamı, vergiler,
            sözleşmeler ve toplam ödeme tutarı
            satın alma ekranında ödeme öncesinde
            gösterilir.
          </div>

          <div>
            • Premium üyelik otomatik
            yenilenmez. Süre sonunda kullanıcı
            tarafından yeniden satın alınması
            gerekir.
          </div>

          <div>
            • Kredi veya Premium üyelik yalnızca
            ödeme kuruluşundan başarılı ödeme
            doğrulaması alındıktan sonra
            etkinleştirilir.
          </div>
        </div>
      </section>

      <section className="transactionCard">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 1000,
                fontSize: 22,
                letterSpacing: "-0.02em",
              }}
            >
              📜 Kredi Hareketleri
            </div>

            <div
              style={{
                opacity: 0.72,
                fontWeight: 850,
                marginTop: 4,
              }}
            >
              Son 30 kredi işlemi.
            </div>
          </div>

          <span style={badgeStyle()}>
            Bakiye: {creditBalance}
          </span>
        </div>

        {transactions.length === 0 ? (
          <div
            style={{
              marginTop: 14,
              opacity: 0.75,
              fontWeight: 850,
            }}
          >
            Henüz kredi hareketi yok.
          </div>
        ) : (
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gap: 10,
            }}
          >
            {transactions.map(
              (transaction) => (
                <div
                  key={transaction.id}
                  className="transactionRow"
                >
                  <div
                    style={{
                      opacity: 0.72,
                      fontWeight: 850,
                      fontSize: 13,
                    }}
                  >
                    {fmtDateTime(
                      transaction.createdAt
                    )}
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 1000,
                      }}
                    >
                      {typeLabel(
                        transaction.type
                      )}
                    </div>

                    <div
                      style={{
                        opacity: 0.7,
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {transaction.note ??
                        "—"}
                    </div>
                  </div>

                  <div
                    style={{
                      fontWeight: 1000,
                      color:
                        transaction.amount >= 0
                          ? "#15803d"
                          : "#b91c1c",
                      whiteSpace: "nowrap",
                      fontSize: 16,
                    }}
                  >
                    {transaction.amount > 0
                      ? `+${transaction.amount}`
                      : transaction.amount}{" "}
                    kredi
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      <div
        style={{
          marginTop: 16,
          opacity: 0.75,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            marginBottom: 6,
          }}
        >
          Eski kota bilgisi
        </div>

        {activeSub ? (
          <div
            style={{
              fontWeight: 800,
              lineHeight: 1.7,
            }}
          >
            Eski abonelik/kota sisteminde
            kalan:{" "}
            <strong>{remaining}</strong> /{" "}
            {quotaTotal}. Bitiş:{" "}
            <strong>
              {fmtDate(activeSub.expiresAt)}
            </strong>
            . Yeni sistemde lead açma işlemleri
            kredi bakiyesi üzerinden ilerler.
          </div>
        ) : (
          <div
            style={{
              fontWeight: 800,
              lineHeight: 1.7,
            }}
          >
            Aktif eski abonelik bulunamadı.
            Yeni sistemde kredi bakiyesi
            kullanılacak.
          </div>
        )}
      </div>
    </div>
  );
}

function normalBox(): JSX.Element {
  return (
    <div style={noticeBox("info")}>
      <div style={{ fontWeight: 950 }}>
        ℹ️ Premium kapalı
      </div>

      <div
        style={{
          marginTop: 6,
          opacity: 0.85,
          fontWeight: 850,
        }}
      >
        Normal klinikler kredi satın alarak
        lead iletişim bilgilerini
        görüntüleyebilir. Premium klinikler
        uygun lead dağıtımlarında öncelik
        kazanır.
      </div>
    </div>
  );
}

function premiumBox(
  expiresAt: Date | null | undefined
): JSX.Element {
  return (
    <div style={noticeBox("ok")}>
      <div style={{ fontWeight: 950 }}>
        ✅ Premium aktif
      </div>

      <div
        style={{
          marginTop: 6,
          opacity: 0.85,
          fontWeight: 850,
        }}
      >
        Premium dağıtım önceliğin aktif.
        Bitiş:{" "}
        <strong>
          {fmtDate(expiresAt)}
        </strong>
      </div>
    </div>
  );
}

function noticeBox(
  kind: "ok" | "info"
): CSSProperties {
  const base: CSSProperties = {
    borderRadius: 24,
    border:
      "1px solid rgba(255,255,255,0.70)",
    background:
      "rgba(255,255,255,0.68)",
    boxShadow:
      "0 18px 50px rgba(15,23,42,0.08)",
    padding: 16,
    backdropFilter: "blur(16px)",
  };

  if (kind === "ok") {
    return {
      ...base,
      border:
        "1px solid rgba(34,197,94,0.24)",
      background:
        "linear-gradient(135deg, rgba(34,197,94,0.13), rgba(255,255,255,0.70))",
    };
  }

  return {
    ...base,
    border:
      "1px solid rgba(59,130,246,0.24)",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.13), rgba(255,255,255,0.70))",
  };
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

function chipStyle(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 999,
    border:
      "1px solid rgba(15,23,42,0.10)",
    background:
      "rgba(255,255,255,0.72)",
    fontWeight: 950,
    fontSize: 12,
  };
}

function premiumChipStyle(): CSSProperties {
  return {
    ...chipStyle(),
    color: "white",
    border:
      "1px solid rgba(255,255,255,0.18)",
    background:
      "rgba(255,255,255,0.12)",
  };
}