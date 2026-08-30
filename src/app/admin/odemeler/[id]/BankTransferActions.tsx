"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  paymentId: string;
  status: string;
  provider: string | null;
  delivered: boolean;
};

type ActionResponse =
  | {
      ok: true;
      alreadyDelivered?: boolean;
      balanceBefore?: number;
      balanceAfter?: number;
    }
  | {
      ok: false;
      code: string;
    };

export default function BankTransferActions({
  paymentId,
  status,
  provider,
  delivered,
}: Props): JSX.Element | null {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState<
      "approve" | "cancel" | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  if (
    provider !==
      "bank_transfer" ||
    delivered ||
    (
      status !==
        "awaiting_transfer" &&
      status !==
        "transfer_notified"
    )
  ) {
    return null;
  }

  async function runAction(
    action:
      | "approve"
      | "cancel"
  ): Promise<void> {
    if (loading) {
      return;
    }

    if (
      action ===
      "approve"
    ) {
      const confirmed =
        window.confirm(
          "Banka hesabında bu siparişin TAM TUTARDA tahsil edildiğini kontrol ettiniz mi?\n\nOnay verdiğiniz anda kredi/Premium hakkı kliniğe tanımlanacaktır."
        );

      if (!confirmed) {
        return;
      }
    }

    if (
      action ===
      "cancel"
    ) {
      const confirmed =
        window.confirm(
          "Bu banka transferi siparişini iptal etmek istediğinize emin misiniz?"
        );

      if (!confirmed) {
        return;
      }
    }

    setLoading(action);
    setMessage(null);
    setError(null);

    try {
      const response =
        await fetch(
          `/api/admin/payments/bank-transfer/${paymentId}/${action}`,
          {
            method: "POST",

            headers: {
              Accept:
                "application/json",
            },
          }
        );

      const data =
        (await response.json()) as ActionResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.ok
            ? "İşlem tamamlanamadı."
            : `İşlem tamamlanamadı: ${data.code}`
        );

        return;
      }

      if (
        action ===
        "approve"
      ) {
        if (
          data.alreadyDelivered
        ) {
          setMessage(
            "Bu ödeme daha önce teslim edilmiş."
          );
        } else {
          const balanceText =
            data.balanceBefore !=
              null &&
            data.balanceAfter !=
              null
              ? ` Bakiye: ${data.balanceBefore} → ${data.balanceAfter}.`
              : "";

          setMessage(
            `Ödeme onaylandı. Dijital haklar kliniğin hesabına tanımlandı.${balanceText}`
          );
        }
      } else {
        setMessage(
          "Banka transferi siparişi iptal edildi."
        );
      }

      router.refresh();
    } catch {
      setError(
        "Sunucu bağlantısı sırasında hata oluştu."
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <section
      className="adminCard"
      style={{
        overflow: "hidden",
        border:
          "1px solid #fedf89",
        background:
          "linear-gradient(135deg,#fffaeb,#fff)",
      }}
    >
      <div
        style={{
          padding: 19,
          display: "flex",
          justifyContent:
            "space-between",
          gap: 18,
          alignItems:
            "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            maxWidth: 660,
          }}
        >
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
                width: 40,
                height: 40,
                flex: "0 0 40px",
                display:
                  "grid",
                placeItems:
                  "center",
                borderRadius:
                  12,
                background:
                  "#fef0c7",
                color:
                  "#b54708",
                fontSize: 18,
              }}
            >
              ₺
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color:
                    "#7a2e0e",
                  fontSize: 15,
                  letterSpacing:
                    "-.02em",
                }}
              >
                Banka Transferi Kontrolü
              </h2>

              <div
                style={{
                  marginTop: 4,
                  color:
                    "#b54708",
                  fontSize: 9,
                  fontWeight:
                    650,
                }}
              >
                Manuel ödeme doğrulaması gerekiyor
              </div>
            </div>
          </div>

          <p
            style={{
              margin:
                "12px 0 0",
              color:
                "#93370d",
              fontSize: 10,
              lineHeight: 1.7,
            }}
          >
            Kredi veya Premium hakkını
            tanımlamadan önce banka
            hesabında sipariş tutarını ve
            ödeme açıklamasını kontrol et.
            Onay işlemi dijital hakları
            kliniğe teslim eder.
          </p>
        </div>

        <span className="adminBadge adminBadgeWarning">
          Manuel Kontrol
        </span>
      </div>

      <div
        style={{
          padding:
            "14px 19px 19px",
          borderTop:
            "1px solid #fedf89",
          display: "flex",
          gap: 9,
          flexWrap: "wrap",
          background:
            "rgba(255,255,255,.55)",
        }}
      >
        <button
          type="button"
          disabled={
            loading !== null
          }
          onClick={() =>
            void runAction(
              "approve"
            )
          }
          className="adminButton"
          style={{
            minHeight: 42,
            paddingLeft: 16,
            paddingRight: 16,
            border:
              "1px solid #079455",
            background:
              "#079455",
            color: "white",
            opacity:
              loading
                ? 0.6
                : 1,
          }}
        >
          {loading ===
          "approve"
            ? "Onaylanıyor..."
            : "✓ Ödemeyi Onayla ve Teslim Et"}
        </button>

        <button
          type="button"
          disabled={
            loading !== null
          }
          onClick={() =>
            void runAction(
              "cancel"
            )
          }
          className="adminButton adminButtonDanger"
          style={{
            minHeight: 42,
          }}
        >
          {loading ===
          "cancel"
            ? "İptal ediliyor..."
            : "Ödeme Bulunamadı / İptal Et"}
        </button>
      </div>

      {message ? (
        <div
          style={{
            margin:
              "0 19px 19px",
            padding: 11,
            border:
              "1px solid #abefc6",
            borderRadius: 11,
            background:
              "#ecfdf3",
            color: "#067647",
            fontSize: 10,
            fontWeight: 750,
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            margin:
              "0 19px 19px",
            padding: 11,
            border:
              "1px solid #fecdca",
            borderRadius: 11,
            background:
              "#fef3f2",
            color: "#b42318",
            fontSize: 10,
            fontWeight: 750,
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}