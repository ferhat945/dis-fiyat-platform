import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentConfigResponse = {
  ok: true;
  provider: "iyzico";
  active: boolean;
  checkoutEnabled: boolean;
};

export async function GET(): Promise<
  NextResponse<PaymentConfigResponse>
> {
  const active =
    process.env.IYZICO_PAYMENT_ACTIVE === "1";

  return NextResponse.json(
    {
      ok: true,
      provider: "iyzico",
      active,
      checkoutEnabled: active,
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