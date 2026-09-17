"use client";

import {
  useMemo,
  useState,
} from "react";

type CreditTransactionRow = {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  balanceBefore: number | null;
  balanceAfter: number | null;
  deliveredAt: Date | string | null;
  createdAt: Date | string;
};

type ClinicRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  creditBalance: number;
  creditTransactions: CreditTransactionRow[];
  createdAt: Date | string;
};

type ClinicsRes = {
  ok: boolean;
  clinics?: ClinicRow[];
  code?: string;
};

type CreateRes = {
  ok: boolean;
  code?: string;
};

type PatchRes = {
  ok: boolean;
  clinic?: ClinicRow;
  code?: string;
};

type CreditAdjustRes =
  | {
      ok: true;
      clinic: {
        id: string;
        creditBalance: number;
      };
      transaction: CreditTransactionRow;
    }
  | {
      ok: false;
      code: string;
    };

type CreditAdjustMode =
  | "add"
  | "remove";

function formatDate(
  value: Date | string
): string {
  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function formatCreditType(type: string): string {
  const normalized = type.trim().toLowerCase();

  if (normalized === "purchase") {
    return "Paket yükleme";
  }

  if (normalized === "lead_unlock") {
    return "Lead satın alma";
  }

  if (normalized === "premium_monthly_credit") {
    return "Aylık kredi";
  }

  if (normalized === "refund") {
    return "Kredi iadesi";
  }

  if (normalized === "admin_adjustment") {
    return "Admin düzeltmesi";
  }

  return type || "Kredi hareketi";
}

function creditAmountLabel(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

function creditAdjustErrorLabel(
  code: string
): string {
  if (
    code ===
    "INSUFFICIENT_CREDIT_BALANCE"
  ) {
    return "Klinik bakiyesi bu kadar kredi düşmek için yetersiz.";
  }

  if (
    code ===
    "CREDIT_BALANCE_CHANGED_RETRY"
  ) {
    return "Kredi bakiyesi işlem sırasında değişti. Lütfen yenileyip tekrar dene.";
  }

  if (code === "CLINIC_NOT_FOUND") {
    return "Klinik bulunamadı.";
  }

  if (
    code ===
    "INVALID_CREDIT_ADJUSTMENT"
  ) {
    return "Kredi miktarı veya açıklama geçersiz. Miktar 1 veya daha büyük, açıklama en az 3 karakter olmalı.";
  }

  if (code === "UNAUTHORIZED_ADMIN") {
    return "Admin oturumu geçersiz. Lütfen yeniden giriş yap.";
  }

  return code || "CREDIT_ADJUSTMENT_FAILED";
}

export default function AdminClinicsClient({
  initialClinics,
}: {
  initialClinics: ClinicRow[];
}): JSX.Element {
  const [clinics, setClinics] =
    useState<ClinicRow[]>(
      initialClinics
    );

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<
      "all" | "active" | "passive"
    >("all");

  const [err, setErr] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [changingId, setChangingId] =
    useState<string | null>(null);

  const [creditModeByClinic, setCreditModeByClinic] =
    useState<Record<string, CreditAdjustMode>>({});

  const [creditAmountByClinic, setCreditAmountByClinic] =
    useState<Record<string, string>>({});

  const [creditNoteByClinic, setCreditNoteByClinic] =
    useState<Record<string, string>>({});

  const [creditChangingId, setCreditChangingId] =
    useState<string | null>(null);

  const filteredClinics =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLocaleLowerCase(
            "tr-TR"
          );

      return clinics.filter(
        (clinic) => {
          if (
            filter === "active" &&
            !clinic.isActive
          ) {
            return false;
          }

          if (
            filter === "passive" &&
            clinic.isActive
          ) {
            return false;
          }

          if (!q) {
            return true;
          }

          const haystack = [
            clinic.name,
            clinic.email,
            clinic.phone ?? "",
            clinic.id,
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
      clinics,
      search,
      filter,
    ]);

  async function refresh(): Promise<void> {
    const response =
      await fetch(
        "/api/admin/clinics",
        {
          cache: "no-store",
        }
      );

    const json =
      (await response.json()) as ClinicsRes;

    if (
      response.ok &&
      json.ok &&
      json.clinics
    ) {
      setClinics(
        json.clinics
      );

      return;
    }

    setErr(
      json.code ??
        "REFRESH_FAILED"
    );
  }

  async function createClinic(): Promise<void> {
    if (loading) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/admin/clinics",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              {
                name,
                email,
                phone:
                  phone ||
                  undefined,
                password,
              }
            ),
          }
        );

      const json =
        (await response.json()) as CreateRes;

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

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");

      setSuccess(
        "Klinik başarıyla oluşturuldu."
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

  async function toggleActive(
    id: string,
    next: boolean
  ): Promise<void> {
    if (changingId) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setChangingId(id);

    try {
      const response =
        await fetch(
          "/api/admin/clinics",
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
        (await response.json()) as PatchRes;

      if (
        !response.ok ||
        !json.ok ||
        !json.clinic
      ) {
        setErr(
          json.code ??
            "PATCH_FAILED"
        );

        return;
      }

      setClinics(
        (previous) =>
          previous.map(
            (clinic) =>
              clinic.id === id
                ? json.clinic!
                : clinic
          )
      );

      setSuccess(
        next
          ? "Klinik aktif hale getirildi."
          : "Klinik pasif hale getirildi."
      );
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setChangingId(null);
    }
  }

  async function adjustCredits(
    clinic: ClinicRow
  ): Promise<void> {
    if (creditChangingId) {
      return;
    }

    const mode =
      creditModeByClinic[clinic.id] ??
      "add";

    const amountText =
      creditAmountByClinic[clinic.id] ??
      "";

    const parsedAmount =
      Number(amountText);

    const note =
      (creditNoteByClinic[clinic.id] ??
        "").trim();

    if (
      !Number.isInteger(parsedAmount) ||
      parsedAmount <= 0 ||
      parsedAmount > 100000
    ) {
      setErr(
        "Kredi miktarı 1 ile 100000 arasında tam sayı olmalı."
      );
      setSuccess(null);
      return;
    }

    if (note.length < 3) {
      setErr(
        "Kredi düzeltmesi için en az 3 karakterlik açıklama zorunludur."
      );
      setSuccess(null);
      return;
    }

    const signedAmount =
      mode === "add"
        ? parsedAmount
        : -parsedAmount;

    const balanceAfter =
      clinic.creditBalance +
      signedAmount;

    if (balanceAfter < 0) {
      setErr(
        `${clinic.name} kliniğinin bakiyesi ${clinic.creditBalance}. ${parsedAmount} kredi düşülemez.`
      );
      setSuccess(null);
      return;
    }

    const confirmed =
      window.confirm(
        [
          `${clinic.name} için ${signedAmount > 0 ? "+" : ""}${signedAmount} kredi uygulanacak.`,
          `Mevcut bakiye: ${clinic.creditBalance}`,
          `Yeni bakiye: ${balanceAfter}`,
          `Açıklama: ${note}`,
          "",
          "İşlemi onaylıyor musun?",
        ].join("\n")
      );

    if (!confirmed) {
      return;
    }

    setErr(null);
    setSuccess(null);
    setCreditChangingId(clinic.id);

    try {
      const response =
        await fetch(
          `/api/admin/clinics/${encodeURIComponent(clinic.id)}/credits`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              amount: signedAmount,
              note,
            }),
          }
        );

      const json =
        (await response.json()) as CreditAdjustRes;

      if (!response.ok || !json.ok) {
        const code =
          "code" in json
            ? json.code
            : "CREDIT_ADJUSTMENT_FAILED";

        setErr(
          creditAdjustErrorLabel(code)
        );
        return;
      }

      setClinics((previous) =>
        previous.map((item) =>
          item.id === clinic.id
            ? {
                ...item,
                creditBalance:
                  json.clinic
                    .creditBalance,
                creditTransactions: [
                  json.transaction,
                  ...item.creditTransactions,
                ].slice(0, 20),
              }
            : item
        )
      );

      setCreditAmountByClinic(
        (previous) => ({
          ...previous,
          [clinic.id]: "",
        })
      );

      setCreditNoteByClinic(
        (previous) => ({
          ...previous,
          [clinic.id]: "",
        })
      );

      setSuccess(
        `${clinic.name}: ${signedAmount > 0 ? "+" : ""}${signedAmount} kredi uygulandı. Yeni bakiye ${json.clinic.creditBalance}.`
      );
    } catch (error) {
      setErr(
        error instanceof Error
          ? error.message
          : "NETWORK_ERROR"
      );
    } finally {
      setCreditChangingId(null);
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
            <h2>Yeni Klinik Ekle</h2>

            <p>
              Yeni klinik hesabını
              oluştur ve giriş
              bilgilerini tanımla.
            </p>
          </div>

          <span className="adminBadge adminBadgeInfo">
            Yeni Hesap
          </span>
        </div>

        <div className="adminCardBody">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(190px,1fr))",
              gap: 10,
            }}
          >
            <Field
              label="Klinik adı"
              required
            >
              <input
                className="adminInput"
                placeholder="Örn. Adana Dental"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
              />
            </Field>

            <Field
              label="E-posta"
              required
            >
              <input
                type="email"
                className="adminInput"
                placeholder="klinik@mail.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
              />
            </Field>

            <Field label="Telefon">
              <input
                className="adminInput"
                placeholder="05xx xxx xx xx"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
              />
            </Field>

            <Field
              label="Başlangıç şifresi"
              required
            >
              <input
                type="password"
                className="adminInput"
                placeholder="Minimum 8 karakter"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
              />
            </Field>
          </div>

          {err ? (
            <div
              style={{
                marginTop: 12,
                padding: 11,
                border:
                  "1px solid #fecdca",
                borderRadius: 11,
                background: "#fef3f2",
                color: "#b42318",
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              Hata: {err}
            </div>
          ) : null}

          {success ? (
            <div
              style={{
                marginTop: 12,
                padding: 11,
                border:
                  "1px solid #abefc6",
                borderRadius: 11,
                background: "#ecfdf3",
                color: "#067647",
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              {success}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 13,
              display: "flex",
              justifyContent:
                "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#98a2b3",
                fontSize: 9,
              }}
            >
              Klinik oluşturulduktan
              sonra kapsam tanımlaması
              yapabilirsin.
            </span>

            <button
              type="button"
              onClick={() =>
                void createClinic()
              }
              disabled={
                loading ||
                name.trim().length < 2 ||
                email.trim().length < 3 ||
                password.length < 8
              }
              className="adminButton adminButtonPrimary"
            >
              {loading
                ? "Oluşturuluyor..."
                : "Klinik Oluştur →"}
            </button>
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>Klinik Listesi</h2>

            <p>
              Klinik hesaplarını ara,
              filtrele ve aktiflik
              durumunu yönet.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {filteredClinics.length} kayıt
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
          <div
            style={{
              flex: "1 1 280px",
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
              placeholder="Klinik, e-posta, telefon veya ID ara..."
            />
          </div>

          <select
            className="adminSelect"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                  | "all"
                  | "active"
                  | "passive"
              )
            }
            style={{
              width: 160,
              maxWidth: "100%",
            }}
          >
            <option value="all">
              Tüm Klinikler
            </option>

            <option value="active">
              Aktif Klinikler
            </option>

            <option value="passive">
              Pasif Klinikler
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

        {filteredClinics.length ===
        0 ? (
          <div className="adminEmptyState">
            <strong>
              Klinik bulunamadı
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
                minWidth: 1260,
              }}
            >
              <thead>
                <tr>
                  <th>Klinik</th>
                  <th>İletişim</th>
                  <th>Kredi</th>
                  <th>Kredi Hareketleri</th>
                  <th>Kayıt Tarihi</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {filteredClinics.map(
                  (clinic) => (
                    <tr
                      key={clinic.id}
                    >
                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              flex: "0 0 34px",
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
                                11,
                              fontWeight:
                                850,
                            }}
                          >
                            {clinic.name
                              .trim()
                              .charAt(0)
                              .toLocaleUpperCase(
                                "tr-TR"
                              ) ||
                              "K"}
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <div
                              style={{
                                color:
                                  "#101828",
                                fontSize:
                                  10,
                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                clinic.name
                              }
                            </div>

                            <div
                              style={{
                                marginTop:
                                  3,
                                maxWidth:
                                  240,
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
                              title={
                                clinic.id
                              }
                            >
                              ID:{" "}
                              {
                                clinic.id
                              }
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            color:
                              "#344054",
                            fontWeight:
                              650,
                          }}
                        >
                          {
                            clinic.email
                          }
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            color:
                              "#98a2b3",
                            fontSize: 9,
                          }}
                        >
                          {clinic.phone ??
                            "Telefon yok"}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "grid",
                            gap: 6,
                            minWidth: 230,
                          }}
                        >
                          <span
                            className={
                              clinic.creditBalance > 0
                                ? "adminBadge adminBadgeSuccess"
                                : "adminBadge adminBadgeNeutral"
                            }
                            style={{
                              width: "fit-content",
                            }}
                          >
                            💎 {clinic.creditBalance} kredi
                          </span>

                          <span
                            style={{
                              color: "#98a2b3",
                              fontSize: 8,
                            }}
                          >
                            Güncel bakiye
                          </span>

                          <details>
                            <summary
                              style={{
                                cursor: "pointer",
                                color: "#5148e5",
                                fontSize: 9,
                                fontWeight: 800,
                                userSelect: "none",
                              }}
                            >
                              Kredi ekle / çıkar
                            </summary>

                            <div
                              style={{
                                marginTop: 8,
                                padding: 9,
                                display: "grid",
                                gap: 8,
                                border: "1px solid #e7eaf0",
                                borderRadius: 10,
                                background: "#fafbfc",
                              }}
                            >
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 6,
                                }}
                              >
                                <button
                                  type="button"
                                  className={
                                    (creditModeByClinic[clinic.id] ?? "add") === "add"
                                      ? "adminButton adminButtonPrimary"
                                      : "adminButton adminButtonSecondary"
                                  }
                                  onClick={() =>
                                    setCreditModeByClinic(
                                      (previous) => ({
                                        ...previous,
                                        [clinic.id]: "add",
                                      })
                                    )
                                  }
                                  disabled={
                                    creditChangingId === clinic.id
                                  }
                                  style={{
                                    minHeight: 34,
                                    padding: "6px 8px",
                                    fontSize: 8,
                                  }}
                                >
                                  + Kredi Ekle
                                </button>

                                <button
                                  type="button"
                                  className={
                                    (creditModeByClinic[clinic.id] ?? "add") === "remove"
                                      ? "adminButton adminButtonPrimary"
                                      : "adminButton adminButtonSecondary"
                                  }
                                  onClick={() =>
                                    setCreditModeByClinic(
                                      (previous) => ({
                                        ...previous,
                                        [clinic.id]: "remove",
                                      })
                                    )
                                  }
                                  disabled={
                                    creditChangingId === clinic.id
                                  }
                                  style={{
                                    minHeight: 34,
                                    padding: "6px 8px",
                                    fontSize: 8,
                                  }}
                                >
                                  − Kredi Düş
                                </button>
                              </div>

                              <input
                                type="number"
                                min={1}
                                max={100000}
                                step={1}
                                className="adminInput"
                                placeholder="Kredi miktarı (örn. 10)"
                                value={
                                  creditAmountByClinic[clinic.id] ?? ""
                                }
                                onChange={(event) =>
                                  setCreditAmountByClinic(
                                    (previous) => ({
                                      ...previous,
                                      [clinic.id]: event.target.value,
                                    })
                                  )
                                }
                                disabled={
                                  creditChangingId === clinic.id
                                }
                                style={{
                                  minHeight: 36,
                                }}
                              />

                              <input
                                className="adminInput"
                                placeholder="Açıklama zorunlu (Havale, Promosyon...)"
                                value={
                                  creditNoteByClinic[clinic.id] ?? ""
                                }
                                onChange={(event) =>
                                  setCreditNoteByClinic(
                                    (previous) => ({
                                      ...previous,
                                      [clinic.id]: event.target.value,
                                    })
                                  )
                                }
                                disabled={
                                  creditChangingId === clinic.id
                                }
                                maxLength={500}
                                style={{
                                  minHeight: 36,
                                }}
                              />

                              <div
                                style={{
                                  color: "#98a2b3",
                                  fontSize: 7,
                                  lineHeight: 1.5,
                                }}
                              >
                                İşlem CreditTransaction kaydına “admin_adjustment” olarak yazılır. Kredi düşümü bakiyeyi 0 ın altına indiremez.
                              </div>

                              <button
                                type="button"
                                className="adminButton adminButtonPrimary"
                                onClick={() =>
                                  void adjustCredits(clinic)
                                }
                                disabled={
                                  creditChangingId === clinic.id ||
                                  !(creditAmountByClinic[clinic.id] ?? "").trim() ||
                                  (creditNoteByClinic[clinic.id] ?? "").trim().length < 3
                                }
                                style={{
                                  minHeight: 36,
                                }}
                              >
                                {creditChangingId === clinic.id
                                  ? "İşleniyor..."
                                  : (creditModeByClinic[clinic.id] ?? "add") === "add"
                                    ? "Krediyi Ekle →"
                                    : "Krediyi Düş →"}
                              </button>
                            </div>
                          </details>
                        </div>
                      </td>

                      <td>
                        {clinic.creditTransactions.length === 0 ? (
                          <span
                            style={{
                              color: "#98a2b3",
                              fontSize: 9,
                            }}
                          >
                            Hareket yok
                          </span>
                        ) : (
                          <details>
                            <summary
                              style={{
                                cursor: "pointer",
                                color: "#5148e5",
                                fontSize: 9,
                                fontWeight: 800,
                                userSelect: "none",
                              }}
                            >
                              Son {clinic.creditTransactions.length} hareketi gör
                            </summary>

                            <div
                              style={{
                                marginTop: 8,
                                minWidth: 360,
                                display: "grid",
                                gap: 6,
                              }}
                            >
                              {clinic.creditTransactions.map((transaction) => (
                                <div
                                  key={transaction.id}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "105px 1fr 54px 64px",
                                    gap: 8,
                                    alignItems: "center",
                                    padding: "7px 8px",
                                    border: "1px solid #eef0f4",
                                    borderRadius: 9,
                                    background: "#fafbfc",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#667085",
                                      fontSize: 8,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {formatDate(transaction.createdAt)}
                                  </span>

                                  <div
                                    style={{
                                      minWidth: 0,
                                    }}
                                  >
                                    <div
                                      style={{
                                        color: "#344054",
                                        fontSize: 8,
                                        fontWeight: 800,
                                      }}
                                    >
                                      {formatCreditType(transaction.type)}
                                    </div>

                                    {transaction.note ? (
                                      <div
                                        title={transaction.note}
                                        style={{
                                          marginTop: 2,
                                          maxWidth: 180,
                                          overflow: "hidden",
                                          color: "#98a2b3",
                                          fontSize: 7,
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {transaction.note}
                                      </div>
                                    ) : null}
                                  </div>

                                  <strong
                                    style={{
                                      color:
                                        transaction.amount >= 0
                                          ? "#067647"
                                          : "#b42318",
                                      fontSize: 9,
                                      textAlign: "right",
                                    }}
                                  >
                                    {creditAmountLabel(transaction.amount)}
                                  </strong>

                                  <span
                                    style={{
                                      color: "#475467",
                                      fontSize: 8,
                                      fontWeight: 750,
                                      textAlign: "right",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {transaction.balanceAfter ?? "—"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </td>

                      <td>
                        {formatDate(
                          clinic.createdAt
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            clinic.isActive
                              ? "adminBadge adminBadgeSuccess"
                              : "adminBadge adminBadgeNeutral"
                          }
                        >
                          {clinic.isActive
                            ? "● Aktif"
                            : "Pasif"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          disabled={
                            changingId ===
                            clinic.id
                          }
                          onClick={() =>
                            void toggleActive(
                              clinic.id,
                              !clinic.isActive
                            )
                          }
                          className={
                            clinic.isActive
                              ? "adminButton adminButtonSecondary"
                              : "adminButton adminButtonPrimary"
                          }
                        >
                          {changingId ===
                          clinic.id
                            ? "İşleniyor..."
                            : clinic.isActive
                              ? "Pasife Al"
                              : "Aktif Et"}
                        </button>
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
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
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

        {required ? (
          <span
            style={{
              marginLeft: 3,
              color: "#f04438",
            }}
          >
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}