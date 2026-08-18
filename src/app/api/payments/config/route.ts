import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentConfigResponse = {
  ok: true;

  card: {
    provider: "iyzico";
    active: boolean;
    checkoutEnabled: boolean;
  };

  bankTransfer: {
    active: boolean;
  };
};

export async function GET(): Promise<
  NextResponse<PaymentConfigResponse>
> {
  const cardActive =
    process.env
      .IYZICO_PAYMENT_ACTIVE === "1";

  const bankTransferActive =
    process.env
      .BANK_TRANSFER_ENABLED === "1";

  return NextResponse.json(
    {
      ok: true,

      card: {
        provider: "iyzico",
        active: cardActive,
        checkoutEnabled:
          cardActive,
      },

      bankTransfer: {
        active:
          bankTransferActive,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}