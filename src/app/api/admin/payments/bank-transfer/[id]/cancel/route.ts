import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";

import {
  getAdminCookieName,
  verifyAdminSession,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CancelResponse =
  | {
      ok: true;
    }
  | {
      ok: false;
      code: string;
    };

function jsonResponse(
  body: CancelResponse,
  status: number
): NextResponse<CancelResponse> {
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
): Promise<NextResponse<CancelResponse>> {
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

    const payment =
      await prisma.paymentLog.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          provider: true,
          status: true,
          deliveredAt: true,
        },
      });

    if (!payment) {
      return jsonResponse(
        {
          ok: false,
          code: "PAYMENT_NOT_FOUND",
        },
        404
      );
    }

    if (
      payment.provider !==
      "bank_transfer"
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            "INVALID_PAYMENT_PROVIDER",
        },
        409
      );
    }

    if (payment.deliveredAt) {
      return jsonResponse(
        {
          ok: false,
          code:
            "PAYMENT_ALREADY_DELIVERED",
        },
        409
      );
    }

    if (
      payment.status !==
        "awaiting_transfer" &&
      payment.status !==
        "transfer_notified"
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            "INVALID_PAYMENT_STATUS",
        },
        409
      );
    }

    const canceledAt =
      new Date();

    await prisma.paymentLog.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "canceled",
        canceledAt,

        errorCode:
          "BANK_TRANSFER_CANCELED_BY_ADMIN",

        errorMessage:
          "Banka transferi admin kontrolü sonucunda iptal edildi.",
      },
    });

    return jsonResponse(
      {
        ok: true,
      },
      200
    );
  } catch (error: unknown) {
    console.error(
      "ADMIN_BANK_TRANSFER_CANCEL_ERROR",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "ADMIN_BANK_TRANSFER_CANCEL_ERROR",
      },
      500
    );
  }
}