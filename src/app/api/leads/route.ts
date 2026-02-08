import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getIp(req: Request): string {
  // reverse proxy varsa x-forwarded-for gelebilir
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

const LeadCreateSchema = z
  .object({
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

    // ✅ KVKK
    consent: z.boolean(),
    consentTextVersion: z.string().min(1).max(20).optional(),

    // ✅ Honeypot (formda gizli alan)
    website: z.string().max(200).optional(),
  })
  .transform((v) => {
    const resolvedFullName = (v.fullName ?? v.name ?? "").trim();
    const whenMessage = v.when ? `Ne zaman: ${v.when}` : undefined;

    const city = v.city.toLowerCase().trim();
    const service = v.service.toLowerCase().trim();

    return {
      city,
      service,
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

type CandidateClinic = {
  id: string;
  lastAssignedAt: Date | null;
  subscriptions: {
    id: string;
    quotaTotal: number;
    quotaUsed: number;
    expiresAt: Date;
    startedAt: Date;
  }[];
};

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") ?? "unknown";

    // ✅ Rate limit: IP başına 60 sn içinde 5 istek
    const rl = rateLimit(`lead:${ip}`, 60, 5);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, code: "RATE_LIMIT", retryAfterSec: rl.retryAfterSec },
        { status: 429 }
      );
    }

    const json: unknown = await req.json();
    const parsed: LeadCreateInput = LeadCreateSchema.parse(json);

    // ✅ Honeypot doluysa bot kabul et (success döndür ama DB’ye yazma)
    if (parsed.website.length > 0) {
      return NextResponse.json({ ok: true, spam: true }, { status: 200 });
    }

    // ✅ KVKK zorunlu
    if (!parsed.consent) {
      return NextResponse.json({ ok: false, code: "CONSENT_REQUIRED" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1) Lead kaydı + KVKK + ip/ua
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

      const now = new Date();

      // 2) Aday klinikler
      const candidateClinics: CandidateClinic[] = await tx.clinic.findMany({
        where: {
          isActive: true,
          coverages: {
            some: { city: parsed.city, service: parsed.service, isActive: true },
          },
          subscriptions: {
            some: { status: "active", expiresAt: { gt: now } },
          },
        },
        select: {
          id: true,
          lastAssignedAt: true,
          subscriptions: {
            where: { status: "active", expiresAt: { gt: now } },
            orderBy: { startedAt: "desc" },
            take: 1,
            select: {
              id: true,
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
            reason: "NO_CANDIDATE_CLINIC",
            details: { note: "Aktif coverage + aktif abonelik sağlayan klinik yok." },
          },
        });
        return { lead, assigned: false as const };
      }

      const eligible = candidateClinics.filter((c: CandidateClinic) => {
        const sub = c.subscriptions[0];
        if (!sub) return false;
        return sub.quotaUsed < sub.quotaTotal;
      });

      if (eligible.length === 0) {
        await tx.leadDistributionLog.create({
          data: {
            leadId: lead.id,
            clinicId: null,
            city: parsed.city,
            service: parsed.service,
            assigned: false,
            reason: "NO_QUOTA",
            details: { candidateCount: candidateClinics.length },
          },
        });
        return { lead, assigned: false as const };
      }

      const chosen = eligible[0];
      const chosenSub = chosen.subscriptions[0];

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
          reason: "ASSIGNED",
          details: {
            subscriptionId: chosenSub.id,
            quotaBefore: chosenSub.quotaUsed,
            quotaTotal: chosenSub.quotaTotal,
          },
        },
      });

      return { lead, assigned: true as const, clinicId: chosen.id };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      );
    }

    console.error("LEAD_CREATE_ERROR:", err);
    return NextResponse.json({ ok: false, code: "LEAD_CREATE_ERROR" }, { status: 500 });
  }
}
