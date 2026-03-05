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
    // ✅ Direct clinic lead için opsiyonel
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

    email: z.string().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),

    message: z.string().max(2000).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),

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

type ApiErr = { ok: false; code: string; message?: string };
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

export async function POST(req: Request): Promise<NextResponse<ApiResp>> {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") ?? "unknown";

    const rl = rateLimit(`lead:${ip}`, 60, 5);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, code: "RATE_LIMIT", message: "Çok hızlı denediniz. Lütfen biraz sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const json: unknown = await req.json();
    const parsed: LeadCreateInput = LeadCreateSchema.parse(json);

    if (parsed.website.length > 0) {
      return NextResponse.json({ ok: true, spam: true } as unknown as ApiOk, { status: 200 });
    }

    if (!parsed.consent) {
      return NextResponse.json(
        { ok: false, code: "CONSENT_REQUIRED", message: "KVKK onayı olmadan form gönderilemez." },
        { status: 400 }
      );
    }

    const now = new Date();

    // ✅ DIRECT FLOW (clinicId varsa)
    if (parsed.clinicId) {
      // Transaction içinde: lead + assignment + quota + log
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const clinic = await tx.clinic.findUnique({
          where: { id: parsed.clinicId },
          select: { id: true, isActive: true },
        });

        if (!clinic) {
          // lead oluşturup loglamak istiyorsan burada da lead create edebilirsin,
          // ama direct flow'da kullanıcıya net hata dönmek daha doğru.
          throw new Error("CLINIC_NOT_FOUND");
        }
        if (!clinic.isActive) {
          throw new Error("CLINIC_INACTIVE");
        }

        // coverage kontrolü: bu klinik city+service veriyor mu?
        const hasCoverage = await tx.clinicCoverage.findFirst({
          where: {
            clinicId: clinic.id,
            isActive: true,
            city: parsed.city,
            service: parsed.service,
          },
          select: { id: true },
        });

        if (!hasCoverage) {
          throw new Error("SERVICE_NOT_COVERED");
        }

        // aktif/trial subscription ve kota kontrolü
        const sub = await tx.subscription.findFirst({
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
          throw new Error("NO_ACTIVE_SUBSCRIPTION");
        }
        if (sub.quotaUsed >= sub.quotaTotal) {
          throw new Error("QUOTA_EXHAUSTED");
        }

        const lead = await tx.lead.create({
          data: {
            city: parsed.city,
            service: parsed.service,
            fullName: parsed.fullName,
            phone: parsed.phone,
            email: parsed.email,
            message: parsed.message,
            intent: parsed.intent,
            source: "clinic_direct", // ✅ direct kaynağı
            consentAt: new Date(),
            consentTextVersion: parsed.consentTextVersion,
            ip,
            userAgent: ua,
          },
          select: { id: true, city: true, service: true, createdAt: true },
        });

        await tx.leadAssignment.create({
          data: { leadId: lead.id, clinicId: clinic.id },
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
            details: { subscriptionId: sub.id, subscriptionStatus: sub.status },
          },
        });

        const out: AssignedResult = { lead, assigned: true, clinicId: clinic.id };
        return out;
      });

      // mail (transaction sonrası)
      if (result.assigned && result.clinicId) {
        try {
          const clinic = await prisma.clinic.findUnique({
            where: { id: result.clinicId },
            select: { id: true, name: true, email: true },
          });

          if (clinic) {
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

            if (fullLead) {
              await notifyClinicNewLead({ clinic, lead: fullLead });
            }
          }
        } catch (e) {
          console.error("MAIL_NOTIFY_FAILED:", e);
        }
      }

      return NextResponse.json({ ok: true, ...result }, { status: 201 });
    }

    // ✅ AUTO DISTRIBUTION FLOW (mevcut mantık)
    const result: AssignedResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lead = await tx.lead.create({
        data: {
          city: parsed.city,
          service: parsed.service,
          fullName: parsed.fullName,
          phone: parsed.phone,
          email: parsed.email,
          message: parsed.message,
          intent: parsed.intent,
          source: parsed.source,
          consentAt: new Date(),
          consentTextVersion: parsed.consentTextVersion,
          ip,
          userAgent: ua,
        },
        select: { id: true, city: true, service: true, createdAt: true },
      });

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
        return { lead, assigned: false };
      }

      const eligible = candidateClinics.filter((c) => {
        const sub = c.subscriptions[0];
        return !!sub && sub.quotaUsed < sub.quotaTotal;
      });

      if (eligible.length === 0) {
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
        return { lead, assigned: false };
      }

      const chosen = eligible[0];
      const chosenSub = chosen.subscriptions[0];
      if (!chosenSub) {
        await tx.leadDistributionLog.create({
          data: {
            leadId: lead.id,
            clinicId: null,
            city: parsed.city,
            service: parsed.service,
            assigned: false,
            reason: "auto_no_subscription",
            details: { note: "Chosen clinic missing subscription row." },
          },
        });
        return { lead, assigned: false };
      }

      await tx.leadAssignment.create({
        data: { leadId: lead.id, clinicId: chosen.id },
      });

      await tx.subscription.update({
        where: { id: chosenSub.id },
        data: { quotaUsed: { increment: 1 } },
      });

      await tx.clinic.update({
        where: { id: chosen.id },
        data: { lastAssignedAt: now },
      });

      await tx.leadDistributionLog.create({
        data: {
          leadId: lead.id,
          clinicId: chosen.id,
          city: parsed.city,
          service: parsed.service,
          assigned: true,
          reason: "auto_distribution",
          details: { subscriptionId: chosenSub.id, subscriptionStatus: chosenSub.status },
        },
      });

      return { lead, assigned: true, clinicId: chosen.id };
    });

    // mail (transaction sonrası)
    if (result.assigned && result.clinicId) {
      try {
        const clinic = await prisma.clinic.findUnique({
          where: { id: result.clinicId },
          select: { id: true, name: true, email: true },
        });

        if (clinic) {
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

          if (fullLead) {
            await notifyClinicNewLead({ clinic, lead: fullLead });
          }
        }
      } catch (e) {
        console.error("MAIL_NOTIFY_FAILED:", e);
      }
    }

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    // ✅ Direct flow hataları için kullanıcıya güzel mesaj
    if (err instanceof Error) {
      const code = err.message || "LEAD_CREATE_ERROR";
      if (
        code === "CLINIC_NOT_FOUND" ||
        code === "CLINIC_INACTIVE" ||
        code === "SERVICE_NOT_COVERED" ||
        code === "NO_ACTIVE_SUBSCRIPTION" ||
        code === "QUOTA_EXHAUSTED"
      ) {
        return NextResponse.json(
          { ok: false, code, message: friendlyError(code) },
          { status: 400 }
        );
      }
    }

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
    return NextResponse.json({ ok: false, code: "LEAD_CREATE_ERROR" }, { status: 500 });
  }
}