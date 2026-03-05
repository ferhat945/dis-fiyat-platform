import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getSession(): Promise<{ clinicId: string; name: string; email: string } | null> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  return token ? await verifyClinicSession(token) : null;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export async function POST(): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const now = new Date();
    const trialEndsAt = addDays(now, 7);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Trial aktif mi? (subscription üzerinden)
      const activeTrialSub = await tx.subscription.findFirst({
        where: {
          clinicId: session.clinicId,
          status: "trial",
          expiresAt: { gt: now },
        },
        orderBy: { startedAt: "desc" },
        select: { id: true, expiresAt: true },
      });

      if (activeTrialSub) {
        return { mode: "already_active" as const, trialEndsAt: activeTrialSub.expiresAt };
      }

      // Trial sadece 1 kere: trialUsedAt null ise set et
      const updated = await tx.clinic.updateMany({
        where: { id: session.clinicId, trialUsedAt: null },
        data: { trialUsedAt: now, trialEndsAt },
      });

      if (updated.count === 0) {
        return { mode: "already_used" as const };
      }

      // Trial subscription oluştur (10 lead)
      await tx.subscription.create({
        data: {
          clinicId: session.clinicId,
          status: "trial",
          quotaTotal: 10,
          quotaUsed: 0,
          startedAt: now,
          expiresAt: trialEndsAt,
        },
      });

      await tx.paymentLog.create({
        data: {
          clinicId: session.clinicId,
          kind: "trial_start",
          amount: 0,
          currency: "TRY",
          status: "success",
          provider: "mock",
          providerRef: `trial_start_${now.getTime()}`,
          payload: { trialEndsAt: trialEndsAt.toISOString(), quotaTotal: 10 },
        },
      });

      return { mode: "started" as const, trialEndsAt };
    });

    if (result.mode === "already_active") {
      return NextResponse.json(
        { ok: true, code: "TRIAL_ALREADY_ACTIVE", trialEndsAt: result.trialEndsAt },
        { status: 200 }
      );
    }

    if (result.mode === "already_used") {
      return NextResponse.json({ ok: false, code: "TRIAL_ALREADY_USED" }, { status: 409 });
    }

    return NextResponse.json(
      { ok: true, code: "TRIAL_STARTED", trialEndsAt: result.trialEndsAt },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}