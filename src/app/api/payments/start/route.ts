import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const StartSchema = z.object({
  package: z.enum(["base", "extra"]),
});

type PackageCode = z.infer<typeof StartSchema>["package"];

type StartResp =
  | { ok: true; mode: "trial" | "created" | "updated"; package: PackageCode }
  | { ok: false; code: string };

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function POST(req: Request): Promise<NextResponse<StartResp>> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;
    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const json: unknown = await req.json();
    const parsed = StartSchema.parse(json);

    const now = new Date();

    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        id: true,
        isActive: true,
        trialUsedAt: true,
        trialEndsAt: true,
      },
    });

    if (!clinic || !clinic.isActive) {
      return NextResponse.json({ ok: false, code: "CLINIC_NOT_FOUND" }, { status: 404 });
    }

    // ✅ BASE: İlk sefer trial, sonra ücretli
    if (parsed.package === "base") {
      const hasUsedTrial = Boolean(clinic.trialUsedAt);

      // 1) TRIAL (1 kere)
      if (!hasUsedTrial) {
        const trialEndsAt = addDays(now, 7);

        const out = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // Double click güvenliği: trialUsedAt null ise set et
          const updated = await tx.clinic.updateMany({
            where: { id: clinic.id, trialUsedAt: null },
            data: { trialUsedAt: now, trialEndsAt },
          });

          if (updated.count === 0) {
            // başka istek trial başlatmış olabilir
            return { ok: false as const, code: "TRIAL_ALREADY_USED" as const };
          }

          // Zaten aktif trial subscription varsa tekrar oluşturma
          const activeTrial = await tx.subscription.findFirst({
            where: {
              clinicId: clinic.id,
              status: "trial",
              expiresAt: { gt: now },
            },
            orderBy: { startedAt: "desc" },
            select: { id: true },
          });

          if (!activeTrial) {
            await tx.subscription.create({
              data: {
                clinicId: clinic.id,
                status: "trial",
                quotaTotal: 10,
                quotaUsed: 0,
                startedAt: now,
                expiresAt: trialEndsAt,
              },
            });
          }

          await tx.paymentLog.create({
            data: {
              clinicId: clinic.id,
              kind: "trial_start",
              amount: 0,
              currency: "TRY",
              status: "success",
              provider: "mock",
              providerRef: `trial_start_${now.getTime()}`,
              payload: { mode: "trial", days: 7, quota: 10, trialEndsAt: trialEndsAt.toISOString() },
            },
          });

          return { ok: true as const };
        });

        if (!out.ok) {
          return NextResponse.json({ ok: false, code: out.code }, { status: 409 });
        }

        return NextResponse.json({ ok: true, mode: "trial", package: "base" }, { status: 200 });
      }

      // 2) ÜCRETLİ (30 gün / 2000 TL - mock)
      const paidEndsAt = addDays(now, 30);

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.paymentLog.create({
          data: {
            clinicId: clinic.id,
            kind: "subscription_base",
            amount: 2000,
            currency: "TRY",
            status: "success",
            provider: "mock",
            providerRef: `sub_base_${now.getTime()}`,
            payload: { mode: "paid", days: 30, quota: 10, paidEndsAt: paidEndsAt.toISOString() },
          },
        });

        // Aktif ücretli abonelik var mı?
        const activePaid = await tx.subscription.findFirst({
          where: {
            clinicId: clinic.id,
            status: "active",
            expiresAt: { gt: now },
          },
          orderBy: { startedAt: "desc" },
          select: { id: true, expiresAt: true },
        });

        if (!activePaid) {
          await tx.subscription.create({
            data: {
              clinicId: clinic.id,
              status: "active",
              quotaTotal: 10,
              quotaUsed: 0,
              startedAt: now,
              expiresAt: paidEndsAt,
            },
          });
        } else {
          await tx.subscription.update({
            where: { id: activePaid.id },
            data: {
              quotaTotal: { increment: 10 },
              expiresAt: activePaid.expiresAt < paidEndsAt ? paidEndsAt : activePaid.expiresAt,
            },
          });
        }
      });

      return NextResponse.json({ ok: true, mode: "created", package: "base" }, { status: 200 });
    }

    // ✅ EXTRA: +10 lead / 1000 TL (mock)
    // Not: Extra paket yalnızca ücretli "active" aboneliğe eklenir. Trial'a eklenmez.
    const activeSub = await prisma.subscription.findFirst({
      where: { clinicId: clinic.id, status: "active", expiresAt: { gt: now } },
      orderBy: { startedAt: "desc" },
      select: { id: true },
    });

    if (!activeSub) {
      return NextResponse.json({ ok: false, code: "NO_ACTIVE_SUBSCRIPTION" }, { status: 400 });
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.paymentLog.create({
        data: {
          clinicId: clinic.id,
          kind: "extra_leads",
          amount: 1000,
          currency: "TRY",
          status: "success",
          provider: "mock",
          providerRef: `extra_${now.getTime()}`,
          payload: { quota: 10 },
        },
      });

      await tx.subscription.update({
        where: { id: activeSub.id },
        data: { quotaTotal: { increment: 10 } },
      });
    });

    return NextResponse.json({ ok: true, mode: "updated", package: "extra" }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    console.error("PAYMENT_START_ERROR:", err);
    return NextResponse.json({ ok: false, code: "PAYMENT_START_ERROR" }, { status: 500 });
  }
}