import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const StartSchema = z.object({
  package: z.enum([
    "credit_5",
    "credit_10",
    "credit_25",
    "premium",
  ]),

  serviceAgreementAccepted: z.literal(true),
  refundPolicyAccepted: z.literal(true),
  immediatePerformanceAccepted: z.literal(true),
});

type PackageCode = z.infer<
  typeof StartSchema
>["package"];

type StartResp =
  | {
      ok: true;
      mode: "payment_redirect";
      package: PackageCode;
      redirectUrl: string;
    }
  | {
      ok: false;
      code: string;
    };

type PackageDefinition = {
  code: PackageCode;
  kind: string;
  amount: number;
  credits: number;
  title: string;
};

const PACKAGES: Record<
  PackageCode,
  PackageDefinition
> = {
  credit_5: {
    code: "credit_5",
    kind: "credit_pack_5",
    amount: 1500,
    credits: 5,
    title: "5 Kredi Paketi",
  },

  credit_10: {
    code: "credit_10",
    kind: "credit_pack_10",
    amount: 2000,
    credits: 10,
    title: "10 Kredi Paketi",
  },

  credit_25: {
    code: "credit_25",
    kind: "credit_pack_25",
    amount: 4000,
    credits: 25,
    title: "25 Kredi Paketi",
  },

  premium: {
    code: "premium",
    kind: "premium_30_days",
    amount: 2500,
    credits: 10,
    title: "Premium Üyelik",
  },
};

function jsonResponse(
  body: StartResp,
  status: number
): NextResponse<StartResp> {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(
  request: Request
): Promise<NextResponse<StartResp>> {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("clinic_session")?.value ??
      "";

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
      const flattened =
        parsed.error.flatten();

      const approvalError =
        Boolean(
          flattened.fieldErrors
            .serviceAgreementAccepted
            ?.length
        ) ||
        Boolean(
          flattened.fieldErrors
            .refundPolicyAccepted?.length
        ) ||
        Boolean(
          flattened.fieldErrors
            .immediatePerformanceAccepted
            ?.length
        );

      return jsonResponse(
        {
          ok: false,
          code: approvalError
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
      PACKAGES[parsed.data.package];

    /*
     * ÖNEMLİ GÜVENLİK KURALI
     *
     * Bu endpoint ödeme başlangıç
     * endpointidir.
     *
     * Burada kesinlikle:
     *
     * - creditBalance artırılmaz.
     * - CreditTransaction oluşturulmaz.
     * - Premium üyelik başlatılmaz.
     * - Subscription oluşturulmaz.
     * - Kota artırılmaz.
     * - Başarılı ödeme kaydı yazılmaz.
     *
     * Kredi veya Premium hakkı yalnızca
     * Garanti BBVA tarafından gönderilen ve
     * sunucu tarafında doğrulanan başarılı
     * callback sonrasında tanımlanmalıdır.
     */

    console.info(
      "PAYMENT_PROVIDER_NOT_ACTIVE",
      {
        clinicId: clinic.id,
        package: selectedPackage.code,
        kind: selectedPackage.kind,
        amount: selectedPackage.amount,
        credits: selectedPackage.credits,
      }
    );

    /*
     * Garanti BBVA Sanal POS bağlantısı
     * tamamlanana kadar bütün ücretli
     * işlemler burada güvenli şekilde
     * durdurulur.
     *
     * Bu yanıt sırasında veritabanında
     * kredi, Premium, abonelik veya kota
     * değişikliği yapılmaz.
     */
    return jsonResponse(
      {
        ok: false,
        code: "PAYMENT_PROVIDER_NOT_ACTIVE",
      },
      503
    );
  } catch (error: unknown) {
    console.error(
      "PAYMENT_START_ERROR:",
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