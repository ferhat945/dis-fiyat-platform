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

function statusLabel(
  status: string
): string {
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

  if (
    status === "awaiting_transfer"
  ) {
    return "Havale Bekleniyor";
  }

  if (
    status === "transfer_notified"
  ) {
    return "Ödeme Bildirildi";
  }

  if (
    status === "processing_transfer"
  ) {
    return "Kontrol Ediliyor";
  }

  if (status === "canceled") {
    return "İptal";
  }

  if (status === "failed") {
    return "Başarısız";
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

function providerLabel(
  provider: string | null
): string {
  if (
    provider === "bank_transfer"
  ) {
    return "Havale / EFT";
  }

  if (provider === "iyzico") {
    return "iyzico";
  }

  if (provider === "paytr") {
    return "PayTR";
  }

  return provider ?? "—";
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

  const successful =
    payments.filter(
      (payment) =>
        payment.status === "paid" ||
        payment.status === "success" ||
        payment.status === "completed"
    );

  const delivered =
    payments.filter(
      (payment) =>
        Boolean(
          payment.deliveredAt
        )
    );

  const waitingTransfer =
    payments.filter(
      (payment) =>
        payment.status ===
          "awaiting_transfer" ||
        payment.status ===
          "transfer_notified"
    );

  const totalRevenue =
    successful.reduce(
      (sum, payment) =>
        sum + payment.amount,
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
            Toplam Ödeme
          </div>

          <div className="adminStatValue">
            {payments.length}
          </div>

          <div className="adminStatMeta">
            Son 300 ödeme kaydı
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Başarılı
          </div>

          <div className="adminStatValue">
            {successful.length}
          </div>

          <div className="adminStatMeta">
            Tahsilatı başarılı işlemler
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Havale Bekleyen
          </div>

          <div className="adminStatValue">
            {waitingTransfer.length}
          </div>

          <div className="adminStatMeta">
            Admin kontrolü gereken
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Başarılı Tutar
          </div>

          <div
            className="adminStatValue"
            style={{
              fontSize: 21,
              paddingTop: 4,
            }}
          >
            {formatMoney(
              totalRevenue,
              "TRY"
            )}
          </div>

          <div className="adminStatMeta">
            Görünen başarılı kayıtlar
          </div>
        </div>
      </section>

      <section className="adminCard">
        <div className="adminCardHeader">
          <div>
            <h2>Ödeme Kayıtları</h2>

            <p>
              Klinik ödeme denemeleri,
              tahsilatlar ve dijital
              hizmet teslim kayıtları.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 7,
              flexWrap: "wrap",
            }}
          >
            <span className="adminBadge adminBadgeSuccess">
              {delivered.length} teslim
            </span>

            <span className="adminBadge adminBadgeNeutral">
              {payments.length} kayıt
            </span>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="adminEmptyState">
            <strong>
              Ödeme kaydı bulunmuyor
            </strong>

            <p>
              Klinik ödeme işlemleri
              başladığında burada
              görüntülenecek.
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
                  <th>Tarih</th>
                  <th>Klinik</th>
                  <th>Sipariş</th>
                  <th>Paket</th>
                  <th>Yöntem</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Teslimat</th>
                  <th>Bakiye</th>
                  <th>Detay</th>
                </tr>
              </thead>

              <tbody>
                {payments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                    >
                      <td>
                        <span
                          style={{
                            whiteSpace:
                              "nowrap",
                            color:
                              "#475467",
                          }}
                        >
                          {formatDateTime(
                            payment.createdAt
                          )}
                        </span>
                      </td>

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
                            payment
                              .clinic
                              .name
                          }
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            color:
                              "#98a2b3",
                            fontSize: 8,
                          }}
                        >
                          {
                            payment
                              .clinic
                              .email
                          }
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth:
                              190,
                            overflow:
                              "hidden",
                            color:
                              "#344054",
                            fontFamily:
                              "monospace",
                            fontSize: 9,
                            fontWeight:
                              700,
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                          title={
                            payment.orderNumber ??
                            ""
                          }
                        >
                          {payment.orderNumber ??
                            "—"}
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            maxWidth:
                              190,
                            overflow:
                              "hidden",
                            color:
                              "#98a2b3",
                            fontSize: 8,
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {payment.providerRef ??
                            "Referans yok"}
                        </div>
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              "#344054",
                          }}
                        >
                          {packageLabel(
                            payment.packageCode,
                            payment.kind
                          )}
                        </strong>

                        <div
                          style={{
                            marginTop: 3,
                            color:
                              "#98a2b3",
                            fontSize: 8,
                          }}
                        >
                          {payment.credits !=
                          null
                            ? `${payment.credits} kredi`
                            : "—"}
                        </div>
                      </td>

                      <td>
                        <span className="adminBadge adminBadgeNeutral">
                          {providerLabel(
                            payment.provider
                          )}
                        </span>
                      </td>

                      <td>
                        <strong
                          style={{
                            color:
                              "#101828",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatMoney(
                            payment.amount,
                            payment.currency
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={statusClass(
                            payment.status
                          )}
                        >
                          {statusLabel(
                            payment.status
                          )}
                        </span>

                        <div
                          style={{
                            marginTop: 5,
                            color:
                              payment.callbackVerified
                                ? "#067647"
                                : "#98a2b3",
                            fontSize: 8,
                            fontWeight:
                              650,
                          }}
                        >
                          {payment.callbackVerified
                            ? "✓ Doğrulandı"
                            : "Doğrulama bekliyor"}
                        </div>
                      </td>

                      <td>
                        {payment.deliveredAt ? (
                          <>
                            <span className="adminBadge adminBadgeSuccess">
                              Teslim edildi
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
                              {formatDateTime(
                                payment.deliveredAt
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="adminBadge adminBadgeWarning">
                            Teslim bekliyor
                          </span>
                        )}
                      </td>

                      <td>
                        {payment.balanceBefore !=
                          null &&
                        payment.balanceAfter !=
                          null ? (
                          <div>
                            <strong
                              style={{
                                color:
                                  "#344054",
                              }}
                            >
                              {
                                payment.balanceBefore
                              }{" "}
                              →{" "}
                              {
                                payment.balanceAfter
                              }
                            </strong>

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
                                payment
                                  ._count
                                  .creditTransactions
                              }{" "}
                              hareket
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <Link
                          href={`/admin/odemeler/${payment.id}`}
                          className="adminButton adminButtonPrimary"
                        >
                          İncele →
                        </Link>
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