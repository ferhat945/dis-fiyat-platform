import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { notifyClinicNewLead } from "@/lib/lead-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUTO_ASSIGNMENTS = 50;

function getIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");

  if (xf) {
    return xf.split(",")[0]?.trim() || "unknown";
  }

  const xr = req.headers.get("x-real-ip");

  if (xr) {
    return xr.trim();
  }

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

type CreatedLead = {
  id: string;
  city: string;
  service: string;
  createdAt: Date;
};

type AssignedResult = {
  lead: CreatedLead;
  assigned: boolean;
  clinicId?: string;
  assignedClinicCount?: number;
};

type ApiErr = {
  ok: false;
  code: string;
  message?: string;
  issues?: unknown;
};

type ApiOk = {
  ok: true;
} & AssignedResult;

type ApiResp = ApiOk | ApiErr;

type CandidateClinic = {
  id: string;
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  lastAssignedAt: Date | null;
};

function friendlyError(code: string): string {
  switch (code) {
    case "CLINIC_NOT_FOUND":
      return "Klinik bulunamadı.";

    case "CLINIC_INACTIVE":
      return "Bu klinik şu an teklif kabul etmiyor.";

    case "SERVICE_NOT_COVERED":
      return "Bu klinik seçtiğiniz şehir veya hizmet için teklif kabul etmiyor.";

    default:
      return "Gönderim başarısız. Lütfen tekrar deneyin.";
  }
}

function isPremiumActive(clinic: CandidateClinic, now: Date): boolean {
  return Boolean(
    clinic.isPremium &&
      clinic.premiumExpiresAt &&
      clinic.premiumExpiresAt.getTime() > now.getTime()
  );
}

function rankCandidates(
  candidates: CandidateClinic[],
  now: Date
): CandidateClinic[] {
  return [...candidates].sort((a, b) => {
    const aPremium = isPremiumActive(a, now);
    const bPremium = isPremiumActive(b, now);

    if (aPremium !== bPremium) {
      return aPremium ? -1 : 1;
    }

    const aLast = a.lastAssignedAt?.getTime() ?? 0;
    const bLast = b.lastAssignedAt?.getTime() ?? 0;

    if (aLast !== bLast) {
      return aLast - bLast;
    }

    return a.id.localeCompare(b.id);
  });
}

async function createLeadSafely(opts: {
  parsed: LeadCreateInput;
  ip: string;
  ua: string;
  source: string;
}): Promise<CreatedLead> {
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
      select: {
        id: true,
        city: true,
        service: true,
        createdAt: true,
      },
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
      select: {
        id: true,
        city: true,
        service: true,
        createdAt: true,
      },
    });
  }
}

async function notifyAssignedClinics(
  clinicIds: string[],
  leadId: string
): Promise<void> {
  if (clinicIds.length === 0) {
    return;
  }

  try {
    const [clinics, lead] = await Promise.all([
      prisma.clinic.findMany({
        where: {
          id: {
            in: clinicIds,
          },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          isPremium: true,
          premiumExpiresAt: true,
        },
      }),

      prisma.lead.findUnique({
        where: {
          id: leadId,
        },
        select: {
          id: true,
          city: true,
          service: true,
          createdAt: true,
        },
      }),
    ]);

    if (!lead || clinics.length === 0) {
      return;
    }

    const now = new Date();

    const orderedClinics = [...clinics].sort((a, b) => {
      const aPremium = Boolean(
        a.isPremium &&
          a.premiumExpiresAt &&
          a.premiumExpiresAt.getTime() > now.getTime()
      );

      const bPremium = Boolean(
        b.isPremium &&
          b.premiumExpiresAt &&
          b.premiumExpiresAt.getTime() > now.getTime()
      );

      if (aPremium !== bPremium) {
        return aPremium ? -1 : 1;
      }

      return a.id.localeCompare(b.id);
    });

    const results = await Promise.allSettled(
      orderedClinics.map((clinic) =>
        notifyClinicNewLead({
          clinic: {
            id: clinic.id,
            name: clinic.name,
            email: clinic.email,
          },
          lead,
        })
      )
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          "MAIL_NOTIFY_CLINIC_FAILED:",
          orderedClinics[index]?.id,
          result.reason
        );
      }
    });
  } catch (e) {
    console.error("MAIL_NOTIFY_FAILED:", e);
  }
}

export async function POST(
  req: Request
): Promise<NextResponse<ApiResp>> {
  try {
    const ip = getIp(req);
    const ua = req.headers.get("user-agent") ?? "unknown";

    const rl = rateLimit(`lead:${ip}`, 60, 5);

    if (!rl.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "RATE_LIMIT",
          message:
            "Çok hızlı denediniz. Lütfen biraz sonra tekrar deneyin.",
        },
        {
          status: 429,
        }
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
          assignedClinicCount: 0,
        },
        {
          status: 200,
        }
      );
    }

    if (!parsed.consent) {
      return NextResponse.json(
        {
          ok: false,
          code: "CONSENT_REQUIRED",
          message: "KVKK onayı olmadan form gönderilemez.",
        },
        {
          status: 400,
        }
      );
    }

    const now = new Date();

    /*
      DOĞRUDAN KLİNİK FORMU

      Hasta belirli bir klinik profilinden talep gönderirse:
      - Klinik aktif olmalı
      - Şehir + hizmet kapsamı aktif olmalı
      - Abonelik/kota aranmaz
      - Lead kilitli atanır
      - Klinik kredi kullanarak açar
    */
    if (parsed.clinicId) {
      const clinic = await prisma.clinic.findUnique({
        where: {
          id: parsed.clinicId,
        },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!clinic) {
        return NextResponse.json(
          {
            ok: false,
            code: "CLINIC_NOT_FOUND",
            message: friendlyError("CLINIC_NOT_FOUND"),
          },
          {
            status: 400,
          }
        );
      }

      if (!clinic.isActive) {
        return NextResponse.json(
          {
            ok: false,
            code: "CLINIC_INACTIVE",
            message: friendlyError("CLINIC_INACTIVE"),
          },
          {
            status: 400,
          }
        );
      }

      const hasCoverage = await prisma.clinicCoverage.findFirst({
        where: {
          clinicId: clinic.id,
          isActive: true,
          city: parsed.city,
          service: parsed.service,
        },
        select: {
          id: true,
        },
      });

      if (!hasCoverage) {
        return NextResponse.json(
          {
            ok: false,
            code: "SERVICE_NOT_COVERED",
            message: friendlyError("SERVICE_NOT_COVERED"),
          },
          {
            status: 400,
          }
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
        await prisma.$transaction(
          async (tx: Prisma.TransactionClient) => {
            await tx.leadAssignment.create({
              data: {
                leadId: lead.id,
                clinicId: clinic.id,
                unlocked: false,
                unlockPrice: 1,
              },
            });

            await tx.clinic.update({
              where: {
                id: clinic.id,
              },
              data: {
                lastAssignedAt: now,
              },
            });

            await tx.leadDistributionLog.create({
              data: {
                leadId: lead.id,
                clinicId: clinic.id,
                city: parsed.city,
                service: parsed.service,
                assigned: true,
                reason: "direct_clinic_locked",
                details: {
                  model: "credit_unlock",
                  locked: true,
                  unlockPrice: 1,
                  subscriptionRequired: false,
                },
              },
            });
          }
        );

        assigned = true;
      } catch (e) {
        console.error("DIRECT_LEAD_ASSIGN_FAILED:", e);

        try {
          await prisma.leadDistributionLog.create({
            data: {
              leadId: lead.id,
              clinicId: clinic.id,
              city: parsed.city,
              service: parsed.service,
              assigned: false,
              reason: "direct_assignment_failed",
              details: {
                error:
                  e instanceof Error ? e.message : "UNKNOWN_ERROR",
              },
            },
          });
        } catch (logError) {
          console.error(
            "DIRECT_ASSIGNMENT_FAILURE_LOG_FAILED:",
            logError
          );
        }
      }

      if (assigned) {
        await notifyAssignedClinics([clinic.id], lead.id);
      }

      return NextResponse.json(
        {
          ok: true,
          lead,
          assigned,
          clinicId: assigned ? clinic.id : undefined,
          assignedClinicCount: assigned ? 1 : 0,
        },
        {
          status: 201,
        }
      );
    }

    /*
      GENEL TEKLİF FORMU

      - Lead önce oluşturulur
      - Aktif şehir + hizmet kapsamına sahip klinikler bulunur
      - Eski abonelik ve kota şartı aranmaz
      - Uygun kliniklere kilitli olarak atanır
      - Premium klinikler sıralamada öne alınır
      - Klinik kredi harcayarak iletişim bilgilerini açar
    */
    const lead = await createLeadSafely({
      parsed,
      ip,
      ua,
      source: parsed.source,
    });

    let assignedClinicIds: string[] = [];

    try {
      assignedClinicIds = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const candidateClinics = await tx.clinic.findMany({
            where: {
              isActive: true,
              coverages: {
                some: {
                  city: parsed.city,
                  service: parsed.service,
                  isActive: true,
                },
              },
            },
            select: {
              id: true,
              isPremium: true,
              premiumExpiresAt: true,
              lastAssignedAt: true,
            },
            take: MAX_AUTO_ASSIGNMENTS,
          });

          if (candidateClinics.length === 0) {
            await tx.leadDistributionLog.create({
              data: {
                leadId: lead.id,
                clinicId: null,
                city: parsed.city,
                service: parsed.service,
                assigned: false,
                reason: "auto_no_coverage_candidate",
                details: {
                  note:
                    "Aktif şehir + hizmet kapsamına sahip klinik bulunamadı.",
                  subscriptionRequired: false,
                },
              },
            });

            return [];
          }

          const rankedCandidates = rankCandidates(
            candidateClinics,
            now
          );

          const clinicIds = rankedCandidates.map(
            (clinic) => clinic.id
          );

          await tx.leadAssignment.createMany({
            data: rankedCandidates.map((clinic) => ({
              leadId: lead.id,
              clinicId: clinic.id,
              unlocked: false,
              unlockPrice: 1,
            })),
            skipDuplicates: true,
          });

          await tx.clinic.updateMany({
            where: {
              id: {
                in: clinicIds,
              },
            },
            data: {
              lastAssignedAt: now,
            },
          });

          for (
            let index = 0;
            index < rankedCandidates.length;
            index += 1
          ) {
            const clinic = rankedCandidates[index];
            const premiumActive = isPremiumActive(clinic, now);

            await tx.leadDistributionLog.create({
              data: {
                leadId: lead.id,
                clinicId: clinic.id,
                city: parsed.city,
                service: parsed.service,
                assigned: true,
                reason: premiumActive
                  ? "auto_distribution_premium_locked"
                  : "auto_distribution_locked",
                details: {
                  model: "multi_clinic_credit_unlock",
                  locked: true,
                  unlockPrice: 1,
                  subscriptionRequired: false,
                  premiumPriority: premiumActive,
                  priorityOrder: index + 1,
                  totalAssignedClinics:
                    rankedCandidates.length,
                },
              },
            });
          }

          return clinicIds;
        }
      );
    } catch (e) {
      console.error(
        "AUTO_DISTRIBUTION_FAILED_BUT_LEAD_CREATED:",
        e
      );

      try {
        await prisma.leadDistributionLog.create({
          data: {
            leadId: lead.id,
            clinicId: null,
            city: parsed.city,
            service: parsed.service,
            assigned: false,
            reason: "auto_distribution_failed",
            details: {
              error:
                e instanceof Error ? e.message : "UNKNOWN_ERROR",
            },
          },
        });
      } catch (logError) {
        console.error(
          "AUTO_DISTRIBUTION_FAILURE_LOG_FAILED:",
          logError
        );
      }

      assignedClinicIds = [];
    }

    if (assignedClinicIds.length > 0) {
      await notifyAssignedClinics(
        assignedClinicIds,
        lead.id
      );
    }

    return NextResponse.json(
      {
        ok: true,
        lead,
        assigned: assignedClinicIds.length > 0,
        clinicId:
          assignedClinicIds.length === 1
            ? assignedClinicIds[0]
            : undefined,
        assignedClinicCount: assignedClinicIds.length,
      },
      {
        status: 201,
      }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          code: "VALIDATION_ERROR",
          message: "Eksik veya hatalı alan var.",
          issues: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        {
          status: 400,
        }
      );
    }

    console.error("LEAD_CREATE_ERROR:", err);

    return NextResponse.json(
      {
        ok: false,
        code: "LEAD_CREATE_ERROR",
        message:
          "Gönderim başarısız. Lütfen tekrar deneyin.",
      },
      {
        status: 500,
      }
    );
  }
}