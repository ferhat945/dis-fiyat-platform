import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function norm(
  value: string | undefined
): string | null {
  const trimmed =
    (value ?? "").trim();

  return trimmed.length
    ? trimmed
    : null;
}

function formatDateTime(
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

function reasonLabel(
  reason: string
): string {
  if (
    reason ===
    "fcfs_marketplace_created"
  ) {
    return "FCFS Marketplace";
  }

  if (
    reason ===
    "direct_clinic_locked"
  ) {
    return "Direkt Klinik";
  }

  if (
    reason ===
    "direct_assignment_failed"
  ) {
    return "Direkt Atama Hatası";
  }

  return reason;
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    service?: string;
    reason?: string;
    assigned?: string;
  }>;
}): Promise<JSX.Element> {
  await requireAdmin();

  const params =
    await searchParams;

  const city =
    norm(params.city);

  const service =
    norm(params.service);

  const reason =
    norm(params.reason);

  const assignedRaw =
    norm(params.assigned);

  const assigned =
    assignedRaw === "true"
      ? true
      : assignedRaw === "false"
        ? false
        : null;

  const logs =
    await prisma.leadDistributionLog.findMany({
      where: {
        ...(city
          ? { city }
          : {}),

        ...(service
          ? { service }
          : {}),

        ...(reason
          ? { reason }
          : {}),

        ...(assigned !== null
          ? { assigned }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 300,

      select: {
        id: true,
        leadId: true,
        clinicId: true,
        city: true,
        service: true,
        assigned: true,
        reason: true,
        createdAt: true,

        clinic: {
          select: {
            name: true,
          },
        },
      },
    });

  const assignedCount =
    logs.filter(
      (log) =>
        log.assigned
    ).length;

  const notAssignedCount =
    logs.length -
    assignedCount;

  const marketplaceCount =
    logs.filter(
      (log) =>
        log.reason ===
        "fcfs_marketplace_created"
    ).length;

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
            Log Kaydı
          </div>

          <div className="adminStatValue">
            {logs.length}
          </div>

          <div className="adminStatMeta">
            Son 300 kayıt
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Assigned
          </div>

          <div className="adminStatValue">
            {assignedCount}
          </div>

          <div className="adminStatMeta">
            assigned=true
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Not Assigned
          </div>

          <div className="adminStatValue">
            {notAssignedCount}
          </div>

          <div className="adminStatMeta">
            assigned=false
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            FCFS Marketplace
          </div>

          <div className="adminStatValue">
            {marketplaceCount}
          </div>

          <div className="adminStatMeta">
            Marketplace oluşturma logları
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Log Filtreleri
            </h2>

            <p>
              Şehir, hizmet, neden ve
              assigned durumuna göre
              kayıtları daralt.
            </p>
          </div>

          <span className="adminBadge adminBadgeInfo">
            Sunucu Filtresi
          </span>
        </div>

        <form
          method="get"
          style={{
            padding: 16,
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 10,
            alignItems: "end",
          }}
        >
          <Field label="Şehir">
            <input
              name="city"
              defaultValue={
                city ?? ""
              }
              className="adminInput"
              placeholder="adana"
            />
          </Field>

          <Field label="Hizmet">
            <input
              name="service"
              defaultValue={
                service ?? ""
              }
              className="adminInput"
              placeholder="implant"
            />
          </Field>

          <Field label="Reason">
            <input
              name="reason"
              defaultValue={
                reason ?? ""
              }
              className="adminInput"
              placeholder="fcfs_marketplace_created"
            />
          </Field>

          <Field label="Assigned">
            <select
              name="assigned"
              defaultValue={
                assignedRaw ?? ""
              }
              className="adminSelect"
            >
              <option value="">
                Tümü
              </option>

              <option value="true">
                Assigned
              </option>

              <option value="false">
                Not Assigned
              </option>
            </select>
          </Field>

          <button
            type="submit"
            className="adminButton adminButtonPrimary"
            style={{
              minHeight: 42,
            }}
          >
            Filtrele →
          </button>
        </form>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Dağıtım Logları
            </h2>

            <p>
              FCFS, direct lead ve
              dağıtım hareketlerini
              incele.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {logs.length} kayıt
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="adminEmptyState">
            <strong>
              Log bulunamadı
            </strong>

            <p>
              Filtre kriterlerine uygun
              kayıt yok.
            </p>
          </div>
        ) : (
          <div className="adminTableScroll">
            <table
              className="adminTable"
              style={{
                minWidth: 1050,
              }}
            >
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Şehir</th>
                  <th>Hizmet</th>
                  <th>Durum</th>
                  <th>Reason</th>
                  <th>Klinik</th>
                  <th>Lead ID</th>
                  <th>Log ID</th>
                </tr>
              </thead>

              <tbody>
                {logs.map(
                  (log) => (
                    <tr
                      key={log.id}
                    >
                      <td>
                        <span
                          style={{
                            color:
                              "#475467",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatDateTime(
                            log.createdAt
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="adminBadge adminBadgeInfo">
                          {log.city}
                        </span>
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              "#344054",
                          }}
                        >
                          {log.service}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            log.assigned
                              ? "adminBadge adminBadgeSuccess"
                              : "adminBadge adminBadgeWarning"
                          }
                        >
                          {log.assigned
                            ? "Assigned"
                            : "Not Assigned"}
                        </span>
                      </td>

                      <td>
                        <span className="adminBadge adminBadgeNeutral">
                          {reasonLabel(
                            log.reason
                          )}
                        </span>

                        <div
                          style={{
                            marginTop: 4,
                            color:
                              "#98a2b3",
                            fontSize: 8,
                          }}
                        >
                          {log.reason}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            color:
                              "#344054",
                            fontWeight:
                              750,
                          }}
                        >
                          {log.clinic
                            ?.name ??
                            "—"}
                        </div>

                        {log.clinicId ? (
                          <div
                            style={{
                              marginTop: 3,
                              maxWidth:
                                180,
                              overflow:
                                "hidden",
                              color:
                                "#98a2b3",
                              fontFamily:
                                "monospace",
                              fontSize: 7,
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                            title={
                              log.clinicId
                            }
                          >
                            {
                              log.clinicId
                            }
                          </div>
                        ) : null}
                      </td>

                      <td>
                        <MonoText
                          value={
                            log.leadId
                          }
                        />
                      </td>

                      <td>
                        <MonoText
                          value={log.id}
                        />
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label
      style={{
        display: "grid",
        gap: 6,
      }}
    >
      <span
        style={{
          color: "#475467",
          fontSize: 9,
          fontWeight: 750,
        }}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

function MonoText({
  value,
}: {
  value: string;
}): JSX.Element {
  return (
    <span
      title={value}
      style={{
        display: "inline-block",
        maxWidth: 150,
        overflow: "hidden",
        color: "#98a2b3",
        fontFamily:
          "monospace",
        fontSize: 8,
        textOverflow:
          "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}