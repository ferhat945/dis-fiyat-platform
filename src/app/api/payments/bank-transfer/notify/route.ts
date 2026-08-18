import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NotifySchema = z.object({
  paymentLogId: z.string().min(1),
  orderNumber: z.string().min(1),
});

type NotifyResponse =
  | {
      ok: true;
      status: "transfer_notified";
      paymentLogId: string;
      orderNumber: string;
    }
  | {
      ok: false;
      code: string;
    };

function jsonResponse(
  body: NotifyResponse,
  status: number
): NextResponse<NotifyResponse> {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

function getClientIp(
  headers: Headers
): string {
  const forwarded =
    headers.get("x-forwarded-for");

  if (forwarded) {
    const first =
      forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  return (
    headers.get("x-real-ip")?.trim() ||
    headers
      .get("cf-connecting-ip")
      ?.trim() ||
    "unknown"
  );
}

export async function POST(
  request: Request
): Promise<NextResponse<NotifyResponse>> {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "clinic_session"
      )?.value ?? "";

    const session = token
      ? await verifyClinicSession(token)
      : null;

    if (!session) {
      return jsonResponse(
        {
          ok: false,
          code: "UNAUTHORIZED_CLINIC",
        },
        401
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_JSON",
        },
        400
      );
    }

    const parsed =
      NotifySchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(
        {
          ok: false,
          code: "VALIDATION_ERROR",
        },
        400
      );
    }

    const payment =
      await prisma.paymentLog.findFirst({
        where: {
          id: parsed.data.paymentLogId,
          orderNumber:
            parsed.data.orderNumber,
          clinicId: session.clinicId,
          provider: "bank_transfer",
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          deliveredAt: true,
          callbackPayload: true,
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

    if (payment.deliveredAt) {
      return jsonResponse(
        {
          ok: false,
          code: "PAYMENT_ALREADY_DELIVERED",
        },
        409
      );
    }

    if (
      payment.status ===
      "transfer_notified"
    ) {
      return jsonResponse(
        {
          ok: true,
          status: "transfer_notified",
          paymentLogId: payment.id,
          orderNumber:
            payment.orderNumber ?? "",
        },
        200
      );
    }

    if (
      payment.status !==
      "awaiting_transfer"
    ) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_PAYMENT_STATUS",
        },
        409
      );
    }

    const notifiedAt = new Date();

    await prisma.paymentLog.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "transfer_notified",

        callbackPayload: {
          previous:
            payment.callbackPayload ?? null,

          bankTransferNotification: {
            notifiedBy: "clinic",
            notifiedAt:
              notifiedAt.toISOString(),

            clientIp:
              getClientIp(
                request.headers
              ),

            userAgent:
              request.headers
                .get("user-agent")
                ?.slice(0, 1000) ??
              "unknown",
          },
        },
      },
    });

    return jsonResponse(
      {
        ok: true,
        status: "transfer_notified",
        paymentLogId: payment.id,
        orderNumber:
          payment.orderNumber ?? "",
      },
      200
    );
  } catch (error: unknown) {
    console.error(
      "BANK_TRANSFER_NOTIFY_ERROR",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "BANK_TRANSFER_NOTIFY_ERROR",
      },
      500
    );
  }
}