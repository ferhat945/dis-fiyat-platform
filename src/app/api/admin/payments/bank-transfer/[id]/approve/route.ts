import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getAdminCookieName,
  verifyAdminSession,
} from "@/lib/admin-auth";

import {
  approveBankTransferAndDeliver,
} from "@/lib/payment-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ApproveResponse =
  | {
      ok: true;
      alreadyDelivered: boolean;
      balanceBefore: number;
      balanceAfter: number;
    }
  | {
      ok: false;
      code: string;
    };

function jsonResponse(
  body: ApproveResponse,
  status: number
): NextResponse<ApproveResponse> {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

async function hasAdminSession(): Promise<boolean> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      getAdminCookieName()
    )?.value ?? "";

  if (!token) {
    return false;
  }

  const session =
    await verifyAdminSession(token);

  return Boolean(session);
}

export async function POST(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<ApproveResponse>> {
  try {
    if (!(await hasAdminSession())) {
      return jsonResponse(
        {
          ok: false,
          code: "UNAUTHORIZED_ADMIN",
        },
        401
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return jsonResponse(
        {
          ok: false,
          code: "PAYMENT_ID_REQUIRED",
        },
        400
      );
    }

    const result =
      await approveBankTransferAndDeliver(
        id
      );

    if (!result.ok) {
      const status =
        result.code ===
        "PAYMENT_NOT_FOUND"
          ? 404
          : 409;

      return jsonResponse(
        {
          ok: false,
          code: result.code,
        },
        status
      );
    }

    return jsonResponse(
      {
        ok: true,
        alreadyDelivered:
          result.alreadyDelivered,
        balanceBefore:
          result.balanceBefore,
        balanceAfter:
          result.balanceAfter,
      },
      200
    );
  } catch (error: unknown) {
    console.error(
      "ADMIN_BANK_TRANSFER_APPROVE_ERROR",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "ADMIN_BANK_TRANSFER_APPROVE_ERROR",
      },
      500
    );
  }
}