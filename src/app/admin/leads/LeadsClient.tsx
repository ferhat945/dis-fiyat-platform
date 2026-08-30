"use client";

import {
  useMemo,
  useState,
} from "react";

type AssignedClinic = {
  id: string;
  name: string;
  email: string;
};

type Lead = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  intent: string;
  source: string | null;
  status: string;
  createdAt: string;
  assignedClinic: AssignedClinic | null;
};

type LeadsResp =
  | {
      ok: true;
      leads: Lead[];
    }
  | {
      ok: false;
      code: string;
    };

type FilterMode =
  | "all"
  | "assigned"
  | "unassigned";

function formatTR(
  value: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(date);
}

function formatStatus(
  status: string
): string {
  const normalized =
    status
      .trim()
      .toLowerCase();

  if (
    normalized === "new"
  ) {
    return "Yeni";
  }

  if (
    normalized === "contacted"
  ) {
    return "İletişime Geçildi";
  }

  if (
    normalized === "won"
  ) {
    return "Kazanıldı";
  }

  if (
    normalized === "lost"
  ) {
    return "Kaybedildi";
  }

  return status || "Yeni";
}

function statusClass(
  status: string
): string {
  const normalized =
    status
      .trim()
      .toLowerCase();

  if (
    normalized === "won"
  ) {
    return "adminBadge adminBadgeSuccess";
  }

  if (
    normalized === "lost"
  ) {
    return "adminBadge adminBadgeDanger";
  }

  if (
    normalized === "contacted"
  ) {
    return "adminBadge adminBadgeWarning";
  }

  return "adminBadge adminBadgeInfo";
}

function sourceLabel(
  source: string | null
): string {
  if (
    source ===
    "clinic_direct"
  ) {
    return "Klinik Direkt";
  }

  if (
    source ===
    "ai_analysis"
  ) {
    return "AI Analiz";
  }

  return source || "Genel Form";
}

function initials(
  name: string
): string {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    parts.length === 0
  ) {
    return "L";
  }

  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(0, 1)
      .toLocaleUpperCase(
        "tr-TR"
      );
  }

  return (
    `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`
  ).toLocaleUpperCase(
    "tr-TR"
  );
}

export default function LeadsClient(): JSX.Element {
  const [
    adminKey,
    setAdminKey,
  ] =
    useState<string>("");

  const [
    loading,
    setLoading,
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
    leads,
    setLeads,
  ] =
    useState<Lead[]>([]);

  const [
    q,
    setQ,
  ] =
    useState<string>("");

  const [
    filter,
    setFilter,
  ] =
    useState<FilterMode>(
      "all"
    );

  const [
    keyVisible,
    setKeyVisible,
  ] =
    useState<boolean>(
      false
    );

  async function load(): Promise<void> {
    if (
      !adminKey.trim()
    ) {
      setErr(
        "Admin key gir."
      );

      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const response =
        await fetch(
          "/api/admin/leads",
          {
            method: "GET",

            headers: {
              "x-admin-key":
                adminKey.trim(),
            },

            cache:
              "no-store",
          }
        );

      const json =
        (await response.json()) as LeadsResp;

      if (
        !response.ok ||
        !json.ok
      ) {
        setErr(
          json.ok
            ? "UNKNOWN"
            : json.code
        );

        setLeads([]);

        return;
      }

      setLeads(
        json.leads
      );
    } catch {
      setErr(
        "NETWORK_ERROR"
      );

      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    useMemo(() => {
      const search =
        q
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      return leads.filter(
        (lead) => {
          const assigned =
            Boolean(
              lead.assignedClinic
            );

          if (
            filter ===
              "assigned" &&
            !assigned
          ) {
            return false;
          }

          if (
            filter ===
              "unassigned" &&
            assigned
          ) {
            return false;
          }

          if (!search) {
            return true;
          }

          const haystack = [
            lead.city,
            lead.service,
            lead.fullName,
            lead.phone,
            lead.email ?? "",
            lead.message ?? "",
            lead.status,
            lead.intent,
            lead.source ?? "",
            lead.assignedClinic
              ?.name ?? "",
            lead.assignedClinic
              ?.email ?? "",
            lead.id,
          ]
            .join(" ")
            .toLocaleLowerCase(
              "tr-TR"
            );

          return haystack.includes(
            search
          );
        }
      );
    }, [
      leads,
      q,
      filter,
    ]);

  const assignedCount =
    useMemo(
      () =>
        leads.filter(
          (lead) =>
            Boolean(
              lead.assignedClinic
            )
        ).length,
      [leads]
    );

  const unassignedCount =
    Math.max(
      0,
      leads.length -
        assignedCount
    );

  const todayCount =
    useMemo(() => {
      const now =
        new Date();

      const start =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
          0
        );

      return leads.filter(
        (lead) => {
          const date =
            new Date(
              lead.createdAt
            );

          return (
            !Number.isNaN(
              date.getTime()
            ) &&
            date >= start
          );
        }
      ).length;
    }, [leads]);

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
            Yüklenen Lead
          </div>

          <div className="adminStatValue">
            {leads.length}
          </div>

          <div className="adminStatMeta">
            APIden yüklenen toplam kayıt
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Bugün
          </div>

          <div className="adminStatValue">
            {todayCount}
          </div>

          <div className="adminStatMeta">
            Bugün oluşturulan talepler
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Atanmış
          </div>

          <div className="adminStatValue">
            {assignedCount}
          </div>

          <div className="adminStatMeta">
            Klinik eşleşmesi bulunan
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Atanmamış
          </div>

          <div className="adminStatValue">
            {unassignedCount}
          </div>

          <div className="adminStatMeta">
            Klinik eşleşmesi bulunmayan
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Lead Verilerini Yükle
            </h2>

            <p>
              Admin API anahtarını kullanarak lead kayıtlarını getir.
            </p>
          </div>

          <span className="adminBadge adminBadgeInfo">
            Güvenli API
          </span>
        </div>

        <div className="adminCardBody">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(260px,1fr) auto",
              gap: 10,
              alignItems: "end",
            }}
          >
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
                ADMIN_KEY
              </span>

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <input
                  type={
                    keyVisible
                      ? "text"
                      : "password"
                  }
                  className="adminInput"
                  value={adminKey}
                  onChange={(
                    event
                  ) => {
                    setAdminKey(
                      event
                        .target
                        .value
                    );

                    if (err) {
                      setErr(null);
                    }
                  }}
                  placeholder="Admin API anahtarı"
                  style={{
                    paddingRight:
                      78,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setKeyVisible(
                      (value) =>
                        !value
                    )
                  }
                  style={{
                    position:
                      "absolute",
                    right: 6,
                    top: 6,
                    bottom: 6,
                    padding:
                      "0 9px",
                    border:
                      "1px solid #e7eaf0",
                    borderRadius:
                      8,
                    background:
                      "#f9fafb",
                    color:
                      "#667085",
                    fontSize: 8,
                    fontWeight:
                      750,
                    cursor:
                      "pointer",
                  }}
                >
                  {keyVisible
                    ? "Gizle"
                    : "Göster"}
                </button>
              </div>
            </label>

            <button
              type="button"
              onClick={() =>
                void load()
              }
              disabled={
                loading ||
                !adminKey.trim()
              }
              className="adminButton adminButtonPrimary"
              style={{
                minHeight: 42,
                paddingLeft: 17,
                paddingRight: 17,
              }}
            >
              {loading
                ? "Yükleniyor..."
                : "Leadleri Yükle →"}
            </button>
          </div>

          {err ? (
            <div
              style={{
                marginTop: 11,
                padding: 11,
                border:
                  "1px solid #fecdca",
                borderRadius: 11,
                background:
                  "#fef3f2",
                color:
                  "#b42318",
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              Hata: {err}
            </div>
          ) : null}
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Lead Yönetimi
            </h2>

            <p>
              Hasta taleplerini ara, filtrele ve detaylarını incele.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {filtered.length} /{" "}
            {leads.length}
          </span>
        </div>

        <div
          style={{
            padding:
              "13px 16px",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            borderBottom:
              "1px solid #e7eaf0",
            background:
              "#fafbfc",
          }}
        >
          <input
            className="adminInput"
            value={q}
            onChange={(
              event
            ) =>
              setQ(
                event.target
                  .value
              )
            }
            placeholder="İsim, telefon, şehir, hizmet, klinik veya ID ara..."
            style={{
              flex:
                "1 1 320px",
            }}
          />

          <select
            className="adminSelect"
            value={filter}
            onChange={(
              event
            ) =>
              setFilter(
                event.target
                  .value as FilterMode
              )
            }
            style={{
              width: 170,
            }}
          >
            <option value="all">
              Tüm Leadler
            </option>

            <option value="assigned">
              Atanmış
            </option>

            <option value="unassigned">
              Atanmamış
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            disabled={
              loading ||
              !adminKey.trim()
            }
            className="adminButton adminButtonSecondary"
          >
            Yenile
          </button>
        </div>

        {loading ? (
          <div className="adminEmptyState">
            <strong>
              Leadler yükleniyor
            </strong>

            <p>
              Kayıtlar sunucudan getiriliyor.
            </p>
          </div>
        ) : filtered.length ===
          0 ? (
          <div className="adminEmptyState">
            <strong>
              Lead bulunamadı
            </strong>

            <p>
              Önce leadleri yükleyebilir veya arama ve filtre kriterlerini değiştirebilirsin.
            </p>
          </div>
        ) : (
          <div
            className="adminTableScroll"
          >
            <table
              className="adminTable"
              style={{
                minWidth:
                  1180,
              }}
            >
              <thead>
                <tr>
                  <th>Hasta</th>
                  <th>Talep</th>
                  <th>İletişim</th>
                  <th>Kaynak</th>
                  <th>Durum</th>
                  <th>Klinik</th>
                  <th>Tarih</th>
                  <th>Lead ID</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(
                  (lead) => {
                    const assigned =
                      Boolean(
                        lead.assignedClinic
                      );

                    return (
                      <tr
                        key={
                          lead.id
                        }
                      >
                        <td>
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 10,
                              minWidth:
                                170,
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                flex:
                                  "0 0 34px",
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                borderRadius:
                                  10,
                                background:
                                  "#f0efff",
                                color:
                                  "#5148e5",
                                fontSize:
                                  10,
                                fontWeight:
                                  850,
                              }}
                            >
                              {initials(
                                lead.fullName
                              )}
                            </div>

                            <div>
                              <div
                                style={{
                                  color:
                                    "#101828",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {
                                  lead.fullName
                                }
                              </div>

                              {lead.message ? (
                                <div
                                  title={
                                    lead.message
                                  }
                                  style={{
                                    marginTop:
                                      3,
                                    maxWidth:
                                      220,
                                    overflow:
                                      "hidden",
                                    color:
                                      "#98a2b3",
                                    fontSize:
                                      8,
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {
                                    lead.message
                                  }
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div
                            style={{
                              display:
                                "grid",
                              gap: 4,
                            }}
                          >
                            <span className="adminBadge adminBadgeInfo">
                              {
                                lead.city
                              }
                            </span>

                            <strong
                              style={{
                                color:
                                  "#344054",
                                fontSize:
                                  9,
                              }}
                            >
                              {
                                lead.service
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          <div
                            style={{
                              color:
                                "#344054",
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              lead.phone
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
                            {lead.email ??
                              "E-posta yok"}
                          </div>
                        </td>

                        <td>
                          <span className="adminBadge adminBadgeNeutral">
                            {sourceLabel(
                              lead.source
                            )}
                          </span>

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
                            İstek:{" "}
                            {
                              lead.intent
                            }
                          </div>
                        </td>

                        <td>
                          <span
                            className={statusClass(
                              lead.status
                            )}
                          >
                            {formatStatus(
                              lead.status
                            )}
                          </span>
                        </td>

                        <td>
                          {assigned &&
                          lead.assignedClinic ? (
                            <div>
                              <span className="adminBadge adminBadgeSuccess">
                                Atandı
                              </span>

                              <div
                                style={{
                                  marginTop:
                                    5,
                                  color:
                                    "#344054",
                                  fontSize:
                                    9,
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  lead
                                    .assignedClinic
                                    .name
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    2,
                                  color:
                                    "#98a2b3",
                                  fontSize:
                                    8,
                                }}
                              >
                                {
                                  lead
                                    .assignedClinic
                                    .email
                                }
                              </div>
                            </div>
                          ) : (
                            <span className="adminBadge adminBadgeWarning">
                              Atanmadı
                            </span>
                          )}
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
                            {formatTR(
                              lead.createdAt
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            title={
                              lead.id
                            }
                            style={{
                              display:
                                "inline-block",
                              maxWidth:
                                130,
                              overflow:
                                "hidden",
                              color:
                                "#98a2b3",
                              fontSize:
                                8,
                              fontFamily:
                                "monospace",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {lead.id}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}