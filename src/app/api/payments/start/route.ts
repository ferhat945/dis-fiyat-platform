import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const StartSchema = z.object({
  package: z.enum(["base", "extra", "credit_5", "credit_10", "credit_25", "premium"]),
});

type PackageCode = z.infer<typeof StartSchema>["package"];

type StartResp =
  | {
      ok: true;
      mode: "trial" | "created" | "updated" | "credits_added" | "premium_started";
      package: PackageCode;
      creditsAdded?: number;
    }
  | { ok: false; code: string };

type CreditPackage = {
  credits: number;
  amount: number;
  kind: string;
  note: string;
};

const CREDIT_PACKAGES: Record<"credit_5" | "credit_10" | "credit_25", CreditPackage> = {
  credit_5: {
    credits: 5,
    amount: 1500,
    kind: "credit_pack_5",
    note: "5 kredi paketi",
  },
  credit_10: {
    credits: 10,
    amount: 2000,
    kind: "credit_pack_10",
    note: "10 kredi paketi",
  },
  credit_25: {
    credits: 25,
    amount: 4000,
    kind: "credit_pack_25",
    note: "25 kredi paketi",
  },
};

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function isCreditPackage(pkg: PackageCode): pkg is "credit_5" | "credit_10" | "credit_25" {
  return pkg === "credit_5" || pkg === "credit_10" || pkg === "credit_25";
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

    /*
      YENİ KREDİ PAKETLERİ
      credit_5  => 5 kredi / 1500 TL
      credit_10 => 10 kredi / 2000 TL
      credit_25 => 25 kredi / 4000 TL
    */
    if (isCreditPackage(parsed.package)) {
      const pack = CREDIT_PACKAGES[parsed.package];

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.clinic.update({
          where: { id: clinic.id },
          data: {
            creditBalance: { increment: pack.credits },
          },
        });

        await tx.creditTransaction.create({
          data: {
            clinicId: clinic.id,
            amount: pack.credits,
            type: "purchase",
            note: pack.note,
          },
        });

        await tx.paymentLog.create({
          data: {
            clinicId: clinic.id,
            kind: pack.kind,
            amount: pack.amount,
            currency: "TRY",
            status: "success",
            provider: "mock",
            providerRef: `${pack.kind}_${now.getTime()}`,
            payload: {
              package: parsed.package,
              credits: pack.credits,
              amount: pack.amount,
              mode: "credit_purchase",
            },
          },
        });
      });

      return NextResponse.json(
        {
          ok: true,
          mode: "credits_added",
          package: parsed.package,
          creditsAdded: pack.credits,
        },
        { status: 200 }
      );
    }

    /*
      YENİ PREMIUM PAKET
      premium => 2500 TL / ay + 10 kredi + premium öncelik
    */
    if (parsed.package === "premium") {
      const premiumEndsAt = addDays(now, 30);

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.clinic.update({
          where: { id: clinic.id },
          data: {
            creditBalance: { increment: 10 },
            isPremium: true,
            premiumStartedAt: now,
            premiumExpiresAt: premiumEndsAt,
            autoRenewPremium: true,
          },
        });

        await tx.creditTransaction.create({
          data: {
            clinicId: clinic.id,
            amount: 10,
            type: "premium_monthly_credit",
            note: "Premium aylık 10 kredi",
          },
        });

        await tx.paymentLog.create({
          data: {
            clinicId: clinic.id,
            kind: "premium_monthly",
            amount: 2500,
            currency: "TRY",
            status: "success",
            provider: "mock",
            providerRef: `premium_monthly_${now.getTime()}`,
            payload: {
              package: "premium",
              credits: 10,
              amount: 2500,
              premiumEndsAt: premiumEndsAt.toISOString(),
              autoRenew: true,
            },
          },
        });

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
              expiresAt: premiumEndsAt,
            },
          });
        } else {
          await tx.subscription.update({
            where: { id: activePaid.id },
            data: {
              quotaTotal: { increment: 10 },
              expiresAt: activePaid.expiresAt < premiumEndsAt ? premiumEndsAt : activePaid.expiresAt,
            },
          });
        }
      });

      return NextResponse.json(
        {
          ok: true,
          mode: "premium_started",
          package: "premium",
          creditsAdded: 10,
        },
        { status: 200 }
      );
    }

    /*
      ESKİ SİSTEMİ BOZMAMAK İÇİN KORUNDU
      base => eski aylık abonelik/trial
      extra => eski ek lead paketi
    */
    if (parsed.package === "base") {
      const hasUsedTrial = Boolean(clinic.trialUsedAt);

      if (!hasUsedTrial) {
        const trialEndsAt = addDays(now, 7);

        const out = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const updated = await tx.clinic.updateMany({
            where: { id: clinic.id, trialUsedAt: null },
            data: { trialUsedAt: now, trialEndsAt },
          });

          if (updated.count === 0) {
            return { ok: false as const, code: "TRIAL_ALREADY_USED" as const };
          }

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
              payload: {
                mode: "trial",
                days: 7,
                quota: 10,
                trialEndsAt: trialEndsAt.toISOString(),
              },
            },
          });

          return { ok: true as const };
        });

        if (!out.ok) {
          return NextResponse.json({ ok: false, code: out.code }, { status: 409 });
        }

        return NextResponse.json({ ok: true, mode: "trial", package: "base" }, { status: 200 });
      }

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
            payload: {
              mode: "paid",
              days: 30,
              quota: 10,
              paidEndsAt: paidEndsAt.toISOString(),
            },
          },
        });

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

    if (parsed.package === "extra") {
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
    }

    return NextResponse.json({ ok: false, code: "UNKNOWN_PACKAGE" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    console.error("PAYMENT_START_ERROR:", err);
    return NextResponse.json({ ok: false, code: "PAYMENT_START_ERROR" }, { status: 500 });
  }
}