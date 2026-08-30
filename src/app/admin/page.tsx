import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminLoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

function startOfToday(): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
}

function startOfMonth(): Date {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

function statusLabel(status: string): string {
  if (
    status === "paid" ||
    status === "success" ||
    status === "completed"
  ) {
    return "Başarılı";
  }

  if (status === "failed") {
    return "Başarısız";
  }

  if (status === "canceled") {
    return "İptal";
  }

  if (status === "awaiting_transfer") {
    return "Havale Bekliyor";
  }

  if (status === "transfer_notified") {
    return "Bildirim Geldi";
  }

  return status;
}

function paymentBadgeClass(status: string): string {
  if (
    status === "paid" ||
    status === "success" ||
    status === "completed"
  ) {
    return "adminBadge adminBadgeSuccess";
  }

  if (status === "failed") {
    return "adminBadge adminBadgeDanger";
  }

  if (
    status === "awaiting_transfer" ||
    status === "transfer_notified"
  ) {
    return "adminBadge adminBadgeWarning";
  }

  return "adminBadge adminBadgeNeutral";
}

export default async function AdminHomePage(): Promise<JSX.Element> {
  try {
    await requireAdmin();
  } catch {
    return <AdminLoginClient />;
  }

  const today = startOfToday();
  const monthStart = startOfMonth();

  const [
    totalClinics,
    activeClinics,
    totalLeads,
    leadsToday,
    purchasedAssignments,
    monthPayments,
    recentLeads,
    recentPayments,
  ] = await Promise.all([
    prisma.clinic.count(),

    prisma.clinic.count({
      where: {
        isActive: true,
      },
    }),

    prisma.lead.count(),

    prisma.lead.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),

    prisma.leadAssignment.count({
      where: {
        unlocked: true,
      },
    }),

    prisma.paymentLog.findMany({
      where: {
        createdAt: {
          gte: monthStart,
        },
        status: {
          in: [
            "paid",
            "success",
            "completed",
          ],
        },
      },

      select: {
        amount: true,
      },
    }),

    prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 6,

      select: {
        id: true,
        city: true,
        service: true,
        fullName: true,
        source: true,
        createdAt: true,
        unlockCount: true,
      },
    }),

    prisma.paymentLog.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 6,

      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,

        clinic: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const monthlyRevenue = monthPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const revenueText =
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(monthlyRevenue);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        className="adminCard"
        style={{
          overflow: "hidden",
          border: 0,
          background:
            "linear-gradient(135deg,#101828 0%,#18233d 52%,#4338ca 140%)",
          color: "white",
        }}
      >
        <div
          style={{
            padding: 26,
            display: "flex",
            justifyContent: "space-between",
            gap: 24,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 650 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 9px",
                borderRadius: 999,
                border:
                  "1px solid rgba(255,255,255,.12)",
                background:
                  "rgba(255,255,255,.07)",
                fontSize: 9,
                fontWeight: 800,
                color:
                  "rgba(255,255,255,.75)",
              }}
            >
              <span className="adminStatusDot" />
              Operasyon merkezi aktif
            </div>

            <h2
              style={{
                margin: "14px 0 0",
                fontSize:
                  "clamp(25px,4vw,38px)",
                lineHeight: 1.05,
                letterSpacing: "-.045em",
              }}
            >
              DişFiyat360 yönetimi tek ekranda.
            </h2>

            <p
              style={{
                margin: "11px 0 0",
                maxWidth: 570,
                color:
                  "rgba(255,255,255,.62)",
                fontSize: 12,
                lineHeight: 1.75,
                fontWeight: 550,
              }}
            >
              Klinik, lead, ödeme ve içerik
              operasyonlarını buradan takip
              edebilirsin.
            </p>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                gap: 9,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/admin/leads"
                className="adminButton"
                style={{
                  background: "white",
                  color: "#101828",
                }}
              >
                Leadleri İncele →
              </Link>

              <Link
                href="/admin/odemeler"
                className="adminButton"
                style={{
                  border:
                    "1px solid rgba(255,255,255,.15)",
                  background:
                    "rgba(255,255,255,.06)",
                  color: "white",
                }}
              >
                Ödemelere Git
              </Link>
            </div>
          </div>

          <div
            style={{
              width: 230,
              maxWidth: "100%",
              padding: 18,
              border:
                "1px solid rgba(255,255,255,.10)",
              borderRadius: 18,
              background:
                "rgba(255,255,255,.055)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                color:
                  "rgba(255,255,255,.45)",
                fontSize: 9,
                fontWeight: 750,
              }}
            >
              BU AY BAŞARILI ÖDEME
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 27,
                fontWeight: 900,
                letterSpacing: "-.04em",
              }}
            >
              {revenueText}
            </div>

            <div
              style={{
                marginTop: 13,
                height: 1,
                background:
                  "rgba(255,255,255,.10)",
              }}
            />

            <div
              style={{
                marginTop: 13,
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 10,
                fontSize: 10,
              }}
            >
              <span
                style={{
                  color:
                    "rgba(255,255,255,.45)",
                }}
              >
                Toplam lead
              </span>

              <strong>{totalLeads}</strong>
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 10,
                fontSize: 10,
              }}
            >
              <span
                style={{
                  color:
                    "rgba(255,255,255,.45)",
                }}
              >
                Aktif klinik
              </span>

              <strong>{activeClinics}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <div className="adminStatLabel">
            Toplam Klinik
          </div>

          <div className="adminStatValue">
            {totalClinics}
          </div>

          <div className="adminStatMeta">
            {activeClinics} aktif klinik
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Toplam Lead
          </div>

          <div className="adminStatValue">
            {totalLeads}
          </div>

          <div className="adminStatMeta">
            Bugün +{leadsToday} yeni talep
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Satın Alma
          </div>

          <div className="adminStatValue">
            {purchasedAssignments}
          </div>

          <div className="adminStatMeta">
            Açılmış lead hakları
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Aylık Gelir
          </div>

          <div
            className="adminStatValue"
            style={{
              fontSize: 22,
              paddingTop: 3,
            }}
          >
            {revenueText}
          </div>

          <div className="adminStatMeta">
            Başarılı ödeme kayıtları
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(340px,1fr))",
          gap: 14,
        }}
      >
        <div className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>Son Leadler</h2>
              <p>
                Platforma en son gelen hasta
                talepleri.
              </p>
            </div>

            <Link
              href="/admin/leads"
              className="adminButton adminButtonSecondary"
            >
              Tümü →
            </Link>
          </div>

          <div
            style={{
              display: "grid",
            }}
          >
            {recentLeads.length === 0 ? (
              <div className="adminEmptyState">
                <strong>Lead bulunmuyor</strong>
                <p>
                  Yeni lead geldiğinde burada
                  görünecek.
                </p>
              </div>
            ) : (
              recentLeads.map(
                (lead, index) => (
                  <div
                    key={lead.id}
                    style={{
                      padding: "13px 18px",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 14,
                      alignItems: "center",
                      borderBottom:
                        index ===
                        recentLeads.length - 1
                          ? 0
                          : "1px solid #f0f2f5",
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          color: "#101828",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {lead.fullName}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: "#667085",
                          fontSize: 9,
                        }}
                      >
                        {lead.city} ·{" "}
                        {lead.service}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: "#98a2b3",
                          fontSize: 8,
                        }}
                      >
                        {formatDateTime(
                          lead.createdAt
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        justifyItems: "end",
                        gap: 5,
                      }}
                    >
                      <span
                        className={
                          lead.unlockCount >= 3
                            ? "adminBadge adminBadgeSuccess"
                            : "adminBadge adminBadgeInfo"
                        }
                      >
                        {lead.unlockCount}/3
                      </span>

                      <span
                        style={{
                          color: "#98a2b3",
                          fontSize: 8,
                        }}
                      >
                        {lead.source ??
                          "genel"}
                      </span>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>Son Ödemeler</h2>
              <p>
                Kliniklerin en güncel ödeme
                hareketleri.
              </p>
            </div>

            <Link
              href="/admin/odemeler"
              className="adminButton adminButtonSecondary"
            >
              Tümü →
            </Link>
          </div>

          <div style={{ display: "grid" }}>
            {recentPayments.length === 0 ? (
              <div className="adminEmptyState">
                <strong>
                  Ödeme bulunmuyor
                </strong>

                <p>
                  Yeni ödeme hareketleri burada
                  görüntülenecek.
                </p>
              </div>
            ) : (
              recentPayments.map(
                (payment, index) => (
                  <Link
                    key={payment.id}
                    href={`/admin/odemeler/${payment.id}`}
                    style={{
                      padding: "13px 18px",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 14,
                      alignItems: "center",
                      borderBottom:
                        index ===
                        recentPayments.length - 1
                          ? 0
                          : "1px solid #f0f2f5",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#101828",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {payment.clinic.name}
                      </div>

                      <div
                        style={{
                          marginTop: 4,
                          color: "#98a2b3",
                          fontSize: 8,
                        }}
                      >
                        {formatDateTime(
                          payment.createdAt
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        justifyItems: "end",
                        gap: 5,
                      }}
                    >
                      <strong
                        style={{
                          color: "#101828",
                          fontSize: 11,
                        }}
                      >
                        {new Intl.NumberFormat(
                          "tr-TR",
                          {
                            style: "currency",
                            currency:
                              payment.currency ||
                              "TRY",
                            maximumFractionDigits: 0,
                          }
                        ).format(
                          payment.amount
                        )}
                      </strong>

                      <span
                        className={paymentBadgeClass(
                          payment.status
                        )}
                      >
                        {statusLabel(
                          payment.status
                        )}
                      </span>
                    </div>
                  </Link>
                )
              )
            )}
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>Hızlı Yönetim</h2>
            <p>
              Sık kullandığın yönetim
              bölümlerine geç.
            </p>
          </div>
        </div>

        <div
          className="adminCardBody"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 10,
          }}
        >
          <QuickCard
            href="/admin/clinics"
            title="Klinikler"
            description="Klinik hesapları"
          />

          <QuickCard
            href="/admin/leads"
            title="Leadler"
            description="Hasta talepleri"
          />

          <QuickCard
            href="/admin/coverages"
            title="Coverage"
            description="Şehir ve hizmetler"
          />

          <QuickCard
            href="/admin/odemeler"
            title="Ödemeler"
            description="Tahsilat kayıtları"
          />

          <QuickCard
            href="/admin/blog"
            title="Blog"
            description="SEO içerikleri"
          />

          <QuickCard
            href="/admin/reports"
            title="Raporlar"
            description="Performans analizi"
          />
        </div>
      </section>
    </div>
  );
}

function QuickCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}): JSX.Element {
  return (
    <Link
      href={href}
      style={{
        padding: 14,
        border: "1px solid #e7eaf0",
        borderRadius: 14,
        background: "#fff",
        color: "#101828",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        {title} →
      </div>

      <div
        style={{
          marginTop: 5,
          color: "#98a2b3",
          fontSize: 9,
        }}
      >
        {description}
      </div>
    </Link>
  );
}