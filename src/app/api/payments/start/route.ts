import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import {
  getPaymentPackage,
  PAYMENT_PACKAGE_CODES,
  type PaymentPackageCode,
} from "@/lib/payment-packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGREEMENT_VERSION = "2026-07-v1";
const PAYMENT_PROVIDER = "iyzico";

const StartSchema = z.object({
  package: z.enum(PAYMENT_PACKAGE_CODES),

  serviceAgreementAccepted: z.literal(true),
  refundPolicyAccepted: z.literal(true),
  immediatePerformanceAccepted: z.literal(true),
});

type StartResponse =
  | {
      ok: true;
      mode: "payment_redirect";
      package: PaymentPackageCode;
      redirectUrl: string;
    }
  | {
      ok: false;
      code: string;
    };

function jsonResponse(
  body: StartResponse,
  status: number
): NextResponse<StartResponse> {
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

function getClientIp(headers: Headers): string {
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
    headers.get("cf-connecting-ip")?.trim();

  if (cloudflareIp) {
    return cloudflareIp;
  }

  return "unknown";
}

function getSafeHeader(
  headers: Headers,
  name: string
): string {
  const value = headers.get(name)?.trim();

  if (!value) {
    return "unknown";
  }

  return value.slice(0, 1000);
}

function createOrderNumber(): string {
  const timestamp = Date.now().toString();

  const randomPart = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase();

  return `DF360-${timestamp}-${randomPart}`;
}

export async function POST(
  request: Request
): Promise<NextResponse<StartResponse>> {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("clinic_session")
        ?.value ?? "";

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

    let requestBody: unknown;

    try {
      requestBody = await request.json();
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
      StartSchema.safeParse(requestBody);

    if (!parsed.success) {
      const fieldErrors =
        parsed.error.flatten().fieldErrors;

      const agreementError =
        Boolean(
          fieldErrors
            .serviceAgreementAccepted
            ?.length
        ) ||
        Boolean(
          fieldErrors
            .refundPolicyAccepted
            ?.length
        ) ||
        Boolean(
          fieldErrors
            .immediatePerformanceAccepted
            ?.length
        );

      return jsonResponse(
        {
          ok: false,
          code: agreementError
            ? "AGREEMENTS_REQUIRED"
            : "VALIDATION_ERROR",
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

    if (!clinic || !clinic.isActive) {
      return jsonResponse(
        {
          ok: false,
          code: "CLINIC_NOT_FOUND",
        },
        404
      );
    }

    const selectedPackage =
      getPaymentPackage(
        parsed.data.package
      );

    const acceptedAt = new Date();
    const orderNumber =
      createOrderNumber();

    const clientIp =
      getClientIp(request.headers);

    const userAgent = getSafeHeader(
      request.headers,
      "user-agent"
    );

    const acceptLanguage = getSafeHeader(
      request.headers,
      "accept-language"
    );

    const referer = getSafeHeader(
      request.headers,
      "referer"
    );

    const origin = getSafeHeader(
      request.headers,
      "origin"
    );

    /*
     * Fiyat, kredi ve Premium süresi yalnızca
     * sunucudaki payment-packages.ts dosyasından
     * alınır. İstemciden fiyat kabul edilmez.
     */
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

          status: "started",

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
              description:
                selectedPackage.description,
              amount:
                selectedPackage.amount,
              amountKurus:
                selectedPackage.amountKurus,
              currency:
                selectedPackage.currency,
              credits:
                selectedPackage.credits,
              premiumDays:
                selectedPackage.premiumDays,
              automaticRenewal:
                selectedPackage
                  .automaticRenewal,
              serviceType:
                selectedPackage.serviceType,
              durationText:
                selectedPackage.durationText,
              activationText:
                selectedPackage.activationText,
              renewalText:
                selectedPackage.renewalText,
              leadDisclaimer:
                selectedPackage
                  .leadDisclaimer,
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

    const paymentProviderActive =
      process.env
        .IYZICO_PAYMENT_ACTIVE === "1";

    if (!paymentProviderActive) {
      await prisma.paymentLog.update({
        where: {
          id: paymentLog.id,
        },
        data: {
          status: "canceled",
          canceledAt: new Date(),
          errorCode:
            "PAYMENT_PROVIDER_NOT_ACTIVE",
          errorMessage:
            "iyzico ödeme altyapısı aktif olmadığı için işlem ödeme kuruluşuna gönderilmedi.",
        },
      });

      console.info(
        "PAYMENT_PROVIDER_NOT_ACTIVE",
        {
          paymentLogId:
            paymentLog.id,
          orderNumber:
            paymentLog.orderNumber,
          clinicId:
            clinic.id,
          packageCode:
            selectedPackage.code,
        }
      );

      return jsonResponse(
        {
          ok: false,
          code:
            "PAYMENT_PROVIDER_NOT_ACTIVE",
        },
        503
      );
    }

    /*
     * iyzico Checkout Form bağlantısı henüz
     * bu noktaya eklenmedi.
     *
     * Ödeme kuruluşuna istek gönderilmediği için
     * kredi veya Premium hakkı tanımlanmaz.
     */
    await prisma.paymentLog.update({
      where: {
        id: paymentLog.id,
      },
      data: {
        status: "failed",
        failedAt: new Date(),
        errorCode:
          "IYZICO_INTEGRATION_NOT_CONFIGURED",
        errorMessage:
          "iyzico ödeme başlatma bağlantısı henüz yapılandırılmadı.",
      },
    });

    console.error(
      "IYZICO_INTEGRATION_NOT_CONFIGURED",
      {
        paymentLogId:
          paymentLog.id,
        orderNumber:
          paymentLog.orderNumber,
        clinicId:
          clinic.id,
        packageCode:
          selectedPackage.code,
      }
    );

    return jsonResponse(
      {
        ok: false,
        code:
          "IYZICO_INTEGRATION_NOT_CONFIGURED",
      },
      503
    );
  } catch (error: unknown) {
    console.error(
      "PAYMENT_START_ERROR",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code: "PAYMENT_START_ERROR",
      },
      500
    );
  }
}