
import { z } from "zod";

import { assertAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AdjustCreditSchema = z.object({
  amount: z
    .number()
    .int()
    .min(-100000)
    .max(100000)
    .refine((value) => value !== 0, {
      message: "AMOUNT_CANNOT_BE_ZERO",
    }),
  note: z.string().trim().min(3).max(500),
});

type RouteContext = {
  params: Promise<{
    clinicId: string;
  }>;
};

type AdjustCreditResponse =
  | {
      ok: true;
      clinic: {
        id: string;
        creditBalance: number;
      };
      transaction: {
        id: string;
        amount: number;
        type: string;
        note: string | null;
        balanceBefore: number | null;
        balanceAfter: number | null;
        deliveredAt: Date | null;
        createdAt: Date;
      };
    }
  | {
      ok: false;
      code: string;
    };

function jsonResponse(
  body: AdjustCreditResponse,
  status: number
): NextResponse<AdjustCreditResponse> {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control":
        "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(
  req: Request,
  context: RouteContext
): Promise<NextResponse<AdjustCreditResponse>> {
  try {
    await assertAdmin(req);

    const { clinicId } = await context.params;

    if (!clinicId) {
      return jsonResponse(
        {
          ok: false,
          code: "CLINIC_ID_REQUIRED",
        },
        400
      );
    }

    const json: unknown = await req.json();
    const data = AdjustCreditSchema.parse(json);
    const note = data.note.trim();
    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        const clinic =
          await tx.clinic.findUnique({
            where: {
              id: clinicId,
            },
            select: {
              id: true,
              creditBalance: true,
            },
          });

        if (!clinic) {
          throw new Error(
            "CLINIC_NOT_FOUND"
          );
        }

        const balanceBefore =
          clinic.creditBalance;
        const balanceAfter =
          balanceBefore + data.amount;

        if (balanceAfter < 0) {
          throw new Error(
            "INSUFFICIENT_CREDIT_BALANCE"
          );
        }

        /*
         * Optimistic balance check:
         * Aynı kliniğin bakiyesi eş zamanlı başka bir işlemle
         * değişirse sessizce ezmek yerine işlemi durdururuz.
         */
        const updated =
          await tx.clinic.updateMany({
            where: {
              id: clinicId,
              creditBalance:
                balanceBefore,
            },
            data: {
              creditBalance:
                balanceAfter,
            },
          });

        if (updated.count !== 1) {
          throw new Error(
            "CREDIT_BALANCE_CHANGED_RETRY"
          );
        }

        const transaction =
          await tx.creditTransaction.create({
            data: {
              clinicId,
              amount: data.amount,
              type: "admin_adjustment",
              note,
              balanceBefore,
              balanceAfter,
              deliveredAt: now,
            },
            select: {
              id: true,
              amount: true,
              type: true,
              note: true,
              balanceBefore: true,
              balanceAfter: true,
              deliveredAt: true,
              createdAt: true,
            },
          });

        return {
          clinic: {
            id: clinic.id,
            creditBalance:
              balanceAfter,
          },
          transaction,
        };
      }
    );

    return jsonResponse(
      {
        ok: true,
        clinic: result.clinic,
        transaction:
          result.transaction,
      },
      200
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return jsonResponse(
        {
          ok: false,
          code: "INVALID_CREDIT_ADJUSTMENT",
        },
        400
      );
    }

    const code =
      error instanceof Error
        ? error.message
        : "ADMIN_CREDIT_ADJUSTMENT_FAILED";

    const status =
      code === "UNAUTHORIZED_ADMIN"
        ? 401
        : code === "CLINIC_NOT_FOUND"
          ? 404
          : code ===
                "INSUFFICIENT_CREDIT_BALANCE" ||
              code ===
                "CREDIT_BALANCE_CHANGED_RETRY"
            ? 409
            : 500;

    console.error(
      "ADMIN_CREDIT_ADJUSTMENT_ERROR",
      error
    );

    return jsonResponse(
      {
        ok: false,
        code,
      },
      status
    );
  }
}
