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
  const router = useRouter();

  const [loading, setLoading] =
    useState<
      "approve" | "cancel" | null
    >(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  if (
    provider !== "bank_transfer" ||
    delivered ||
    (
      status !== "awaiting_transfer" &&
      status !== "transfer_notified"
    )
  ) {
    return null;
  }

  async function runAction(
    action: "approve" | "cancel"
  ): Promise<void> {
    if (loading) {
      return;
    }

    if (action === "approve") {
      const confirmed =
        window.confirm(
          "Banka hesabında bu siparişin TAM TUTARDA tahsil edildiğini kontrol ettiniz mi?\n\nOnay verdiğiniz anda kredi/Premium hakkı kliniğe tanımlanacaktır."
        );

      if (!confirmed) {
        return;
      }
    }

    if (action === "cancel") {
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
      const response = await fetch(
        `/api/admin/payments/bank-transfer/${paymentId}/${action}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data =
        (await response.json()) as ActionResponse;

      if (!response.ok || !data.ok) {
        setError(
          data.ok
            ? "İşlem tamamlanamadı."
            : `İşlem tamamlanamadı: ${data.code}`
        );

        return;
      }

      if (action === "approve") {
        setMessage(
          data.alreadyDelivered
            ? "Bu ödeme daha önce teslim edilmiş."
            : "Ödeme onaylandı. Dijital haklar kliniğin hesabına tanımlandı."
        );
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
      style={{
        marginTop: 16,
        padding: 18,
        borderRadius: 20,
        border:
          "1px solid rgba(245,158,11,.24)",
        background:
          "linear-gradient(135deg,rgba(255,251,235,.96),rgba(255,255,255,.96))",
      }}
    >
      <div
        style={{
          fontSize: 19,
          fontWeight: 1000,
        }}
      >
        🏦 Banka Transferi Kontrolü
      </div>

      <div
        style={{
          marginTop: 7,
          color:
            "rgba(120,53,15,.82)",
          fontSize: 13,
          lineHeight: 1.65,
          fontWeight: 800,
        }}
      >
        Kredi veya Premium hakkını
        tanımlamadan önce Garanti BBVA
        hesabında sipariş tutarının ve ödeme
        açıklamasının doğru olduğunu kontrol
        et.
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            void runAction("approve")
          }
          style={{
            border: 0,
            borderRadius: 14,
            padding: "12px 16px",
            background: "#15803d",
            color: "white",
            fontWeight: 950,
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
            opacity:
              loading ? 0.65 : 1,
          }}
        >
          {loading === "approve"
            ? "Onaylanıyor..."
            : "✅ Ödemeyi Onayla ve Teslim Et"}
        </button>

        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            void runAction("cancel")
          }
          style={{
            border:
              "1px solid rgba(185,28,28,.20)",
            borderRadius: 14,
            padding: "12px 16px",
            background:
              "rgba(254,242,242,.95)",
            color: "#b91c1c",
            fontWeight: 950,
            cursor:
              loading
                ? "not-allowed"
                : "pointer",
            opacity:
              loading ? 0.65 : 1,
          }}
        >
          {loading === "cancel"
            ? "İptal ediliyor..."
            : "Ödeme Bulunamadı / İptal Et"}
        </button>
      </div>

      {message ? (
        <div
          style={{
            marginTop: 12,
            padding: 11,
            borderRadius: 12,
            background:
              "rgba(34,197,94,.10)",
            color: "#166534",
            fontWeight: 900,
          }}
        >
          {message}
        </div>
      ) : null}

      {error ? (
        <div
          style={{
            marginTop: 12,
            padding: 11,
            borderRadius: 12,
            background:
              "rgba(239,68,68,.08)",
            color: "#b91c1c",
            fontWeight: 900,
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}