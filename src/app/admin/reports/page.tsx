import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function formatPercent(
  value: number
): string {
  return `${Math.max(
    0,
    Math.min(
      100,
      value
    )
  )}%`;
}

export default async function AdminReportsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const now =
    new Date();

  const d30 =
    new Date(now);

  d30.setDate(
    d30.getDate() - 30
  );

  const [
    leads30,
    assignments30,
    unlocked30,
    topCities,
    topServices,
  ] =
    await Promise.all([
      prisma.lead.count({
        where: {
          createdAt: {
            gte: d30,
          },
        },
      }),

      prisma.leadAssignment.count({
        where: {
          createdAt: {
            gte: d30,
          },
        },
      }),

      prisma.leadAssignment.count({
        where: {
          createdAt: {
            gte: d30,
          },

          unlocked: true,
        },
      }),

      prisma.lead.groupBy({
        by: ["city"],

        _count: {
          city: true,
        },

        orderBy: {
          _count: {
            city: "desc",
          },
        },

        take: 10,
      }),

      prisma.lead.groupBy({
        by: ["service"],

        _count: {
          service: true,
        },

        orderBy: {
          _count: {
            service: "desc",
          },
        },

        take: 10,
      }),
    ]);

  const purchaseRate =
    leads30 > 0
      ? Math.round(
          (unlocked30 /
            leads30) *
            100
        )
      : 0;

  const assignmentRate =
    leads30 > 0
      ? Math.round(
          (assignments30 /
            leads30) *
            100
        )
      : 0;

  const maxCity =
    topCities[0]?._count
      .city ?? 1;

  const maxService =
    topServices[0]?._count
      .service ?? 1;

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <div className="adminStatLabel">
            Lead / 30 Gün
          </div>

          <div className="adminStatValue">
            {leads30}
          </div>

          <div className="adminStatMeta">
            Son 30 gündeki toplam lead
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Assignment
          </div>

          <div className="adminStatValue">
            {assignments30}
          </div>

          <div className="adminStatMeta">
            Son 30 gündeki assignment kaydı
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Satın Alınan
          </div>

          <div className="adminStatValue">
            {unlocked30}
          </div>

          <div className="adminStatMeta">
            unlocked=true kayıtları
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Satın Alma Oranı
          </div>

          <div className="adminStatValue">
            {formatPercent(
              purchaseRate
            )}
          </div>

          <div className="adminStatMeta">
            Satın alma / lead
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(360px,1fr))",
          gap: 14,
        }}
      >
        <div className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>
                En Yoğun Şehirler
              </h2>

              <p>
                Son kayıtlar içindeki lead dağılımı.
              </p>
            </div>

            <span className="adminBadge adminBadgeInfo">
              Top 10
            </span>
          </div>

          <div className="adminCardBody">
            {topCities.length ===
            0 ? (
              <div className="adminEmptyState">
                <strong>
                  Veri bulunmuyor
                </strong>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gap: 12,
                }}
              >
                {topCities.map(
                  (
                    item,
                    index
                  ) => {
                    const width =
                      Math.max(
                        5,
                        Math.round(
                          (item
                            ._count
                            .city /
                            maxCity) *
                            100
                        )
                      );

                    return (
                      <div
                        key={
                          item.city
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap: 12,
                            alignItems:
                              "center",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                width:
                                  22,
                                height:
                                  22,
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  7,
                                background:
                                  "#f2f4f7",
                                color:
                                  "#667085",
                                fontSize:
                                  8,
                                fontWeight:
                                  800,
                              }}
                            >
                              {index +
                                1}
                            </span>

                            <strong
                              style={{
                                color:
                                  "#344054",
                                fontSize:
                                  10,
                              }}
                            >
                              {
                                item.city
                              }
                            </strong>
                          </div>

                          <span className="adminBadge adminBadgeNeutral">
                            {
                              item
                                ._count
                                .city
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            height: 6,
                            marginTop:
                              7,
                            overflow:
                              "hidden",
                            borderRadius:
                              999,
                            background:
                              "#f2f4f7",
                          }}
                        >
                          <div
                            style={{
                              width: `${width}%`,
                              height:
                                "100%",
                              borderRadius:
                                999,
                              background:
                                "linear-gradient(90deg,#8179ff,#554bea)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCardHeader">
            <div>
              <h2>
                En Yoğun Hizmetler
              </h2>

              <p>
                Hangi tedaviler daha çok talep görüyor.
              </p>
            </div>

            <span className="adminBadge adminBadgeInfo">
              Top 10
            </span>
          </div>

          <div className="adminCardBody">
            {topServices.length ===
            0 ? (
              <div className="adminEmptyState">
                <strong>
                  Veri bulunmuyor
                </strong>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gap: 12,
                }}
              >
                {topServices.map(
                  (
                    item,
                    index
                  ) => {
                    const width =
                      Math.max(
                        5,
                        Math.round(
                          (item
                            ._count
                            .service /
                            maxService) *
                            100
                        )
                      );

                    return (
                      <div
                        key={
                          item.service
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap: 12,
                            alignItems:
                              "center",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                width:
                                  22,
                                height:
                                  22,
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  7,
                                background:
                                  "#f2f4f7",
                                color:
                                  "#667085",
                                fontSize:
                                  8,
                                fontWeight:
                                  800,
                              }}
                            >
                              {index +
                                1}
                            </span>

                            <strong
                              style={{
                                color:
                                  "#344054",
                                fontSize:
                                  10,
                              }}
                            >
                              {
                                item.service
                              }
                            </strong>
                          </div>

                          <span className="adminBadge adminBadgeNeutral">
                            {
                              item
                                ._count
                                .service
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            height: 6,
                            marginTop:
                              7,
                            overflow:
                              "hidden",
                            borderRadius:
                              999,
                            background:
                              "#f2f4f7",
                          }}
                        >
                          <div
                            style={{
                              width: `${width}%`,
                              height:
                                "100%",
                              borderRadius:
                                999,
                              background:
                                "linear-gradient(90deg,#2e90fa,#1570ef)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Dönüşüm Özeti
            </h2>

            <p>
              Son 30 günlük lead ve erişim hareketlerinin kısa görünümü.
            </p>
          </div>
        </div>

        <div
          className="adminCardBody"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 12,
          }}
        >
          <ReportBox
            label="Assignment / Lead"
            value={formatPercent(
              assignmentRate
            )}
            description="Bir lead için oluşan assignment yoğunluğu"
          />

          <ReportBox
            label="Satın Alma / Lead"
            value={formatPercent(
              purchaseRate
            )}
            description="Lead başına unlocked assignment oranı"
          />

          <ReportBox
            label="Ort. Assignment"
            value={
              leads30 > 0
                ? (
                    assignments30 /
                    leads30
                  ).toFixed(2)
                : "0.00"
            }
            description="Lead başına ortalama assignment"
          />
        </div>
      </section>
    </div>
  );
}

function ReportBox({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}): JSX.Element {
  return (
    <div
      style={{
        padding: 16,
        border:
          "1px solid #e7eaf0",
        borderRadius: 15,
        background:
          "#fafbfc",
      }}
    >
      <div
        style={{
          color: "#667085",
          fontSize: 9,
          fontWeight: 750,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 7,
          color: "#101828",
          fontSize: 24,
          fontWeight: 850,
          letterSpacing:
            "-.04em",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 5,
          color: "#98a2b3",
          fontSize: 8,
          lineHeight: 1.55,
        }}
      >
        {description}
      </div>
    </div>
  );
}