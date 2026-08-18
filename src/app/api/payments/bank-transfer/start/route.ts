import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import {
  getPaymentPackage,
  PAYMENT_PACKAGE_CODES,
  type PaymentPackageCode,
} from "@/lib/payment-packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGREEMENT_VERSION = "2026-08-v1";
const PAYMENT_PROVIDER = "bank_transfer";

const StartBankTransferSchema = z.object({
  package: z.enum(PAYMENT_PACKAGE_CODES),

  serviceAgreementAccepted:
    z.literal(true),

  refundPolicyAccepted:
    z.literal(true),

  immediatePerformanceAccepted:
    z.literal(true),
});

type StartBankTransferResponse =
  | {
      ok: true;
      mode: "bank_transfer";
      package: PaymentPackageCode;

      paymentLogId: string;
      orderNumber: string;

      bank: {
        bankName: string;
        accountHolder: string;
        iban: string;
      };

      payment: {
        amount: number;
        currency: "TRY";
        amountFormatted: string;
        description: string;
      };
    }
  | {
      ok: false;
      code: string;
    };

function jsonResponse(
  body: StartBankTransferResponse,
  status: number
): NextResponse<StartBankTransferResponse> {
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

function createOrderNumber(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `DF360-${datePart}-${randomPart}`;
}

function getClientIp(
  headers: Headers
): string {
  const forwardedFor =
    headers.get("x-forwarded-for");

  if (forwardedFor) {
    const firstIp =
      forwardedFor.split(",")[0]?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp =
    headers.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp;
  }

  const cloudflareIp =
    headers
      .get("cf-connecting-ip")
      ?.trim();

  if (cloudflareIp) {
    return cloudflareIp;
  }

  return "unknown";
}

function getSafeHeader(
  headers: Headers,
  name: string
): string {
  const value =
    headers.get(name)?.trim();

  return value
    ? value.slice(0, 1000)
    : "unknown";
}

function formatAmount(
  amount: number
): string {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

function normalizeIban(
  value: string
): string {
  return value
    .replace(/\s+/g, "")
    .toUpperCase();
}

export async function POST(
  request: Request
): Promise<
  NextResponse<StartBankTransferResponse>
> {
  try {
    if (
      process.env
        .BANK_TRANSFER_ENABLED !== "1"
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            "BANK_TRANSFER_NOT_ACTIVE",
        },
        503
      );
    }

    const bankName =
      process.env
        .BANK_TRANSFER_BANK_NAME?.trim() ??
      "";

    const accountHolder =
      process.env
        .BANK_TRANSFER_ACCOUNT_HOLDER?.trim() ??
      "";

    const iban = normalizeIban(
      process.env
        .BANK_TRANSFER_IBAN ?? ""
    );

    if (
      !bankName ||
      !accountHolder ||
      !/^TR\d{24}$/.test(iban)
    ) {
      console.error(
        "BANK_TRANSFER_CONFIG_INVALID"
      );

      return jsonResponse(
        {
          ok: false,
          code:
            "BANK_TRANSFER_CONFIG_INVALID",
        },
        500
      );
    }

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get(
        "clinic_session"
      )?.value ?? "";

    const session = token
      ? await verifyClinicSession(
          token
        )
      : null;

    if (!session) {
      return jsonResponse(
        {
          ok: false,
          code:
            "UNAUTHORIZED_CLINIC",
        },
        401
      );
    }

    let requestBody: unknown;

    try {
      requestBody =
        await request.json();
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
      StartBankTransferSchema.safeParse(
        requestBody
      );

    if (!parsed.success) {
      return jsonResponse(
        {
          ok: false,
          code:
            "AGREEMENTS_REQUIRED",
        },
        400
      );
    }

    const clinic =
      await prisma.clinic.findUnique({
        where: {
          id: session.clinicId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
        },
      });

    if (
      !clinic ||
      !clinic.isActive
    ) {
      return jsonResponse(
        {
          ok: false,
          code:
            "CLINIC_NOT_FOUND",
        },
        404
      );
    }

    const selectedPackage =
      getPaymentPackage(
        parsed.data.package
      );

    const acceptedAt =
      new Date();

    const orderNumber =
      createOrderNumber();

    const clientIp =
      getClientIp(
        request.headers
      );

    const userAgent =
      getSafeHeader(
        request.headers,
        "user-agent"
      );

    const acceptLanguage =
      getSafeHeader(
        request.headers,
        "accept-language"
      );

    const referer =
      getSafeHeader(
        request.headers,
        "referer"
      );

    const origin =
      getSafeHeader(
        request.headers,
        "origin"
      );

    const paymentLog =
      await prisma.paymentLog.create({
        data: {
          clinicId: clinic.id,

          packageCode:
            selectedPackage.code,

          kind:
            selectedPackage.kind,

          credits:
            selectedPackage.credits,

          amount:
            selectedPackage.amount,

          currency:
            selectedPackage.currency,

          status:
            "awaiting_transfer",

          provider:
            PAYMENT_PROVIDER,

          orderNumber,

          callbackVerified: false,

          serviceAgreementAccepted:
            parsed.data
              .serviceAgreementAccepted,

          refundPolicyAccepted:
            parsed.data
              .refundPolicyAccepted,

          immediatePerformanceAccepted:
            parsed.data
              .immediatePerformanceAccepted,

          agreementVersion:
            AGREEMENT_VERSION,

          agreementAcceptedAt:
            acceptedAt,

          requestPayload: {
            paymentMethod:
              "bank_transfer",

            orderNumber,

            clinic: {
              id: clinic.id,
              name: clinic.name,
              email: clinic.email,
              phone:
                clinic.phone ?? null,
            },

            package: {
              code:
                selectedPackage.code,

              kind:
                selectedPackage.kind,

              title:
                selectedPackage.title,

              amount:
                selectedPackage.amount,

              currency:
                selectedPackage.currency,

              credits:
                selectedPackage.credits,

              premiumDays:
                selectedPackage
                  .premiumDays,

              automaticRenewal:
                selectedPackage
                  .automaticRenewal,
            },

            bankTransfer: {
              bankName,
              accountHolder,

              /*
               * IBAN operasyonel ödeme
               * kanıtı olarak kaydedilir.
               * Kart verisi değildir.
               */
              iban,

              transferDescription:
                orderNumber,
            },

            agreements: {
              serviceAgreementAccepted:
                parsed.data
                  .serviceAgreementAccepted,

              refundPolicyAccepted:
                parsed.data
                  .refundPolicyAccepted,

              immediatePerformanceAccepted:
                parsed.data
                  .immediatePerformanceAccepted,

              agreementVersion:
                AGREEMENT_VERSION,

              acceptedAt:
                acceptedAt.toISOString(),
            },

            requestEvidence: {
              clientIp,
              userAgent,
              acceptLanguage,
              referer,
              origin,
            },
          },
        },

        select: {
          id: true,
          orderNumber: true,
        },
      });

    if (
      !paymentLog.orderNumber
    ) {
      throw new Error(
        "ORDER_NUMBER_NOT_CREATED"
      );
    }

    return jsonResponse(
      {
        ok: true,
        mode: "bank_transfer",

        package:
          selectedPackage.code,

        paymentLogId:
          paymentLog.id,

        orderNumber:
          paymentLog.orderNumber,

        bank: {
          bankName,
          accountHolder,
          iban,
        },

        payment: {
          amount:
            selectedPackage.amount,

          currency: "TRY",

          amountFormatted:
            formatAmount(
              selectedPackage.amount
            ),

          description:
            paymentLog.orderNumber,
        },
      },
      201
    );
  } catch (error: unknown) {
    console.error(
      "BANK_TRANSFER_START_ERROR",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "BANK_TRANSFER_START_ERROR",
      },
      500
    );
  }
}