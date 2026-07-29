import type { CSSProperties } from "react";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDateTime(
  value: Date | null | undefined
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
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

function packageLabel(
  packageCode: string | null,
  kind: string
): string {
  if (packageCode === "credit_5") {
    return "5 Kredi";
  }

  if (packageCode === "credit_10") {
    return "10 Kredi";
  }

  if (packageCode === "credit_25") {
    return "25 Kredi";
  }

  if (
    packageCode === "premium" ||
    kind === "premium"
  ) {
    return "Premium";
  }

  return packageCode || kind || "—";
}

function statusLabel(status: string): string {
  if (
    status === "paid" ||
    status === "success" ||
    status === "completed"
  ) {
    return "Başarılı";
  }

  if (status === "started") {
    return "Başlatıldı";
  }

  if (status === "canceled") {
    return "İptal";
  }

  if (status === "failed") {
    return "Başarısız";
  }

  return status;
}

export default async function AdminPaymentsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const payments =
    await prisma.paymentLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 300,
      select: {
        id: true,
        packageCode: true,
        kind: true,
        credits: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        orderNumber: true,
        providerRef: true,
        callbackVerified: true,
        paidAt: true,
        deliveredAt: true,
        balanceBefore: true,
        balanceAfter: true,
        createdAt: true,

        clinic: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            creditTransactions: true,
          },
        },
      },
    });

  const successful = payments.filter(
    (payment) =>
      payment.status === "paid" ||
      payment.status === "success" ||
      payment.status === "completed"
  ).length;

  const delivered = payments.filter(
    (payment) => payment.deliveredAt
  ).length;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <div style={kickerStyle}>
            💳 Ödeme ve teslimat yönetimi
          </div>

          <h1 style={titleStyle}>
            Ödeme Kayıtları
          </h1>

          <p style={descriptionStyle}>
            Klinik ödeme denemeleri, başarılı
            işlemler ve dijital hizmet teslim
            kayıtları.
          </p>
        </div>

        <Link
          href="/admin/clinics"
          style={backButtonStyle}
        >
          Kliniklere Dön
        </Link>
      </div>

      <div style={metricsStyle}>
        <Metric
          label="Toplam kayıt"
          value={payments.length}
        />

        <Metric
          label="Başarılı ödeme"
          value={successful}
        />

        <Metric
          label="Teslim edilen"
          value={delivered}
        />

        <Metric
          label="Teslim bekleyen"
          value={Math.max(
            0,
            successful - delivered
          )}
        />
      </div>

      <div style={tableShellStyle}>
        {payments.length === 0 ? (
          <div style={emptyStyle}>
            Henüz ödeme kaydı bulunmuyor.
          </div>
        ) : (
          <div style={tableScrollStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Tarih</th>
                  <th style={thStyle}>Klinik</th>
                  <th style={thStyle}>Sipariş</th>
                  <th style={thStyle}>Paket</th>
                  <th style={thStyle}>Tutar</th>
                  <th style={thStyle}>Durum</th>
                  <th style={thStyle}>Teslimat</th>
                  <th style={thStyle}>Bakiye</th>
                  <th style={thStyle}>Detay</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={tdStyle}>
                      {formatDateTime(
                        payment.createdAt
                      )}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {payment.clinic.name}
                      </strong>

                      <div style={subTextStyle}>
                        {payment.clinic.email}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div style={orderStyle}>
                        {payment.orderNumber ?? "—"}
                      </div>

                      <div style={subTextStyle}>
                        {payment.providerRef ?? "—"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {packageLabel(
                        payment.packageCode,
                        payment.kind
                      )}

                      <div style={subTextStyle}>
                        {payment.credits != null
                          ? `${payment.credits} kredi`
                          : "—"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {formatMoney(
                          payment.amount,
                          payment.currency
                        )}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      <StatusBadge
                        status={payment.status}
                      />

                      <div style={subTextStyle}>
                        Callback:{" "}
                        {payment.callbackVerified
                          ? "Doğrulandı"
                          : "Bekliyor"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {payment.deliveredAt ? (
                        <>
                          <strong
                            style={{
                              color: "#15803d",
                            }}
                          >
                            Teslim edildi
                          </strong>

                          <div style={subTextStyle}>
                            {formatDateTime(
                              payment.deliveredAt
                            )}
                          </div>
                        </>
                      ) : (
                        <span
                          style={{
                            color: "#92400e",
                            fontWeight: 850,
                          }}
                        >
                          Teslim kaydı yok
                        </span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {payment.balanceBefore !=
                        null &&
                      payment.balanceAfter != null
                        ? `${payment.balanceBefore} → ${payment.balanceAfter}`
                        : "—"}

                      <div style={subTextStyle}>
                        {
                          payment._count
                            .creditTransactions
                        }{" "}
                        hareket
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <Link
                        href={`/admin/odemeler/${payment.id}`}
                        style={detailButtonStyle}
                      >
                        İncele →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}): JSX.Element {
  return (
    <div style={metricCardStyle}>
      <div style={metricLabelStyle}>
        {label}
      </div>

      <div style={metricValueStyle}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}): JSX.Element {
  const successful =
    status === "paid" ||
    status === "success" ||
    status === "completed";

  const failed = status === "failed";

  const canceled = status === "canceled";

  return (
    <span
      style={{
        ...statusStyle,
        color: successful
          ? "#166534"
          : failed
            ? "#b91c1c"
            : canceled
              ? "#92400e"
              : "#1d4ed8",
        background: successful
          ? "rgba(34,197,94,.10)"
          : failed
            ? "rgba(239,68,68,.10)"
            : canceled
              ? "rgba(245,158,11,.10)"
              : "rgba(59,130,246,.10)",
      }}
    >
      {statusLabel(status)}
    </span>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
};

const kickerStyle: CSSProperties = {
  display: "inline-flex",
  padding: "7px 10px",
  borderRadius: 999,
  background: "rgba(79,70,229,.08)",
  color: "#4338ca",
  fontSize: 12,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  margin: "10px 0 0",
  fontSize: 32,
  letterSpacing: "-0.035em",
};

const descriptionStyle: CSSProperties = {
  margin: "7px 0 0",
  color: "rgba(15,23,42,.62)",
  fontWeight: 750,
};

const backButtonStyle: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(15,23,42,.10)",
  color: "#111827",
  background: "white",
  textDecoration: "none",
  fontWeight: 900,
};

const metricsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginTop: 18,
};

const metricCardStyle: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,.08)",
  background: "white",
};

const metricLabelStyle: CSSProperties = {
  color: "rgba(15,23,42,.60)",
  fontSize: 12,
  fontWeight: 850,
};

const metricValueStyle: CSSProperties = {
  marginTop: 5,
  fontSize: 28,
  fontWeight: 1000,
};

const tableShellStyle: CSSProperties = {
  marginTop: 18,
  borderRadius: 20,
  border: "1px solid rgba(15,23,42,.08)",
  background: "white",
  overflow: "hidden",
};

const tableScrollStyle: CSSProperties = {
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1150,
};

const thStyle: CSSProperties = {
  padding: "12px 13px",
  textAlign: "left",
  background: "#f8fafc",
  borderBottom:
    "1px solid rgba(15,23,42,.08)",
  fontSize: 11,
  color: "rgba(15,23,42,.65)",
  fontWeight: 950,
};

const tdStyle: CSSProperties = {
  padding: "13px",
  borderBottom:
    "1px solid rgba(15,23,42,.07)",
  verticalAlign: "top",
  fontSize: 12,
};

const subTextStyle: CSSProperties = {
  marginTop: 3,
  color: "rgba(15,23,42,.55)",
  fontSize: 10,
  fontWeight: 750,
};

const orderStyle: CSSProperties = {
  maxWidth: 210,
  wordBreak: "break-all",
  fontWeight: 850,
};

const detailButtonStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 10px",
  borderRadius: 10,
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const statusStyle: CSSProperties = {
  display: "inline-flex",
  padding: "6px 9px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 950,
};

const emptyStyle: CSSProperties = {
  padding: 30,
  textAlign: "center",
  color: "rgba(15,23,42,.60)",
  fontWeight: 850,
};