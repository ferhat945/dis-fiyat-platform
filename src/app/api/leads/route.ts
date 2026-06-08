import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { notifyClinicNewLead } from "@/lib/lead-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

const LeadCreateSchema = z
  .object({
    clinicId: z
      .string()
      .min(10)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),

    city: z.string().min(2).max(64),
    service: z.string().min(2).max(64),

    fullName: z.string().min(2).max(120).optional(),
    name: z.string().min(2).max(120).optional(),

    phone: z.string().min(6).max(32),

    email: z
      .string()
      .email()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),

    message: z
      .string()
      .max(2000)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : undefined)),

    when: z.string().max(64).optional(),

    intent: z.string().min(1).max(64).optional(),
    source: z.string().max(64).optional(),

    consent: z.boolean(),
    consentTextVersion: z.string().min(1).max(20).optional(),

    website: z.string().max(200).optional(),
  })
  .transform((v) => {
    const resolvedFullName = (v.fullName ?? v.name ?? "").trim();
    const whenMessage = v.when ? `Ne zaman: ${v.when}` : undefined;

    return {
      clinicId: v.clinicId,
      city: v.city.toLowerCase().trim(),
      service: v.service.toLowerCase().trim(),
      fullName: resolvedFullName,
      phone: v.phone.trim(),
      email: v.email,
      message: v.message ?? whenMessage,
      intent: v.intent ?? "offer",
      source: v.source ?? "web",
      consent: v.consent,
      consentTextVersion: v.consentTextVersion ?? "v1",
      website: (v.website ?? "").trim(),
    };
  })
  .refine((v) => v.fullName.length >= 2, {
    path: ["fullName"],
    message: "fullName is required",
  });

type LeadCreateInput = z.infer<typeof LeadCreateSchema>;

type AssignedResult = {
  lead: {
    id: string;
    city: string;
    service: string;
    createdAt: Date;
  };
  assigned: boolean;
  clinicId?: string;
};

type ApiErr = { ok: false; code: string; message?: string; issues?: unknown };
type ApiOk = { ok: true } & AssignedResult;
type ApiResp = ApiOk | ApiErr;

function friendlyError(code: string): string {
  switch (code) {
    case "CLINIC_NOT_FOUND":
      return "Klinik bulunamadı.";
    case "CLINIC_INACTIVE":
      return "Bu klinik şu an teklif kabul etmiyor.";
    case "SERVICE_NOT_COVERED":
      return "Bu klinik seçtiğiniz şehir/işlem için teklif kabul etmiyor.";
    case "NO_ACTIVE_SUBSCRIPTION":
      return "Bu klinik şu an teklif kabul etmiyor (abonelik yok).";
    case "QUOTA_EXHAUSTED":
      return "Bu kliniğin lead kotası dolmuş. Lütfen başka kliniklerden teklif alın.";
    default:
      return "Gönderim başarısız. Lütfen tekrar deneyin.";
  }
}

async function createLeadSafely(opts: {
  parsed: LeadCreateInput;
  ip: string;
  ua: string;
  source: string;
}): Promise<AssignedResult["lead"]> {
  const { parsed, ip, ua, source } = opts;

  try {
    return await prisma.lead.create({
      data: {
        city: parsed.city,
        service: parsed.service,
        fullName: parsed.fullName,
        phone: parsed.phone,
        email: parsed.email,
        message: parsed.message,
        intent: parsed.intent,
        source,
        consentAt: new Date(),
        consentTextVersion: parsed.consentTextVersion,
        ip,
        userAgent: ua,
      },
      select: { id: true, city: true, service: true, createdAt: true },
    });
  } catch (e) {
    console.error("LEAD_CREATE_FULL_FAILED_TRY_FALLBACK:", e);

    return await prisma.lead.create({
      data: {
        city: parsed.city,
        service: parsed.service,
        fullName: parsed.fullName,
        phone: parsed.phone,
        email: parsed.email,
        message: parsed.message,
        intent: parsed.intent,
        source,
      },
      select: { id: true, city: true, service: true, createdAt: true },
    });
  }
}

async function safeNotifyClinic(result: AssignedResult): Promise<void> {
  if (!result.assigned || !result.clinicId) return;

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: result.clinicId },
      select: { id: true, name: true, email: true },
    });

    if (!clinic) return;

    const fullLead = await prisma.lead.findUnique({
      where: { id: result.lead.id },
      select: {
        id: true,
        city: true,
        service: true,
        fullName: true,
        phone: true,
        message: true,
        createdAt: true,
      },
    });

    if (!fullLead) return;

    await notifyClinicNewLead({ clinic, lead: fullLead });
  } catch (e) {
    console.error("MAIL_NOTIFY_FAILED:", e);
  }
}

export async function POST(req: Request): Promise<NextResponse<ApiResp>> {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") ?? "unknown";

    const rl = rateLimit(`lead:${ip}`, 60, 5);
    if (!rl.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "RATE_LIMIT",
          message: "Çok hızlı denediniz. Lütfen biraz sonra tekrar deneyin.",
        },
        { status: 429 }
      );
    }

    const json: unknown = await req.json();
    const parsed: LeadCreateInput = LeadCreateSchema.parse(json);

    if (parsed.website.length > 0) {
      return NextResponse.json(
        {
          ok: true,
          lead: {
            id: "spam",
            city: parsed.city,
            service: parsed.service,
            createdAt: new Date(),
          },
          assigned: false,
        },
        { status: 200 }
      );
    }

    if (!parsed.consent) {
      return NextResponse.json(
        {
          ok: false,
          code: "CONSENT_REQUIRED",
          message: "KVKK onayı olmadan form gönderilemez.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (parsed.clinicId) {
      const clinic = await prisma.clinic.findUnique({
        where: { id: parsed.clinicId },
        select: { id: true, isActive: true },
      });

      if (!clinic) {
        return NextResponse.json(
          { ok: false, code: "CLINIC_NOT_FOUND", message: friendlyError("CLINIC_NOT_FOUND") },
          { status: 400 }
        );
      }

      if (!clinic.isActive) {
        return NextResponse.json(
          { ok: false, code: "CLINIC_INACTIVE", message: friendlyError("CLINIC_INACTIVE") },
          { status: 400 }
        );
      }

      const hasCoverage = await prisma.clinicCoverage.findFirst({
        where: {
          clinicId: clinic.id,
          isActive: true,
          city: parsed.city,
          service: parsed.service,
        },
        select: { id: true },
      });

      if (!hasCoverage) {
        return NextResponse.json(
          {
            ok: false,
            code: "SERVICE_NOT_COVERED",
            message: friendlyError("SERVICE_NOT_COVERED"),
          },
          { status: 400 }
        );
      }

      const sub = await prisma.subscription.findFirst({
        where: {
          clinicId: clinic.id,
          status: { in: ["active", "trial"] },
          expiresAt: { gt: now },
        },
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          status: true,
          quotaTotal: true,
          quotaUsed: true,
          expiresAt: true,
        },
      });

      if (!sub) {
        return NextResponse.json(
          {
            ok: false,
            code: "NO_ACTIVE_SUBSCRIPTION",
            message: friendlyError("NO_ACTIVE_SUBSCRIPTION"),
          },
          { status: 400 }
        );
      }

      if (sub.quotaUsed >= sub.quotaTotal) {
        return NextResponse.json(
          {
            ok: false,
            code: "QUOTA_EXHAUSTED",
            message: friendlyError("QUOTA_EXHAUSTED"),
          },
          { status: 400 }
        );
      }

      const lead = await createLeadSafely({
        parsed,
        ip,
        ua,
        source: "clinic_direct",
      });

      let assigned = false;

      try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await tx.leadAssignment.create({
            data: {
              leadId: lead.id,
              clinicId: clinic.id,
              unlocked: false,
              unlockPrice: 1,
            },
          });

          await tx.subscription.update({
            where: { id: sub.id },
            data: { quotaUsed: { increment: 1 } },
          });

          await tx.clinic.update({
            where: { id: clinic.id },
            data: { lastAssignedAt: now },
          });

          await tx.leadDistributionLog.create({
            data: {
              leadId: lead.id,
              clinicId: clinic.id,
              city: parsed.city,
              service: parsed.service,
              assigned: true,
              reason: "direct_clinic",
              details: {
                subscriptionId: sub.id,
                subscriptionStatus: sub.status,
                locked: true,
                unlockPrice: 1,
              },
            },
          });
        });

        assigned = true;
      } catch (e) {
        console.error("DIRECT_LEAD_ASSIGN_FAILED:", e);
      }

      const result: AssignedResult = {
        lead,
        assigned,
        clinicId: assigned ? clinic.id : undefined,
      };

      await safeNotifyClinic(result);

      return NextResponse.json({ ok: true, ...result }, { status: 201 });
    }

    const lead = await createLeadSafely({
      parsed,
      ip,
      ua,
      source: parsed.source,
    });

    let result: AssignedResult = { lead, assigned: false };

    try {
      const assignedResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const candidateClinics = await tx.clinic.findMany({
          where: {
            isActive: true,
            coverages: {
              some: { city: parsed.city, service: parsed.service, isActive: true },
            },
            subscriptions: {
              some: {
                status: { in: ["active", "trial"] },
                expiresAt: { gt: now },
              },
            },
          },
          select: {
            id: true,
            lastAssignedAt: true,
            isPremium: true,
            premiumExpiresAt: true,
            subscriptions: {
              where: {
                status: { in: ["active", "trial"] },
                expiresAt: { gt: now },
              },
              orderBy: { startedAt: "desc" },
              take: 1,
              select: {
                id: true,
                status: true,
                quotaTotal: true,
                quotaUsed: true,
                expiresAt: true,
                startedAt: true,
              },
            },
          },
          orderBy: [{ lastAssignedAt: "asc" }, { id: "asc" }],
          take: 50,
        });

        if (candidateClinics.length === 0) {
          try {
            await tx.leadDistributionLog.create({
              data: {
                leadId: lead.id,
                clinicId: null,
                city: parsed.city,
                service: parsed.service,
                assigned: false,
                reason: "auto_no_candidate",
                details: { note: "No clinics matched coverage+subscription." },
              },
            });
          } catch (e) {
            console.error("AUTO_NO_CANDIDATE_LOG_FAILED:", e);
          }

          return { lead, assigned: false };
        }

        const eligible = candidateClinics.filter((c) => {
          const sub = c.subscriptions[0];
          return !!sub && sub.quotaUsed < sub.quotaTotal;
        });

        if (eligible.length === 0) {
          try {
            await tx.leadDistributionLog.create({
              data: {
                leadId: lead.id,
                clinicId: null,
                city: parsed.city,
                service: parsed.service,
                assigned: false,
                reason: "auto_no_quota",
                details: { note: "Clinics matched but quotas exhausted." },
              },
            });
          } catch (e) {
            console.error("AUTO_NO_QUOTA_LOG_FAILED:", e);
          }

          return { lead, assigned: false };
        }

        const premiumEligible = eligible.filter(
          (c) => c.isPremium && c.premiumExpiresAt && c.premiumExpiresAt.getTime() > now.getTime()
        );

        const normalEligible = eligible.filter(
          (c) => !c.isPremium || !c.premiumExpiresAt || c.premiumExpiresAt.getTime() <= now.getTime()
        );

        const chosen = premiumEligible.length > 0 ? premiumEligible[0] : normalEligible[0];

        if (!chosen) {
          return { lead, assigned: false };
        }

        const chosenSub = chosen.subscriptions[0];

        if (!chosenSub) {
          return { lead, assigned: false };
        }

        await tx.leadAssignment.create({
          data: {
            leadId: lead.id,
            clinicId: chosen.id,
            unlocked: false,
            unlockPrice: 1,
          },
        });

        await tx.subscription.update({
          where: { id: chosenSub.id },
          data: { quotaUsed: { increment: 1 } },
        });

        await tx.clinic.update({
          where: { id: chosen.id },
          data: { lastAssignedAt: now },
        });

        try {
          await tx.leadDistributionLog.create({
            data: {
              leadId: lead.id,
              clinicId: chosen.id,
              city: parsed.city,
              service: parsed.service,
              assigned: true,
              reason: premiumEligible.length > 0 ? "auto_distribution_premium_priority" : "auto_distribution",
              details: {
                subscriptionId: chosenSub.id,
                subscriptionStatus: chosenSub.status,
                locked: true,
                unlockPrice: 1,
                premiumPriorityUsed: premiumEligible.length > 0,
              },
            },
          });
        } catch (e) {
          console.error("AUTO_DISTRIBUTION_LOG_FAILED:", e);
        }

        return { lead, assigned: true, clinicId: chosen.id };
      });

      result = assignedResult;
    } catch (e) {
      console.error("AUTO_DISTRIBUTION_FAILED_BUT_LEAD_CREATED:", e);
      result = { lead, assigned: false };
    }

    await safeNotifyClinic(result);

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Eksik/hatalı alan var.",
          issues: err.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("LEAD_CREATE_ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        code: "LEAD_CREATE_ERROR",
        message: "Gönderim başarısız. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}