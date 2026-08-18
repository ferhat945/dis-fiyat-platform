import type { CSSProperties } from "react";
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

function jsonText(value: unknown): string {
  if (value == null) {
    return "Kayıt bulunmuyor.";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function providerLabel(provider: string | null): string {
  if (provider === "bank_transfer") {
    return "Havale / EFT / FAST";
  }

  if (provider === "iyzico") {
    return "iyzico";
  }

  return provider ?? "—";
}

function statusLabel(status: string): string {
  if (status === "awaiting_transfer") {
    return "Havale bekleniyor";
  }

  if (status === "transfer_notified") {
    return "Ödeme bildirildi";
  }

  if (status === "processing_transfer") {
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

export default async function AdminPaymentDetailPage({
  params,
}: PageProps): Promise<JSX.Element> {
  await requireAdmin();

  const { id } = await params;

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
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <Link
          href="/admin/odemeler"
          style={backStyle}
        >
          ← Ödeme Kayıtları
        </Link>

        <span style={statusStyle}>
          Durum: {statusLabel(payment.status)}
        </span>
      </div>

      <section style={heroStyle}>
        <div>
          <div style={kickerStyle}>
            🧾 Ödeme ve teslimat kanıtı
          </div>

          <h1 style={titleStyle}>
            {payment.orderNumber ??
              "Sipariş numarası yok"}
          </h1>

          <p style={heroTextStyle}>
            {payment.clinic.name} –{" "}
            {formatMoney(
              payment.amount,
              payment.currency
            )}
          </p>
        </div>
      </section>

      <section style={gridStyle}>
        <Info
          label="Klinik"
          value={payment.clinic.name}
        />

        <Info
          label="E-posta"
          value={payment.clinic.email}
        />

        <Info
          label="Telefon"
          value={payment.clinic.phone ?? "—"}
        />

        <Info
          label="Paket kodu"
          value={payment.packageCode ?? "—"}
        />

        <Info
          label="Paket türü"
          value={payment.kind}
        />

        <Info
          label="Kredi miktarı"
          value={
            payment.credits != null
              ? `${payment.credits} kredi`
              : "—"
          }
        />

        <Info
          label="Tutar"
          value={formatMoney(
            payment.amount,
            payment.currency
          )}
        />

        <Info
          label="Ödeme yöntemi"
          value={providerLabel(
            payment.provider
          )}
        />

        <Info
          label="Sağlayıcı referansı"
          value={payment.providerRef ?? "—"}
        />

        <Info
          label="Doğrulama durumu"
          value={
            payment.callbackVerified
              ? "Doğrulandı"
              : "Bekliyor"
          }
        />

        <Info
          label="Oluşturulma"
          value={formatDateTime(
            payment.createdAt
          )}
        />

        <Info
          label="Ödeme tarihi"
          value={formatDateTime(
            payment.paidAt
          )}
        />

        <Info
          label="Başarısızlık tarihi"
          value={formatDateTime(
            payment.failedAt
          )}
        />

        <Info
          label="İptal tarihi"
          value={formatDateTime(
            payment.canceledAt
          )}
        />

        <Info
          label="Teslim tarihi"
          value={formatDateTime(
            payment.deliveredAt
          )}
        />

        <Info
          label="Önceki bakiye"
          value={
            payment.balanceBefore != null
              ? `${payment.balanceBefore} kredi`
              : "—"
          }
        />

        <Info
          label="Sonraki bakiye"
          value={
            payment.balanceAfter != null
              ? `${payment.balanceAfter} kredi`
              : "—"
          }
        />

        <Info
          label="Premium başlangıç"
          value={formatDateTime(
            payment.premiumStartedAt
          )}
        />

        <Info
          label="Premium bitiş"
          value={formatDateTime(
            payment.premiumExpiresAt
          )}
        />

        <Info
          label="Sözleşme sürümü"
          value={
            payment.agreementVersion ?? "—"
          }
        />

        <Info
          label="Sözleşme kabul tarihi"
          value={formatDateTime(
            payment.agreementAcceptedAt
          )}
        />
      </section>

      <BankTransferActions
        paymentId={payment.id}
        status={payment.status}
        provider={payment.provider}
        delivered={Boolean(payment.deliveredAt)}
      />

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          Sözleşme Onayları
        </h2>

        <div style={approvalGridStyle}>
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
              payment
                .immediatePerformanceAccepted
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

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          Kredi Teslimat Hareketleri
        </h2>

        {payment.creditTransactions.length ===
        0 ? (
          <div style={emptyStyle}>
            Bu ödemeye bağlı kredi hareketi
            bulunmuyor.
          </div>
        ) : (
          <div style={movementListStyle}>
            {payment.creditTransactions.map(
              (transaction) => (
                <div
                  key={transaction.id}
                  style={movementRowStyle}
                >
                  <div>
                    <strong>
                      {transaction.note ??
                        transaction.type}
                    </strong>

                    <div style={smallStyle}>
                      İşlem:{" "}
                      {formatDateTime(
                        transaction.createdAt
                      )}
                    </div>

                    <div style={smallStyle}>
                      Teslim:{" "}
                      {formatDateTime(
                        transaction.deliveredAt
                      )}
                    </div>
                  </div>

                  <div style={rightStyle}>
                    <strong
                      style={{
                        color:
                          transaction.amount >= 0
                            ? "#15803d"
                            : "#b91c1c",
                      }}
                    >
                      {transaction.amount > 0
                        ? `+${transaction.amount}`
                        : transaction.amount}{" "}
                      kredi
                    </strong>

                    <div style={smallStyle}>
                      {transaction.balanceBefore !=
                        null &&
                      transaction.balanceAfter != null
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
        <section style={errorSectionStyle}>
          <h2 style={sectionTitleStyle}>
            Hata Bilgisi
          </h2>

          <div>
            <strong>Kod:</strong>{" "}
            {payment.errorCode ?? "—"}
          </div>

          <div style={{ marginTop: 7 }}>
            <strong>Açıklama:</strong>{" "}
            {payment.errorMessage ?? "—"}
          </div>
        </section>
      ) : null}

      <JsonSection
        title="Ödeme Başlangıç Kanıtı"
        value={payment.requestPayload}
      />

      <JsonSection
        title={
          payment.provider ===
          "bank_transfer"
            ? "Banka Transferi Bildirim / Onay Kanıtı"
            : "Ödeme Callback Kanıtı"
        }
        value={payment.callbackPayload}
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
    <div style={infoStyle}>
      <div style={infoLabelStyle}>
        {label}
      </div>

      <div style={infoValueStyle}>
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
        ...approvalStyle,
        background: accepted
          ? "rgba(34,197,94,.08)"
          : "rgba(15,23,42,.04)",
        color: accepted
          ? "#166534"
          : "#475569",
      }}
    >
      <span>
        {accepted ? "✅" : "➖"}
      </span>

      <strong>{label}</strong>
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
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>
        {title}
      </h2>

      <pre style={preStyle}>
        {jsonText(value)}
      </pre>
    </section>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 14,
};

const backStyle: CSSProperties = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 900,
};

const statusStyle: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(79,70,229,.09)",
  color: "#4338ca",
  fontSize: 12,
  fontWeight: 950,
};

const heroStyle: CSSProperties = {
  padding: 24,
  borderRadius: 26,
  color: "white",
  background:
    "linear-gradient(135deg,#0f172a,#4338ca)",
};

const kickerStyle: CSSProperties = {
  display: "inline-flex",
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,.10)",
  border:
    "1px solid rgba(255,255,255,.16)",
  fontSize: 12,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  margin: "13px 0 0",
  fontSize: 30,
  wordBreak: "break-all",
};

const heroTextStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "rgba(255,255,255,.78)",
  fontWeight: 800,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(210px,1fr))",
  gap: 10,
  marginTop: 16,
};

const infoStyle: CSSProperties = {
  padding: 13,
  borderRadius: 16,
  border:
    "1px solid rgba(15,23,42,.08)",
  background: "white",
};

const infoLabelStyle: CSSProperties = {
  color: "rgba(15,23,42,.56)",
  fontSize: 11,
  fontWeight: 850,
};

const infoValueStyle: CSSProperties = {
  marginTop: 4,
  fontSize: 13,
  fontWeight: 950,
  wordBreak: "break-word",
};

const sectionStyle: CSSProperties = {
  marginTop: 16,
  padding: 18,
  borderRadius: 20,
  border:
    "1px solid rgba(15,23,42,.08)",
  background: "white",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
};

const approvalGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 9,
  marginTop: 13,
};

const approvalStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: 12,
  borderRadius: 14,
};

const movementListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 13,
};

const movementRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
  padding: 13,
  borderRadius: 15,
  border:
    "1px solid rgba(15,23,42,.08)",
};

const smallStyle: CSSProperties = {
  marginTop: 3,
  color: "rgba(15,23,42,.58)",
  fontSize: 11,
  fontWeight: 750,
};

const rightStyle: CSSProperties = {
  textAlign: "right",
};

const emptyStyle: CSSProperties = {
  marginTop: 13,
  padding: 18,
  borderRadius: 14,
  background:
    "rgba(15,23,42,.04)",
  color:
    "rgba(15,23,42,.62)",
  textAlign: "center",
  fontWeight: 850,
};

const errorSectionStyle: CSSProperties = {
  ...sectionStyle,
  border:
    "1px solid rgba(239,68,68,.18)",
  background:
    "rgba(239,68,68,.06)",
  color: "#991b1b",
};

const preStyle: CSSProperties = {
  maxHeight: 520,
  overflow: "auto",
  margin: "13px 0 0",
  padding: 14,
  borderRadius: 14,
  background: "#0f172a",
  color: "#e2e8f0",
  fontSize: 11,
  lineHeight: 1.65,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};