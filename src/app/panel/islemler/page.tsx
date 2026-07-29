import type { CSSProperties } from "react";
import Link from "next/link";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatDateTime(
  value: Date | null | undefined
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
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
    return "5 Kredi Paketi";
  }

  if (packageCode === "credit_10") {
    return "10 Kredi Paketi";
  }

  if (packageCode === "credit_25") {
    return "25 Kredi Paketi";
  }

  if (
    packageCode === "premium" ||
    kind === "premium"
  ) {
    return "Premium Üyelik";
  }

  return packageCode || kind || "Dijital hizmet";
}

function statusInfo(status: string): {
  label: string;
  background: string;
  color: string;
  border: string;
} {
  if (
    status === "paid" ||
    status === "success" ||
    status === "completed"
  ) {
    return {
      label: "Başarılı",
      background: "rgba(34,197,94,0.10)",
      color: "#166534",
      border: "rgba(34,197,94,0.24)",
    };
  }

  if (status === "started") {
    return {
      label: "Başlatıldı",
      background: "rgba(59,130,246,0.10)",
      color: "#1d4ed8",
      border: "rgba(59,130,246,0.24)",
    };
  }

  if (status === "canceled") {
    return {
      label: "İptal Edildi",
      background: "rgba(245,158,11,0.10)",
      color: "#92400e",
      border: "rgba(245,158,11,0.26)",
    };
  }

  if (status === "failed") {
    return {
      label: "Başarısız",
      background: "rgba(239,68,68,0.10)",
      color: "#b91c1c",
      border: "rgba(239,68,68,0.24)",
    };
  }

  return {
    label: status,
    background: "rgba(15,23,42,0.06)",
    color: "#334155",
    border: "rgba(15,23,42,0.12)",
  };
}

export default async function ClinicTransactionsPage(): Promise<JSX.Element> {
  const token =
    (await cookies()).get("clinic_session")
      ?.value ?? "";

  const session = token
    ? await verifyClinicSession(token)
    : null;

  if (!session) {
    return (
      <div style={pageStyle}>
        <h1 style={{ margin: 0 }}>
          Yetkisiz erişim
        </h1>

        <p>
          İşlem geçmişini görüntülemek için
          giriş yapmalısın.
        </p>

        <Link href="/login" style={primaryLinkStyle}>
          Giriş Yap →
        </Link>
      </div>
    );
  }

  const [payments, creditTransactions] =
    await Promise.all([
      prisma.paymentLog.findMany({
        where: {
          clinicId: session.clinicId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
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

          serviceAgreementAccepted: true,
          refundPolicyAccepted: true,
          immediatePerformanceAccepted: true,
          agreementVersion: true,
          agreementAcceptedAt: true,

          paidAt: true,
          failedAt: true,
          canceledAt: true,

          deliveredAt: true,
          balanceBefore: true,
          balanceAfter: true,
          premiumStartedAt: true,
          premiumExpiresAt: true,

          errorCode: true,
          errorMessage: true,

          createdAt: true,
          updatedAt: true,

          creditTransactions: {
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              amount: true,
              type: true,
              note: true,
              balanceBefore: true,
              balanceAfter: true,
              deliveredAt: true,
              createdAt: true,
            },
          },
        },
      }),

      prisma.creditTransaction.findMany({
        where: {
          clinicId: session.clinicId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        select: {
          id: true,
          paymentLogId: true,
          amount: true,
          type: true,
          note: true,
          balanceBefore: true,
          balanceAfter: true,
          deliveredAt: true,
          createdAt: true,
        },
      }),
    ]);

  const successfulPayments = payments.filter(
    (payment) =>
      payment.status === "paid" ||
      payment.status === "success" ||
      payment.status === "completed"
  ).length;

  const deliveredPayments = payments.filter(
    (payment) => payment.deliveredAt
  ).length;

  const totalPurchasedCredits =
    creditTransactions
      .filter(
        (transaction) =>
          transaction.amount > 0 &&
          (
            transaction.type === "purchase" ||
            transaction.type ===
              "premium_monthly_credit"
          )
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0
      );

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={kickerStyle}>
            📜 Şeffaf işlem kayıtları
          </div>

          <h1 style={heroTitleStyle}>
            İşlem ve Teslimat Geçmişi
          </h1>

          <p style={heroTextStyle}>
            Satın alma işlemlerini, ödeme
            durumlarını, sözleşme onaylarını ve
            hesabına tanımlanan dijital hakları
            buradan takip edebilirsin.
          </p>
        </div>

        <Link
          href="/panel/abonelik"
          style={heroButtonStyle}
        >
          Kredi ve Premium →
        </Link>
      </section>

      <section style={metricGridStyle}>
        <article style={metricCardStyle}>
          <div style={metricLabelStyle}>
            Toplam ödeme kaydı
          </div>

          <div style={metricValueStyle}>
            {payments.length}
          </div>
        </article>

        <article style={metricCardStyle}>
          <div style={metricLabelStyle}>
            Başarılı ödeme
          </div>

          <div style={metricValueStyle}>
            {successfulPayments}
          </div>
        </article>

        <article style={metricCardStyle}>
          <div style={metricLabelStyle}>
            Teslim edilen işlem
          </div>

          <div style={metricValueStyle}>
            {deliveredPayments}
          </div>
        </article>

        <article style={metricCardStyle}>
          <div style={metricLabelStyle}>
            Satın alınan kredi
          </div>

          <div style={metricValueStyle}>
            {totalPurchasedCredits}
          </div>
        </article>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingRowStyle}>
          <div>
            <h2 style={sectionTitleStyle}>
              Ödeme Geçmişi
            </h2>

            <p style={sectionDescriptionStyle}>
              Son 100 ödeme denemesi ve satın alma
              işlemi.
            </p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div style={emptyStyle}>
            Henüz ödeme kaydı bulunmuyor.
          </div>
        ) : (
          <div style={listStyle}>
            {payments.map((payment) => {
              const status =
                statusInfo(payment.status);

              const deliveryCompleted =
                Boolean(payment.deliveredAt);

              return (
                <article
                  key={payment.id}
                  style={paymentCardStyle}
                >
                  <div style={paymentHeaderStyle}>
                    <div>
                      <div style={packageTitleStyle}>
                        {packageLabel(
                          payment.packageCode,
                          payment.kind
                        )}
                      </div>

                      <div style={orderNumberStyle}>
                        Sipariş no:{" "}
                        {payment.orderNumber ?? "—"}
                      </div>
                    </div>

                    <div style={headerRightStyle}>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          background:
                            status.background,
                          color: status.color,
                          borderColor:
                            status.border,
                        }}
                      >
                        {status.label}
                      </span>

                      <strong style={amountStyle}>
                        {formatMoney(
                          payment.amount,
                          payment.currency
                        )}
                      </strong>
                    </div>
                  </div>

                  <div style={detailGridStyle}>
                    <Detail
                      label="İşlem oluşturma"
                      value={formatDateTime(
                        payment.createdAt
                      )}
                    />

                    <Detail
                      label="Ödeme tarihi"
                      value={formatDateTime(
                        payment.paidAt
                      )}
                    />

                    <Detail
                      label="Teslim tarihi"
                      value={formatDateTime(
                        payment.deliveredAt
                      )}
                    />

                    <Detail
                      label="Ödeme sağlayıcı"
                      value={
                        payment.provider ??
                        "iyzico"
                      }
                    />

                    <Detail
                      label="Ödeme referansı"
                      value={
                        payment.providerRef ?? "—"
                      }
                    />

                    <Detail
                      label="Kredi miktarı"
                      value={
                        payment.credits != null
                          ? `${payment.credits} kredi`
                          : "—"
                      }
                    />

                    <Detail
                      label="Önceki bakiye"
                      value={
                        payment.balanceBefore != null
                          ? `${payment.balanceBefore} kredi`
                          : "—"
                      }
                    />

                    <Detail
                      label="Sonraki bakiye"
                      value={
                        payment.balanceAfter != null
                          ? `${payment.balanceAfter} kredi`
                          : "—"
                      }
                    />

                    <Detail
                      label="Premium başlangıç"
                      value={formatDateTime(
                        payment.premiumStartedAt
                      )}
                    />

                    <Detail
                      label="Premium bitiş"
                      value={formatDateTime(
                        payment.premiumExpiresAt
                      )}
                    />

                    <Detail
                      label="Sözleşme sürümü"
                      value={
                        payment.agreementVersion ??
                        "—"
                      }
                    />

                    <Detail
                      label="Sözleşme onayı"
                      value={formatDateTime(
                        payment.agreementAcceptedAt
                      )}
                    />
                  </div>

                  <div style={agreementBoxStyle}>
                    <div style={agreementTitleStyle}>
                      Sözleşme ve teslimat onayları
                    </div>

                    <div style={agreementGridStyle}>
                      <Approval
                        accepted={
                          payment
                            .serviceAgreementAccepted
                        }
                        label="Dijital hizmet sözleşmesi"
                      />

                      <Approval
                        accepted={
                          payment
                            .refundPolicyAccepted
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
                        label="Ödeme kuruluşu doğrulaması"
                      />
                    </div>
                  </div>

                  <div
                    style={
                      deliveryCompleted
                        ? deliveredBoxStyle
                        : pendingBoxStyle
                    }
                  >
                    {deliveryCompleted ? (
                      <>
                        <strong>
                          ✅ Dijital hizmet teslim
                          edilmiştir.
                        </strong>

                        <span>
                          {" "}
                          Satın alınan kredi veya
                          üyelik hakkı hesaba
                          tanımlanmıştır.
                        </span>
                      </>
                    ) : (
                      <>
                        <strong>
                          ℹ️ Dijital teslim kaydı
                          bulunmuyor.
                        </strong>

                        <span>
                          {" "}
                          Başarılı ödeme doğrulanmadan
                          kredi veya Premium hakkı
                          tanımlanmaz.
                        </span>
                      </>
                    )}
                  </div>

                  {payment.errorMessage ? (
                    <div style={errorStyle}>
                      <strong>
                        İşlem açıklaması:
                      </strong>{" "}
                      {payment.errorMessage}

                      {payment.errorCode ? (
                        <>
                          {" "}
                          ({payment.errorCode})
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {payment.creditTransactions.length >
                  0 ? (
                    <div style={linkedMovementsStyle}>
                      <div style={linkedTitleStyle}>
                        Bu ödemeye bağlı kredi
                        hareketleri
                      </div>

                      {payment.creditTransactions.map(
                        (transaction) => (
                          <div
                            key={transaction.id}
                            style={linkedRowStyle}
                          >
                            <div>
                              <strong>
                                {transaction.note ??
                                  transaction.type}
                              </strong>

                              <div
                                style={
                                  smallMutedStyle
                                }
                              >
                                {formatDateTime(
                                  transaction
                                    .deliveredAt ??
                                    transaction
                                      .createdAt
                                )}
                              </div>
                            </div>

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
                          </div>
                        )
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          Tüm Kredi Hareketleri
        </h2>

        <p style={sectionDescriptionStyle}>
          Satın alma, lead açma ve diğer kredi
          hareketleri.
        </p>

        {creditTransactions.length === 0 ? (
          <div style={emptyStyle}>
            Henüz kredi hareketi bulunmuyor.
          </div>
        ) : (
          <div style={movementListStyle}>
            {creditTransactions.map(
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

                    <div style={smallMutedStyle}>
                      {formatDateTime(
                        transaction.deliveredAt ??
                          transaction.createdAt
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <strong
                      style={{
                        color:
                          transaction.amount >= 0
                            ? "#15803d"
                            : "#b91c1c",
                        fontSize: 16,
                      }}
                    >
                      {transaction.amount > 0
                        ? `+${transaction.amount}`
                        : transaction.amount}{" "}
                      kredi
                    </strong>

                    <div style={smallMutedStyle}>
                      {transaction.balanceBefore !=
                        null &&
                      transaction.balanceAfter != null
                        ? `${transaction.balanceBefore} → ${transaction.balanceAfter}`
                        : "Bakiye kaydı yok"}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div style={detailCardStyle}>
      <div style={detailLabelStyle}>
        {label}
      </div>

      <div style={detailValueStyle}>
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
    <div style={approvalStyle}>
      <span>{accepted ? "✅" : "➖"}</span>
      <span>{label}</span>
    </div>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "4px 0 60px",
};

const heroStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  padding: 26,
  borderRadius: 30,
  color: "white",
  background:
    "radial-gradient(circle at 0% 0%, rgba(56,189,248,.26), transparent 38%), linear-gradient(135deg, #0f172a, #4338ca)",
  boxShadow:
    "0 28px 80px rgba(15,23,42,.18)",
};

const kickerStyle: CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  border:
    "1px solid rgba(255,255,255,.18)",
  background: "rgba(255,255,255,.10)",
  fontSize: 12,
  fontWeight: 900,
};

const heroTitleStyle: CSSProperties = {
  margin: "14px 0 0",
  fontSize: "clamp(32px,5vw,52px)",
  lineHeight: 1,
  letterSpacing: "-0.05em",
};

const heroTextStyle: CSSProperties = {
  maxWidth: 720,
  margin: "14px 0 0",
  color: "rgba(255,255,255,.82)",
  fontWeight: 750,
};

const heroButtonStyle: CSSProperties = {
  display: "inline-flex",
  padding: "13px 17px",
  borderRadius: 16,
  background: "white",
  color: "#1e1b4b",
  textDecoration: "none",
  fontWeight: 950,
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  padding: "12px 16px",
  borderRadius: 12,
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(190px,1fr))",
  gap: 12,
  marginTop: 16,
};

const metricCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 22,
  border: "1px solid rgba(15,23,42,.08)",
  background: "rgba(255,255,255,.84)",
  boxShadow:
    "0 18px 45px rgba(15,23,42,.06)",
};

const metricLabelStyle: CSSProperties = {
  color: "rgba(15,23,42,.65)",
  fontWeight: 850,
  fontSize: 12,
};

const metricValueStyle: CSSProperties = {
  marginTop: 7,
  fontSize: 30,
  fontWeight: 1000,
};

const sectionStyle: CSSProperties = {
  marginTop: 18,
  padding: 20,
  borderRadius: 28,
  border: "1px solid rgba(15,23,42,.08)",
  background: "rgba(255,255,255,.82)",
  boxShadow:
    "0 22px 60px rgba(15,23,42,.07)",
};

const sectionHeadingRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  letterSpacing: "-0.025em",
};

const sectionDescriptionStyle: CSSProperties = {
  margin: "5px 0 0",
  color: "rgba(15,23,42,.63)",
  fontWeight: 750,
};

const listStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 16,
};

const paymentCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 24,
  border: "1px solid rgba(15,23,42,.09)",
  background: "rgba(248,250,252,.82)",
};

const paymentHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
  flexWrap: "wrap",
};

const packageTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 1000,
};

const orderNumberStyle: CSSProperties = {
  marginTop: 4,
  color: "rgba(15,23,42,.62)",
  fontSize: 12,
  fontWeight: 800,
  wordBreak: "break-all",
};

const headerRightStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const statusBadgeStyle: CSSProperties = {
  display: "inline-flex",
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid",
  fontSize: 11,
  fontWeight: 950,
};

const amountStyle: CSSProperties = {
  fontSize: 19,
};

const detailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(190px,1fr))",
  gap: 9,
  marginTop: 15,
};

const detailCardStyle: CSSProperties = {
  padding: 11,
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,.07)",
  background: "white",
};

const detailLabelStyle: CSSProperties = {
  color: "rgba(15,23,42,.58)",
  fontSize: 11,
  fontWeight: 850,
};

const detailValueStyle: CSSProperties = {
  marginTop: 3,
  fontSize: 13,
  fontWeight: 900,
  wordBreak: "break-word",
};

const agreementBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 13,
  borderRadius: 17,
  border:
    "1px solid rgba(79,70,229,.13)",
  background: "rgba(79,70,229,.05)",
};

const agreementTitleStyle: CSSProperties = {
  fontWeight: 950,
};

const agreementGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: 8,
  marginTop: 9,
};

const approvalStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 12,
  fontWeight: 800,
};

const deliveredBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 13,
  borderRadius: 16,
  border:
    "1px solid rgba(34,197,94,.22)",
  background: "rgba(34,197,94,.09)",
  color: "#166534",
  fontSize: 13,
  lineHeight: 1.6,
};

const pendingBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 13,
  borderRadius: 16,
  border:
    "1px solid rgba(245,158,11,.22)",
  background: "rgba(245,158,11,.08)",
  color: "#92400e",
  fontSize: 13,
  lineHeight: 1.6,
};

const errorStyle: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(239,68,68,.08)",
  color: "#991b1b",
  fontSize: 12,
  lineHeight: 1.6,
};

const linkedMovementsStyle: CSSProperties = {
  marginTop: 14,
};

const linkedTitleStyle: CSSProperties = {
  marginBottom: 8,
  fontWeight: 950,
};

const linkedRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  borderTop: "1px solid rgba(15,23,42,.07)",
};

const movementListStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 15,
};

const movementRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: 13,
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,.08)",
  background: "rgba(248,250,252,.78)",
};

const smallMutedStyle: CSSProperties = {
  marginTop: 3,
  color: "rgba(15,23,42,.58)",
  fontSize: 11,
  fontWeight: 750,
};

const emptyStyle: CSSProperties = {
  marginTop: 15,
  padding: 20,
  borderRadius: 18,
  textAlign: "center",
  color: "rgba(15,23,42,.65)",
  background: "rgba(15,23,42,.035)",
  fontWeight: 850,
};