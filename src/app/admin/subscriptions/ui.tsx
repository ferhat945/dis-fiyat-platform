"use client";

import {
  useMemo,
  useState,
} from "react";

type ClinicMini = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type SubRow = {
  id: string;
  clinicId: string;
  status: string;
  quotaTotal: number;
  quotaUsed: number;
  startedAt: Date;
  expiresAt: Date;

  clinic: {
    name: string;
    email: string;
  };
};

type FilterMode =
  | "all"
  | "active"
  | "expired";

function jsonHeaders(): HeadersInit {
  return {
    "Content-Type":
      "application/json",
  };
}

function formatDate(
  value: Date
): string {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "short",
    }
  ).format(
    new Date(value)
  );
}

function statusClass(
  status: string
): string {
  if (
    status === "active"
  ) {
    return "adminBadge adminBadgeSuccess";
  }

  if (
    status === "expired"
  ) {
    return "adminBadge adminBadgeDanger";
  }

  return "adminBadge adminBadgeNeutral";
}

export default function AdminSubscriptionsClient({
  initialClinics,
  initialSubs,
}: {
  initialClinics: ClinicMini[];
  initialSubs: SubRow[];
}): JSX.Element {
  const clinics =
    useMemo(
      () =>
        initialClinics.filter(
          (clinic) =>
            clinic.isActive
        ),
      [initialClinics]
    );

  const [
    subs,
    setSubs,
  ] =
    useState<SubRow[]>(
      initialSubs
    );

  const [
    clinicId,
    setClinicId,
  ] =
    useState<string>(
      clinics[0]?.id ?? ""
    );

  const [
    quotaAdd,
    setQuotaAdd,
  ] =
    useState<number>(10);

  const [
    days,
    setDays,
  ] =
    useState<number>(30);

  const [
    search,
    setSearch,
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
    err,
    setErr,
  ] =
    useState<string | null>(
      null
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      false
    );

  const filteredSubs =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      return subs.filter(
        (sub) => {
          if (
            filter ===
              "active" &&
            sub.status !==
              "active"
          ) {
            return false;
          }

          if (
            filter ===
              "expired" &&
            sub.status !==
              "expired"
          ) {
            return false;
          }

          if (!q) {
            return true;
          }

          const haystack = [
            sub.clinic.name,
            sub.clinic.email,
            sub.status,
            sub.id,
            sub.clinicId,
          ]
            .join(" ")
            .toLocaleLowerCase(
              "tr-TR"
            );

          return haystack.includes(
            q
          );
        }
      );
    }, [
      subs,
      search,
      filter,
    ]);

  async function refresh(): Promise<void> {
    const response =
      await fetch(
        "/api/admin/subscriptions",
        {
          cache:
            "no-store",
        }
      );

    const json =
      (await response.json()) as {
        ok: boolean;
        subscriptions?: SubRow[];
        code?: string;
      };

    if (
      !response.ok ||
      !json.ok
    ) {
      setErr(
        json.code ??
          `REFRESH_FAILED_HTTP_${response.status}`
      );

      return;
    }

    if (
      json.subscriptions
    ) {
      setSubs(
        json.subscriptions
      );
    }
  }

  async function grant(): Promise<void> {
    if (
      loading ||
      !clinicId ||
      quotaAdd < 1 ||
      days < 1
    ) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/subscriptions",
          {
            method: "POST",
            headers:
              jsonHeaders(),

            body:
              JSON.stringify({
                clinicId,
                quotaAdd,
                days,
              }),
          }
        );

      const json =
        (await response.json()) as {
          ok: boolean;
          code?: string;
        };

      if (
        !response.ok ||
        !json.ok
      ) {
        setErr(
          json.code ??
            `GRANT_FAILED_HTTP_${response.status}`
        );

        return;
      }

      setSuccess(
        "Kota başarıyla tanımlandı."
      );

      await refresh();
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Manuel Kota Tanımla
            </h2>

            <p>
              Bir kliniğe belirli süre
              için yeni kota ekle.
            </p>
          </div>

          <span className="adminBadge adminBadgeInfo">
            Admin İşlemi
          </span>
        </div>

        <div className="adminCardBody">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(240px,1.6fr) repeat(2,minmax(150px,.7fr))",
              gap: 10,
            }}
          >
            <Field label="Klinik">
              <select
                className="adminSelect"
                value={clinicId}
                onChange={(
                  event
                ) =>
                  setClinicId(
                    event.target
                      .value
                  )
                }
              >
                {clinics.length ===
                0 ? (
                  <option value="">
                    Aktif klinik yok
                  </option>
                ) : (
                  clinics.map(
                    (clinic) => (
                      <option
                        key={
                          clinic.id
                        }
                        value={
                          clinic.id
                        }
                      >
                        {
                          clinic.name
                        }{" "}
                        (
                        {
                          clinic.email
                        }
                        )
                      </option>
                    )
                  )
                )}
              </select>
            </Field>

            <Field label="Kota">
              <input
                type="number"
                min={1}
                className="adminInput"
                value={quotaAdd}
                onChange={(
                  event
                ) =>
                  setQuotaAdd(
                    Number(
                      event
                        .target
                        .value
                    )
                  )
                }
              />
            </Field>

            <Field label="Süre (gün)">
              <input
                type="number"
                min={1}
                className="adminInput"
                value={days}
                onChange={(
                  event
                ) =>
                  setDays(
                    Number(
                      event
                        .target
                        .value
                    )
                  )
                }
              />
            </Field>
          </div>

          {err ? (
            <Message
              tone="error"
              text={`Hata: ${err}`}
            />
          ) : null}

          {success ? (
            <Message
              tone="success"
              text={success}
            />
          ) : null}

          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent:
                "space-between",
              gap: 12,
              alignItems:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            <span
              style={{
                color: "#98a2b3",
                fontSize: 9,
                lineHeight: 1.6,
              }}
            >
              Bu işlem mevcut admin
              subscription API akışını
              kullanır.
            </span>

            <button
              type="button"
              onClick={() =>
                void grant()
              }
              disabled={
                loading ||
                !clinicId ||
                quotaAdd < 1 ||
                days < 1
              }
              className="adminButton adminButtonPrimary"
            >
              {loading
                ? "Tanımlanıyor..."
                : "Kota Tanımla →"}
            </button>
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Abonelik Kayıtları
            </h2>

            <p>
              Son abonelik ve kota
              hareketlerini takip et.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {filteredSubs.length} kayıt
          </span>
        </div>

        <div
          style={{
            padding: "13px 16px",
            display: "flex",
            gap: 10,
            flexWrap:
              "wrap",
            borderBottom:
              "1px solid #e7eaf0",
            background:
              "#fafbfc",
          }}
        >
          <input
            className="adminInput"
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Klinik, e-posta, durum veya ID ara..."
            style={{
              flex:
                "1 1 300px",
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
              width: 160,
            }}
          >
            <option value="all">
              Tüm Kayıtlar
            </option>

            <option value="active">
              Aktif
            </option>

            <option value="expired">
              Süresi Dolmuş
            </option>
          </select>

          <button
            type="button"
            className="adminButton adminButtonSecondary"
            onClick={() =>
              void refresh()
            }
          >
            Yenile
          </button>
        </div>

        {filteredSubs.length ===
        0 ? (
          <div className="adminEmptyState">
            <strong>
              Abonelik bulunamadı
            </strong>

            <p>
              Filtreye uygun abonelik
              kaydı bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="adminTableScroll">
            <table
              className="adminTable"
              style={{
                minWidth: 1000,
              }}
            >
              <thead>
                <tr>
                  <th>Klinik</th>
                  <th>Durum</th>
                  <th>Kullanılan</th>
                  <th>Toplam</th>
                  <th>Kalan</th>
                  <th>Kullanım</th>
                  <th>Başlangıç</th>
                  <th>Bitiş</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubs.map(
                  (sub) => {
                    const remaining =
                      Math.max(
                        0,
                        sub.quotaTotal -
                          sub.quotaUsed
                      );

                    const percent =
                      sub.quotaTotal >
                      0
                        ? Math.min(
                            100,
                            Math.round(
                              (sub.quotaUsed /
                                sub.quotaTotal) *
                                100
                            )
                          )
                        : 0;

                    return (
                      <tr
                        key={
                          sub.id
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
                              sub.clinic
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
                              sub.clinic
                                .email
                            }
                          </div>
                        </td>

                        <td>
                          <span
                            className={statusClass(
                              sub.status
                            )}
                          >
                            {
                              sub.status
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            {
                              sub.quotaUsed
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            sub.quotaTotal
                          }
                        </td>

                        <td>
                          <span
                            className={
                              remaining >
                              0
                                ? "adminBadge adminBadgeSuccess"
                                : "adminBadge adminBadgeDanger"
                            }
                          >
                            {
                              remaining
                            }
                          </span>
                        </td>

                        <td>
                          <div
                            style={{
                              minWidth:
                                130,
                            }}
                          >
                            <div
                              style={{
                                height: 6,
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
                                  width: `${percent}%`,
                                  height:
                                    "100%",
                                  borderRadius:
                                    999,
                                  background:
                                    percent >=
                                    90
                                      ? "#f04438"
                                      : percent >=
                                          65
                                        ? "#f79009"
                                        : "#12b76a",
                                }}
                              />
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
                              {
                                percent
                              }
                              %
                            </div>
                          </div>
                        </td>

                        <td>
                          {formatDate(
                            sub.startedAt
                          )}
                        </td>

                        <td>
                          {formatDate(
                            sub.expiresAt
                          )}
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

function Message({
  tone,
  text,
}: {
  tone:
    | "success"
    | "error";
  text: string;
}): JSX.Element {
  const success =
    tone === "success";

  return (
    <div
      style={{
        marginTop: 12,
        padding: 11,
        border: success
          ? "1px solid #abefc6"
          : "1px solid #fecdca",
        borderRadius: 11,
        background: success
          ? "#ecfdf3"
          : "#fef3f2",
        color: success
          ? "#067647"
          : "#b42318",
        fontSize: 10,
        fontWeight: 750,
      }}
    >
      {text}
    </div>
  );
}