import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(
  value: Date
): string {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(value);
}

export default async function AdminAssignmentsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const [
    totalAssignments,
    unlockedAssignments,
    assignments,
  ] =
    await Promise.all([
      prisma.leadAssignment.count(),

      prisma.leadAssignment.count({
        where: {
          unlocked: true,
        },
      }),

      prisma.leadAssignment.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 100,

        select: {
          id: true,
          leadId: true,
          clinicId: true,
          unlocked: true,
          unlockedAt: true,
          unlockPrice: true,
          status: true,
          createdAt: true,

          clinic: {
            select: {
              name: true,
              email: true,
            },
          },

          lead: {
            select: {
              city: true,
              service: true,
              fullName: true,
              source: true,
              unlockCount: true,
            },
          },
        },
      }),
    ]);

  const lockedAssignments =
    Math.max(
      0,
      totalAssignments -
        unlockedAssignments
    );

  const totalCredits =
    assignments.reduce(
      (
        sum,
        assignment
      ) =>
        sum +
        (assignment.unlocked
          ? assignment.unlockPrice
          : 0),
      0
    );

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
            Toplam Kayıt
          </div>

          <div className="adminStatValue">
            {totalAssignments}
          </div>

          <div className="adminStatMeta">
            LeadAssignment kayıtları
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Açılmış
          </div>

          <div className="adminStatValue">
            {unlockedAssignments}
          </div>

          <div className="adminStatMeta">
            Satın alınmış lead erişimleri
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Kilitli
          </div>

          <div className="adminStatValue">
            {lockedAssignments}
          </div>

          <div className="adminStatMeta">
            Açılmamış assignment kayıtları
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Son 100 Kredi
          </div>

          <div className="adminStatValue">
            {totalCredits}
          </div>

          <div className="adminStatMeta">
            Görünen kayıtlardaki kredi toplamı
          </div>
        </div>
      </section>

      <section
        className="adminCard"
        style={{
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            padding: 20,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap: 16,
            flexWrap:
              "wrap",
            background:
              "linear-gradient(135deg,#101828,#18233d)",
            color: "white",
          }}
        >
          <div>
            <div
              style={{
                color:
                  "rgba(255,255,255,.48)",
                fontSize: 9,
                fontWeight:
                  750,
              }}
            >
              LEAD HAREKETLERİ
            </div>

            <h2
              style={{
                margin:
                  "7px 0 0",
                fontSize: 21,
                letterSpacing:
                  "-.035em",
              }}
            >
              Satın alma ve erişim kayıtları
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                maxWidth: 620,
                color:
                  "rgba(255,255,255,.55)",
                fontSize: 10,
                lineHeight: 1.65,
              }}
            >
              Hangi kliniğin hangi lead kaydına eriştiğini ve açılma durumlarını buradan takip edebilirsin.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap:
                "wrap",
            }}
          >
            <Link
              href="/admin/leads"
              className="adminButton"
              style={{
                background:
                  "white",
                color:
                  "#101828",
              }}
            >
              Leadler →
            </Link>

            <Link
              href="/admin/logs"
              className="adminButton"
              style={{
                border:
                  "1px solid rgba(255,255,255,.14)",
                background:
                  "rgba(255,255,255,.06)",
                color: "white",
              }}
            >
              Loglar
            </Link>
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Son Assignment Kayıtları
            </h2>

            <p>
              En yeni 100 lead-klinik eşleşmesi.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {assignments.length} kayıt
          </span>
        </div>

        {assignments.length ===
        0 ? (
          <div className="adminEmptyState">
            <strong>
              Assignment bulunmuyor
            </strong>

            <p>
              Yeni lead hareketleri oluştuğunda burada görüntülenecek.
            </p>
          </div>
        ) : (
          <div className="adminTableScroll">
            <table
              className="adminTable"
              style={{
                minWidth:
                  1150,
              }}
            >
              <thead>
                <tr>
                  <th>Hasta / Talep</th>
                  <th>Klinik</th>
                  <th>Erişim</th>
                  <th>Kredi</th>
                  <th>CRM Durumu</th>
                  <th>Lead Doluluk</th>
                  <th>Tarih</th>
                  <th>ID</th>
                </tr>
              </thead>

              <tbody>
                {assignments.map(
                  (
                    assignment
                  ) => (
                    <tr
                      key={
                        assignment.id
                      }
                    >
                      <td>
                        <div
                          style={{
                            color:
                              "#101828",
                            fontWeight:
                              800,
                          }}
                        >
                          {
                            assignment
                              .lead
                              .fullName
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              4,
                            display:
                              "flex",
                            gap: 5,
                            alignItems:
                              "center",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <span className="adminBadge adminBadgeInfo">
                            {
                              assignment
                                .lead
                                .city
                            }
                          </span>

                          <span
                            style={{
                              color:
                                "#667085",
                              fontSize:
                                8,
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              assignment
                                .lead
                                .service
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop:
                              4,
                            color:
                              "#98a2b3",
                            fontSize:
                              8,
                          }}
                        >
                          Kaynak:{" "}
                          {assignment
                            .lead
                            .source ??
                            "genel"}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            color:
                              "#344054",
                            fontWeight:
                              800,
                          }}
                        >
                          {
                            assignment
                              .clinic
                              .name
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              3,
                            color:
                              "#98a2b3",
                            fontSize:
                              8,
                          }}
                        >
                          {
                            assignment
                              .clinic
                              .email
                          }
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            assignment.unlocked
                              ? "adminBadge adminBadgeSuccess"
                              : "adminBadge adminBadgeWarning"
                          }
                        >
                          {assignment.unlocked
                            ? "Açık"
                            : "Kilitli"}
                        </span>

                        {assignment.unlockedAt ? (
                          <div
                            style={{
                              marginTop:
                                4,
                              color:
                                "#98a2b3",
                              fontSize:
                                8,
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatDate(
                              assignment.unlockedAt
                            )}
                          </div>
                        ) : null}
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              "#344054",
                          }}
                        >
                          {
                            assignment.unlockPrice
                          }{" "}
                          kredi
                        </strong>
                      </td>

                      <td>
                        <span className="adminBadge adminBadgeNeutral">
                          {
                            assignment.status
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            assignment
                              .lead
                              .unlockCount >=
                            3
                              ? "adminBadge adminBadgeSuccess"
                              : "adminBadge adminBadgeInfo"
                          }
                        >
                          {
                            assignment
                              .lead
                              .unlockCount
                          }
                          /3
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            color:
                              "#475467",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDate(
                            assignment.createdAt
                          )}
                        </span>
                      </td>

                      <td>
                        <div
                          title={
                            assignment.id
                          }
                          style={{
                            maxWidth:
                              125,
                            overflow:
                              "hidden",
                            color:
                              "#98a2b3",
                            fontFamily:
                              "monospace",
                            fontSize:
                              8,
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            assignment.id
                          }
                        </div>

                        <div
                          title={
                            assignment.leadId
                          }
                          style={{
                            marginTop:
                              3,
                            maxWidth:
                              125,
                            overflow:
                              "hidden",
                            color:
                              "#c0c5ce",
                            fontFamily:
                              "monospace",
                            fontSize:
                              7,
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          Lead:{" "}
                          {
                            assignment.leadId
                          }
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}