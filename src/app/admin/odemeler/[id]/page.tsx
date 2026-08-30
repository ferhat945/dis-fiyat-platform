import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

import BankTransferActions from "./BankTransferActions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDateTime(
  value: Date | null | undefined
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(
  amount: number,
  currency: string
): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function jsonText(
  value: unknown
): string {
  if (value == null) {
    return "Kayıt bulunmuyor.";
  }

  try {
    return JSON.stringify(
      value,
      null,
      2
    );
  } catch {
    return String(value);
  }
}

function providerLabel(
  provider: string | null
): string {
  if (
    provider === "bank_transfer"
  ) {
    return "Havale / EFT / FAST";
  }

  if (provider === "iyzico") {
    return "iyzico";
  }

  if (provider === "paytr") {
    return "PayTR";
  }

  return provider ?? "—";
}

function statusLabel(
  status: string
): string {
  if (
    status === "awaiting_transfer"
  ) {
    return "Havale bekleniyor";
  }

  if (
    status === "transfer_notified"
  ) {
    return "Ödeme bildirildi";
  }

  if (
    status === "processing_transfer"
  ) {
    return "Kontrol ediliyor";
  }

  if (
    status === "paid" ||
    status === "success" ||
    status === "completed"
  ) {
    return "Ödendi";
  }

  if (status === "canceled") {
    return "İptal edildi";
  }

  if (status === "failed") {
    return "Başarısız";
  }

  if (status === "started") {
    return "Başlatıldı";
  }

  return status;
}

function statusClass(
  status: string
): string {
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
    status === "canceled" ||
    status === "awaiting_transfer" ||
    status === "transfer_notified"
  ) {
    return "adminBadge adminBadgeWarning";
  }

  return "adminBadge adminBadgeInfo";
}

export default async function AdminPaymentDetailPage({
  params,
}: PageProps): Promise<JSX.Element> {
  await requireAdmin();

  const { id } =
    await params;

  const payment =
    await prisma.paymentLog.findUnique({
      where: {
        id,
      },

      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            creditBalance: true,
            isPremium: true,
            premiumStartedAt: true,
            premiumExpiresAt: true,
          },
        },

        creditTransactions: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!payment) {
    notFound();
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/odemeler"
          className="adminButton adminButtonSecondary"
        >
          ← Ödeme Kayıtları
        </Link>

        <span
          className={statusClass(
            payment.status
          )}
        >
          {statusLabel(
            payment.status
          )}
        </span>
      </div>

      <section
        className="adminCard"
        style={{
          border: 0,
          overflow: "hidden",
          color: "white",
          background:
            "linear-gradient(135deg,#101828 0%,#18233d 58%,#4338ca 150%)",
        }}
      >
        <div
          style={{
            padding: 28,
            display: "flex",
            justifyContent:
              "space-between",
            gap: 24,
            alignItems:
              "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display:
                  "inline-flex",
                padding:
                  "6px 9px",
                border:
                  "1px solid rgba(255,255,255,.12)",
                borderRadius: 999,
                background:
                  "rgba(255,255,255,.06)",
                color:
                  "rgba(255,255,255,.68)",
                fontSize: 9,
                fontWeight: 750,
              }}
            >
              ÖDEME VE TESLİMAT KANITI
            </div>

            <h1
              style={{
                margin:
                  "14px 0 0",
                fontSize:
                  "clamp(24px,4vw,36px)",
                lineHeight: 1.05,
                letterSpacing:
                  "-.045em",
                wordBreak:
                  "break-word",
              }}
            >
              {payment.orderNumber ??
                "Sipariş numarası yok"}
            </h1>

            <p
              style={{
                margin:
                  "9px 0 0",
                color:
                  "rgba(255,255,255,.58)",
                fontSize: 11,
                fontWeight: 650,
              }}
            >
              {payment.clinic.name}
            </p>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <div
              style={{
                color:
                  "rgba(255,255,255,.45)",
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              ÖDEME TUTARI
            </div>

            <div
              style={{
                marginTop: 5,
                fontSize: 29,
                fontWeight: 900,
                letterSpacing:
                  "-.045em",
              }}
            >
              {formatMoney(
                payment.amount,
                payment.currency
              )}
            </div>

            <div
              style={{
                marginTop: 5,
                color:
                  "rgba(255,255,255,.45)",
                fontSize: 9,
              }}
            >
              {providerLabel(
                payment.provider
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",
          gap: 10,
        }}
      >
        <Info
          label="Klinik"
          value={
            payment.clinic.name
          }
        />

        <Info
          label="E-posta"
          value={
            payment.clinic.email
          }
        />

        <Info
          label="Telefon"
          value={
            payment.clinic.phone ??
            "—"
          }
        />

        <Info
          label="Paket Kodu"
          value={
            payment.packageCode ??
            "—"
          }
        />

        <Info
          label="Paket Türü"
          value={payment.kind}
        />

        <Info
          label="Kredi"
          value={
            payment.credits != null
              ? `${payment.credits} kredi`
              : "—"
          }
        />

        <Info
          label="Ödeme Yöntemi"
          value={providerLabel(
            payment.provider
          )}
        />

        <Info
          label="Sağlayıcı Referansı"
          value={
            payment.providerRef ??
            "—"
          }
        />

        <Info
          label="Callback"
          value={
            payment.callbackVerified
              ? "Doğrulandı"
              : "Bekliyor"
          }
        />

        <Info
          label="Mevcut Kredi"
          value={`${payment.clinic.creditBalance} kredi`}
        />

        <Info
          label="Premium"
          value={
            payment.clinic.isPremium
              ? "Aktif"
              : "Pasif"
          }
        />

        <Info
          label="Sözleşme"
          value={
            payment.agreementVersion ??
            "—"
          }
        />
      </section>

      <BankTransferActions
        paymentId={payment.id}
        status={payment.status}
        provider={
          payment.provider
        }
        delivered={Boolean(
          payment.deliveredAt
        )}
      />

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              İşlem Zaman Çizelgesi
            </h2>

            <p>
              Ödeme ve dijital teslimat
              tarihlerinin özeti.
            </p>
          </div>
        </div>

        <div
          className="adminCardBody"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(210px,1fr))",
            gap: 10,
          }}
        >
          <TimelineItem
            label="Oluşturuldu"
            value={formatDateTime(
              payment.createdAt
            )}
          />

          <TimelineItem
            label="Ödendi"
            value={formatDateTime(
              payment.paidAt
            )}
          />

          <TimelineItem
            label="Teslim Edildi"
            value={formatDateTime(
              payment.deliveredAt
            )}
          />

          <TimelineItem
            label="Başarısız"
            value={formatDateTime(
              payment.failedAt
            )}
          />

          <TimelineItem
            label="İptal"
            value={formatDateTime(
              payment.canceledAt
            )}
          />

          <TimelineItem
            label="Sözleşme Kabul"
            value={formatDateTime(
              payment.agreementAcceptedAt
            )}
          />

          <TimelineItem
            label="Premium Başlangıç"
            value={formatDateTime(
              payment.premiumStartedAt
            )}
          />

          <TimelineItem
            label="Premium Bitiş"
            value={formatDateTime(
              payment.premiumExpiresAt
            )}
          />
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Sözleşme Onayları
            </h2>

            <p>
              Satın alma sırasında
              kullanıcıdan alınan
              elektronik onaylar.
            </p>
          </div>
        </div>

        <div
          className="adminCardBody"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 9,
          }}
        >
          <Approval
            accepted={
              payment.serviceAgreementAccepted
            }
            label="Dijital hizmet sözleşmesi"
          />

          <Approval
            accepted={
              payment.refundPolicyAccepted
            }
            label="Teslimat ve iade şartları"
          />

          <Approval
            accepted={
              payment.immediatePerformanceAccepted
            }
            label="Hizmetin hemen başlatılması"
          />

          <Approval
            accepted={
              payment.callbackVerified
            }
            label={
              payment.provider ===
              "bank_transfer"
                ? "Banka transferi admin doğrulaması"
                : "Ödeme kuruluşu doğrulaması"
            }
          />
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>
              Kredi Teslimat Hareketleri
            </h2>

            <p>
              Bu ödemeye bağlı kredi
              muhasebe kayıtları.
            </p>
          </div>

          <span className="adminBadge adminBadgeNeutral">
            {
              payment
                .creditTransactions
                .length
            }{" "}
            hareket
          </span>
        </div>

        {payment.creditTransactions
          .length === 0 ? (
          <div className="adminEmptyState">
            <strong>
              Kredi hareketi yok
            </strong>

            <p>
              Bu ödeme kaydına bağlı
              CreditTransaction
              bulunmuyor.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
            }}
          >
            {payment.creditTransactions.map(
              (
                transaction,
                index
              ) => (
                <div
                  key={
                    transaction.id
                  }
                  style={{
                    padding:
                      "14px 18px",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: 16,
                    alignItems:
                      "center",
                    borderBottom:
                      index ===
                      payment
                        .creditTransactions
                        .length -
                        1
                        ? 0
                        : "1px solid #f0f2f5",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        color:
                          "#101828",
                        fontSize: 10,
                      }}
                    >
                      {transaction.note ??
                        transaction.type}
                    </strong>

                    <div
                      style={{
                        marginTop: 4,
                        color:
                          "#98a2b3",
                        fontSize: 8,
                      }}
                    >
                      İşlem:{" "}
                      {formatDateTime(
                        transaction.createdAt
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 2,
                        color:
                          "#98a2b3",
                        fontSize: 8,
                      }}
                    >
                      Teslim:{" "}
                      {formatDateTime(
                        transaction.deliveredAt
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        "right",
                    }}
                  >
                    <strong
                      style={{
                        color:
                          transaction.amount >=
                          0
                            ? "#067647"
                            : "#b42318",
                        fontSize: 12,
                      }}
                    >
                      {transaction.amount >
                      0
                        ? `+${transaction.amount}`
                        : transaction.amount}{" "}
                      kredi
                    </strong>

                    <div
                      style={{
                        marginTop: 4,
                        color:
                          "#98a2b3",
                        fontSize: 8,
                      }}
                    >
                      {transaction.balanceBefore !=
                        null &&
                      transaction.balanceAfter !=
                        null
                        ? `${transaction.balanceBefore} → ${transaction.balanceAfter}`
                        : "Bakiye bilgisi yok"}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {payment.errorCode ||
      payment.errorMessage ? (
        <section
          className="adminCard"
          style={{
            border:
              "1px solid #fecdca",
            background:
              "#fef3f2",
          }}
        >
          <div className="adminCardHeader">
            <div>
              <h2
                style={{
                  color:
                    "#b42318",
                }}
              >
                Hata Bilgisi
              </h2>

              <p>
                Ödeme sırasında oluşan
                hata kayıtları.
              </p>
            </div>
          </div>

          <div className="adminCardBody">
            <div
              style={{
                color:
                  "#b42318",
                fontSize: 10,
                fontWeight: 750,
              }}
            >
              Kod:{" "}
              {payment.errorCode ??
                "—"}
            </div>

            <div
              style={{
                marginTop: 7,
                color:
                  "#7a271a",
                fontSize: 10,
                lineHeight: 1.6,
              }}
            >
              {payment.errorMessage ??
                "—"}
            </div>
          </div>
        </section>
      ) : null}

      <JsonSection
        title="Ödeme Başlangıç Kanıtı"
        value={
          payment.requestPayload
        }
      />

      <JsonSection
        title={
          payment.provider ===
          "bank_transfer"
            ? "Banka Transferi Bildirim / Onay Kanıtı"
            : "Ödeme Callback Kanıtı"
        }
        value={
          payment.callbackPayload
        }
      />

      <JsonSection
        title="Eski Payload Kaydı"
        value={payment.payload}
      />
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className="adminStatCard">
      <div className="adminStatLabel">
        {label}
      </div>

      <div
        style={{
          marginTop: 7,
          color: "#101828",
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1.5,
          wordBreak:
            "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  const available =
    value !== "—";

  return (
    <div
      style={{
        padding: 13,
        border:
          "1px solid #e7eaf0",
        borderRadius: 14,
        background:
          available
            ? "#fafbfc"
            : "#fcfcfd",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            flex: "0 0 7px",
            borderRadius: 999,
            background:
              available
                ? "#12b76a"
                : "#d0d5dd",
          }}
        />

        <strong
          style={{
            color:
              "#475467",
            fontSize: 9,
          }}
        >
          {label}
        </strong>
      </div>

      <div
        style={{
          marginTop: 7,
          color:
            available
              ? "#101828"
              : "#98a2b3",
          fontSize: 9,
          lineHeight: 1.55,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Approval({
  accepted,
  label,
}: {
  accepted: boolean;
  label: string;
}): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: 12,
        border: accepted
          ? "1px solid #abefc6"
          : "1px solid #eaecf0",
        borderRadius: 13,
        background: accepted
          ? "#ecfdf3"
          : "#f9fafb",
        color: accepted
          ? "#067647"
          : "#667085",
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          display: "grid",
          placeItems: "center",
          borderRadius: 8,
          background: accepted
            ? "#d1fadf"
            : "#eaecf0",
          fontSize: 10,
        }}
      >
        {accepted
          ? "✓"
          : "—"}
      </span>

      <strong
        style={{
          fontSize: 9,
        }}
      >
        {label}
      </strong>
    </div>
  );
}

function JsonSection({
  title,
  value,
}: {
  title: string;
  value: unknown;
}): JSX.Element {
  return (
    <section className="adminCard">
      <div className="adminCardHeader">
        <div>
          <h2>{title}</h2>

          <p>
            Teknik işlem kanıtı ve
            payload verisi.
          </p>
        </div>

        <span className="adminBadge adminBadgeNeutral">
          JSON
        </span>
      </div>

      <div className="adminCardBody">
        <pre
          style={{
            maxHeight: 520,
            overflow: "auto",
            margin: 0,
            padding: 15,
            borderRadius: 14,
            background:
              "#0b1020",
            color: "#d0d5dd",
            fontSize: 9,
            lineHeight: 1.7,
            whiteSpace:
              "pre-wrap",
            wordBreak:
              "break-word",
          }}
        >
          {jsonText(value)}
        </pre>
      </div>
    </section>
  );
}