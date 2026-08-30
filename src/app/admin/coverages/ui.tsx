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

type CoverageRow = {
  id: string;
  clinicId: string;
  city: string;
  service: string;
  isActive: boolean;

  clinic: {
    name: string;
  };
};

type ApiRes = {
  ok: boolean;
  code?: string;
  coverages?: CoverageRow[];
};

type FilterMode =
  | "all"
  | "active"
  | "passive";

export default function AdminCoveragesClient({
  initialClinics,
  initialCoverages,
}: {
  initialClinics: ClinicMini[];
  initialCoverages: CoverageRow[];
}): JSX.Element {
  const [
    coverages,
    setCoverages,
  ] = useState<CoverageRow[]>(
    initialCoverages
  );

  const clinics =
    useMemo(
      () =>
        initialClinics.filter(
          (clinic) =>
            clinic.isActive
        ),
      [initialClinics]
    );

  const [clinicId, setClinicId] =
    useState<string>(
      clinics[0]?.id ?? ""
    );

  const [city, setCity] =
    useState<string>(
      "istanbul"
    );

  const [service, setService] =
    useState<string>(
      "implant"
    );

  const [search, setSearch] =
    useState<string>("");

  const [filter, setFilter] =
    useState<FilterMode>("all");

  const [err, setErr] =
    useState<string | null>(
      null
    );

  const [success, setSuccess] =
    useState<string | null>(
      null
    );

  const [creating, setCreating] =
    useState<boolean>(false);

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(
    null
  );

  const filteredCoverages =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      return coverages.filter(
        (coverage) => {
          if (
            filter ===
              "active" &&
            !coverage.isActive
          ) {
            return false;
          }

          if (
            filter ===
              "passive" &&
            coverage.isActive
          ) {
            return false;
          }

          if (!q) {
            return true;
          }

          const haystack = [
            coverage.city,
            coverage.service,
            coverage.clinic.name,
            coverage.clinicId,
            coverage.id,
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
      coverages,
      search,
      filter,
    ]);

  async function refresh(): Promise<void> {
    const response =
      await fetch(
        "/api/admin/coverages",
        {
          cache: "no-store",
        }
      );

    const json =
      (await response.json()) as ApiRes;

    if (
      response.ok &&
      json.ok &&
      json.coverages
    ) {
      setCoverages(
        json.coverages
      );

      return;
    }

    setErr(
      json.code ??
        "REFRESH_FAILED"
    );
  }

  async function create(): Promise<void> {
    if (
      creating ||
      !clinicId ||
      city.trim().length < 2 ||
      service.trim().length <
        2
    ) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setCreating(true);

    try {
      const response =
        await fetch(
          "/api/admin/coverages",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                clinicId,
                city: city
                  .trim()
                  .toLocaleLowerCase(
                    "tr-TR"
                  ),
                service:
                  service
                    .trim()
                    .toLocaleLowerCase(
                      "tr-TR"
                    ),
                isActive: true,
              }
            ),
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
            "CREATE_FAILED"
        );

        return;
      }

      setSuccess(
        "Coverage başarıyla eklendi."
      );

      await refresh();
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setCreating(false);
    }
  }

  async function toggle(
    id: string,
    next: boolean
  ): Promise<void> {
    if (processingId) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setProcessingId(id);

    try {
      const response =
        await fetch(
          "/api/admin/coverages",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                id,
                isActive: next,
              }
            ),
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
            "PATCH_FAILED"
        );

        return;
      }

      await refresh();

      setSuccess(
        next
          ? "Coverage aktif edildi."
          : "Coverage pasif edildi."
      );
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function del(
    id: string
  ): Promise<void> {
    if (processingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Bu coverage kaydını silmek istediğine emin misin?"
      );

    if (!confirmed) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setProcessingId(id);

    try {
      const response =
        await fetch(
          "/api/admin/coverages",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id,
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
            "DELETE_FAILED"
        );

        return;
      }

      setCoverages(
        (previous) =>
          previous.filter(
            (coverage) =>
              coverage.id !== id
          )
      );

      setSuccess(
        "Coverage kaydı silindi."
      );
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setProcessingId(null);
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
              Yeni Coverage Tanımla
            </h2>

            <p>
              Bir kliniğin hangi şehir
              ve hizmetlerde lead
              görebileceğini belirle.
            </p>
          </div>

          <span className="adminBadge adminBadgeInfo">
            Şehir + Hizmet
          </span>
        </div>

        <div className="adminCardBody">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px,1.4fr) repeat(2,minmax(180px,1fr))",
              gap: 10,
            }}
          >
            <Field label="Klinik">
              <select
                className="adminSelect"
                value={clinicId}
                onChange={(event) =>
                  setClinicId(
                    event.target.value
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

            <Field label="Şehir">
              <input
                className="adminInput"
                value={city}
                onChange={(event) =>
                  setCity(
                    event.target.value
                  )
                }
                placeholder="adana"
              />
            </Field>

            <Field label="Hizmet">
              <input
                className="adminInput"
                value={service}
                onChange={(event) =>
                  setService(
                    event.target.value
                  )
                }
                placeholder="implant"
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
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                maxWidth: 600,
                color: "#98a2b3",
                fontSize: 9,
                lineHeight: 1.6,
              }}
            >
              Şehir ve hizmet adlarını
              mevcut sistemde kullanılan
              slug formatıyla gir.
            </span>

            <button
              type="button"
              className="adminButton adminButtonPrimary"
              disabled={
                creating ||
                !clinicId ||
                city.trim().length <
                  2 ||
                service.trim()
                  .length < 2
              }
              onClick={() =>
                void create()
              }
            >
              {creating
                ? "Ekleniyor..."
                : "Coverage Ekle →"}
            </button>
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Coverage Listesi
            </h2>

            <p>
              Tüm şehir, hizmet ve
              klinik eşleşmelerini
              yönet.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {
              filteredCoverages.length
            }{" "}
            kayıt
          </span>
        </div>

        <div
          style={{
            padding: "13px 16px",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            borderBottom:
              "1px solid #e7eaf0",
            background: "#fafbfc",
          }}
        >
          <input
            className="adminInput"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Şehir, hizmet, klinik veya ID ara..."
            style={{
              flex: "1 1 280px",
            }}
          />

          <select
            className="adminSelect"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target
                  .value as FilterMode
              )
            }
            style={{
              width: 150,
            }}
          >
            <option value="all">
              Tüm Kayıtlar
            </option>

            <option value="active">
              Aktif
            </option>

            <option value="passive">
              Pasif
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

        {filteredCoverages.length ===
        0 ? (
          <div className="adminEmptyState">
            <strong>
              Coverage bulunamadı
            </strong>

            <p>
              Arama veya filtre
              kriterlerine uygun kayıt
              bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="adminTableScroll">
            <table
              className="adminTable"
              style={{
                minWidth: 900,
              }}
            >
              <thead>
                <tr>
                  <th>Klinik</th>
                  <th>Şehir</th>
                  <th>Hizmet</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>

              <tbody>
                {filteredCoverages.map(
                  (coverage) => (
                    <tr
                      key={
                        coverage.id
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
                            coverage
                              .clinic
                              .name
                          }
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            maxWidth:
                              260,
                            color:
                              "#98a2b3",
                            fontSize:
                              8,
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                          title={
                            coverage.clinicId
                          }
                        >
                          Clinic ID:{" "}
                          {
                            coverage.clinicId
                          }
                        </div>
                      </td>

                      <td>
                        <span className="adminBadge adminBadgeInfo">
                          📍{" "}
                          {coverage.city}
                        </span>
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              "#344054",
                          }}
                        >
                          {
                            coverage.service
                          }
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            coverage.isActive
                              ? "adminBadge adminBadgeSuccess"
                              : "adminBadge adminBadgeNeutral"
                          }
                        >
                          {coverage.isActive
                            ? "● Aktif"
                            : "Pasif"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 7,
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            type="button"
                            disabled={
                              processingId ===
                              coverage.id
                            }
                            className={
                              coverage.isActive
                                ? "adminButton adminButtonSecondary"
                                : "adminButton adminButtonPrimary"
                            }
                            onClick={() =>
                              void toggle(
                                coverage.id,
                                !coverage.isActive
                              )
                            }
                          >
                            {processingId ===
                            coverage.id
                              ? "İşleniyor..."
                              : coverage.isActive
                                ? "Pasife Al"
                                : "Aktif Et"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              processingId ===
                              coverage.id
                            }
                            className="adminButton adminButtonDanger"
                            onClick={() =>
                              void del(
                                coverage.id
                              )
                            }
                          >
                            Sil
                          </button>
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
  tone: "success" | "error";
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