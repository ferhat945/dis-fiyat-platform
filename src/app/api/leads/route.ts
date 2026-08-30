import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { notifyClinicNewLead } from "@/lib/lead-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Türkiye cep telefonu numarasını tek formata dönüştürür.
 *
 * Kabul edilen örnekler:
 * 0531 917 17 39
 * 05319171739
 * 5319171739
 * +905319171739
 * 00905319171739
 *
 * Veritabanına:
 * +905319171739
 *
 * formatında kaydedilir.
 *
 * NOT:
 * Bu kontrol numaranın gerçekten kullanıcıya ait olduğunu
 * kanıtlamaz. Yalnızca Türkiye mobil numara formatını doğrular.
 */
function normalizeTurkishMobilePhone(
  value: string
): string | null {
  let digits = value.replace(/\D/g, "");

  /*
   * 0090 5xx xxx xx xx
   */
  if (digits.startsWith("0090")) {
    digits = digits.slice(4);
  }

  /*
   * 90 5xx xxx xx xx
   */
  if (
    digits.startsWith("90") &&
    digits.length === 12
  ) {
    digits = digits.slice(2);
  }

  /*
   * 05xx xxx xx xx
   */
  if (
    digits.startsWith("0") &&
    digits.length === 11
  ) {
    digits = digits.slice(1);
  }

  /*
   * Bu noktada geriye tam olarak:
   *
   * 5xxxxxxxxx
   *
   * kalmalıdır.
   */
  if (!/^5\d{9}$/.test(digits)) {
    return null;
  }

  return `+90${digits}`;
}

function getIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");

  if (xf) {
    return (
      xf.split(",")[0]?.trim() ||
      "unknown"
    );
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
      .transform((v) =>
        v ? v : undefined
      ),

    city: z
      .string()
      .min(2)
      .max(64),

    service: z
      .string()
      .min(2)
      .max(64),

    fullName: z
      .string()
      .min(2)
      .max(120)
      .optional(),

    name: z
      .string()
      .min(2)
      .max(120)
      .optional(),

    /*
     * Telefon önce doğrulanır,
     * ardından +90 formatına çevrilir.
     */
    phone: z
      .string()
      .min(
        1,
        "Telefon numarası zorunludur."
      )
      .max(32)
      .refine(
        (value) =>
          normalizeTurkishMobilePhone(
            value
          ) !== null,
        {
          message:
            "Geçerli bir Türkiye cep telefonu numarası girin. Örnek: 0531 917 17 39",
        }
      )
      .transform((value) => {
        const normalized =
          normalizeTurkishMobilePhone(
            value
          );

        /*
         * refine kontrolünden sonra normalde
         * buranın null olması mümkün değildir.
         * Yine de TypeScript ve güvenlik için
         * koruma bırakıyoruz.
         */
        if (!normalized) {
          return value;
        }

        return normalized;
      }),

    email: z
      .string()
      .email()
      .optional()
      .or(z.literal(""))
      .transform((v) =>
        v ? v : undefined
      ),

    message: z
      .string()
      .max(2000)
      .optional()
      .or(z.literal(""))
      .transform((v) =>
        v ? v : undefined
      ),

    when: z
      .string()
      .max(64)
      .optional(),

    intent: z
      .string()
      .min(1)
      .max(64)
      .optional(),

    source: z
      .string()
      .max(64)
      .optional(),

    consent: z.boolean(),

    consentTextVersion: z
      .string()
      .min(1)
      .max(20)
      .optional(),

    website: z
      .string()
      .max(200)
      .optional(),
  })
  .transform((v) => {
    const resolvedFullName = (
      v.fullName ??
      v.name ??
      ""
    ).trim();

    const whenMessage = v.when
      ? `Ne zaman: ${v.when}`
      : undefined;

    return {
      clinicId: v.clinicId,

      city:
        v.city
          .toLowerCase()
          .trim(),

      service:
        v.service
          .toLowerCase()
          .trim(),

      fullName:
        resolvedFullName,

      /*
       * Buraya geldiğinde telefon zaten
       * +905xxxxxxxxx formatındadır.
       */
      phone: v.phone,

      email: v.email,

      message:
        v.message ??
        whenMessage,

      intent:
        v.intent ??
        "offer",

      source:
        v.source ??
        "web",

      consent:
        v.consent,

      consentTextVersion:
        v.consentTextVersion ??
        "v1",

      website: (
        v.website ??
        ""
      ).trim(),
    };
  })
  .refine(
    (v) =>
      v.fullName.length >= 2,
    {
      path: ["fullName"],
      message:
        "fullName is required",
    }
  );

type LeadCreateInput =
  z.infer<
    typeof LeadCreateSchema
  >;

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

type ApiResp =
  | ApiOk
  | ApiErr;

function friendlyError(
  code: string
): string {
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

async function createLeadSafely(
  opts: {
    parsed: LeadCreateInput;
    ip: string;
    ua: string;
    source: string;
  }
): Promise<CreatedLead> {
  const {
    parsed,
    ip,
    ua,
    source,
  } = opts;

  try {
    return await prisma.lead.create({
      data: {
        city:
          parsed.city,

        service:
          parsed.service,

        fullName:
          parsed.fullName,

        /*
         * Her lead artık standart:
         * +905xxxxxxxxx
         * formatında kaydedilir.
         */
        phone:
          parsed.phone,

        email:
          parsed.email,

        message:
          parsed.message,

        intent:
          parsed.intent,

        source,

        consentAt:
          new Date(),

        consentTextVersion:
          parsed.consentTextVersion,

        ip,

        userAgent:
          ua,
      },

      select: {
        id: true,
        city: true,
        service: true,
        createdAt: true,
      },
    });
  } catch (e) {
    console.error(
      "LEAD_CREATE_FULL_FAILED_TRY_FALLBACK:",
      e
    );

    return await prisma.lead.create({
      data: {
        city:
          parsed.city,

        service:
          parsed.service,

        fullName:
          parsed.fullName,

        phone:
          parsed.phone,

        email:
          parsed.email,

        message:
          parsed.message,

        intent:
          parsed.intent,

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
  if (
    clinicIds.length === 0
  ) {
    return;
  }

  try {
    const [
      clinics,
      lead,
    ] =
      await Promise.all([
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

    if (
      !lead ||
      clinics.length === 0
    ) {
      return;
    }

    const orderedClinics =
      [...clinics];

    const results =
      await Promise.allSettled(
        orderedClinics.map(
          (clinic) =>
            notifyClinicNewLead({
              clinic: {
                id:
                  clinic.id,

                name:
                  clinic.name,

                email:
                  clinic.email,
              },

              lead,
            })
        )
      );

    results.forEach(
      (result, index) => {
        if (
          result.status ===
          "rejected"
        ) {
          console.error(
            "MAIL_NOTIFY_CLINIC_FAILED:",
            orderedClinics[
              index
            ]?.id,
            result.reason
          );
        }
      }
    );
  } catch (e) {
    console.error(
      "MAIL_NOTIFY_FAILED:",
      e
    );
  }
}

export async function POST(
  req: Request
): Promise<
  NextResponse<ApiResp>
> {
  try {
    const ip =
      getIp(req);

    const ua =
      req.headers.get(
        "user-agent"
      ) ??
      "unknown";

    /*
     * Mevcut rate-limit aynen korunuyor.
     */
    const rl =
      rateLimit(
        `lead:${ip}`,
        60,
        5
      );

    if (!rl.ok) {
      return NextResponse.json(
        {
          ok: false,

          code:
            "RATE_LIMIT",

          message:
            "Çok hızlı denediniz. Lütfen biraz sonra tekrar deneyin.",
        },
        {
          status: 429,
        }
      );
    }

    const json: unknown =
      await req.json();

    /*
     * Telefon kontrolü de dahil olmak üzere
     * bütün schema doğrulamaları burada yapılır.
     */
    const parsed:
      LeadCreateInput =
        LeadCreateSchema.parse(
          json
        );

    /*
     * Honeypot aynen korunuyor.
     */
    if (
      parsed.website.length >
      0
    ) {
      return NextResponse.json(
        {
          ok: true,

          lead: {
            id: "spam",

            city:
              parsed.city,

            service:
              parsed.service,

            createdAt:
              new Date(),
          },

          assigned: false,

          assignedClinicCount:
            0,
        },
        {
          status: 200,
        }
      );
    }

    /*
     * KVKK kontrolü aynen korunuyor.
     */
    if (!parsed.consent) {
      return NextResponse.json(
        {
          ok: false,

          code:
            "CONSENT_REQUIRED",

          message:
            "KVKK onayı olmadan form gönderilemez.",
        },
        {
          status: 400,
        }
      );
    }

    const now =
      new Date();

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
      const clinic =
        await prisma.clinic.findUnique({
          where: {
            id:
              parsed.clinicId,
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

            code:
              "CLINIC_NOT_FOUND",

            message:
              friendlyError(
                "CLINIC_NOT_FOUND"
              ),
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

            code:
              "CLINIC_INACTIVE",

            message:
              friendlyError(
                "CLINIC_INACTIVE"
              ),
          },
          {
            status: 400,
          }
        );
      }

      const hasCoverage =
        await prisma
          .clinicCoverage
          .findFirst({
            where: {
              clinicId:
                clinic.id,

              isActive:
                true,

              city:
                parsed.city,

              service:
                parsed.service,
            },

            select: {
              id: true,
            },
          });

      if (!hasCoverage) {
        return NextResponse.json(
          {
            ok: false,

            code:
              "SERVICE_NOT_COVERED",

            message:
              friendlyError(
                "SERVICE_NOT_COVERED"
              ),
          },
          {
            status: 400,
          }
        );
      }

      const lead =
        await createLeadSafely({
          parsed,
          ip,
          ua,

          source:
            "clinic_direct",
        });

      let assigned =
        false;

      try {
        await prisma.$transaction(
          async (
            tx: Prisma.TransactionClient
          ) => {
            await tx.leadAssignment.create({
              data: {
                leadId:
                  lead.id,

                clinicId:
                  clinic.id,

                unlocked:
                  false,

                unlockPrice:
                  1,
              },
            });

            await tx.clinic.update({
              where: {
                id:
                  clinic.id,
              },

              data: {
                lastAssignedAt:
                  now,
              },
            });

            await tx.leadDistributionLog.create(
              {
                data: {
                  leadId:
                    lead.id,

                  clinicId:
                    clinic.id,

                  city:
                    parsed.city,

                  service:
                    parsed.service,

                  assigned:
                    true,

                  reason:
                    "direct_clinic_locked",

                  details: {
                    model:
                      "credit_unlock",

                    locked:
                      true,

                    unlockPrice:
                      1,

                    subscriptionRequired:
                      false,
                  },
                },
              }
            );
          }
        );

        assigned =
          true;
      } catch (e) {
        console.error(
          "DIRECT_LEAD_ASSIGN_FAILED:",
          e
        );

        try {
          await prisma
            .leadDistributionLog
            .create({
              data: {
                leadId:
                  lead.id,

                clinicId:
                  clinic.id,

                city:
                  parsed.city,

                service:
                  parsed.service,

                assigned:
                  false,

                reason:
                  "direct_assignment_failed",

                details: {
                  error:
                    e instanceof
                    Error
                      ? e.message
                      : "UNKNOWN_ERROR",
                },
              },
            });
        } catch (
          logError
        ) {
          console.error(
            "DIRECT_ASSIGNMENT_FAILURE_LOG_FAILED:",
            logError
          );
        }
      }

      if (assigned) {
        await notifyAssignedClinics(
          [clinic.id],
          lead.id
        );
      }

      return NextResponse.json(
        {
          ok: true,

          lead,

          assigned,

          clinicId:
            assigned
              ? clinic.id
              : undefined,

          assignedClinicCount:
            assigned
              ? 1
              : 0,
        },
        {
          status: 201,
        }
      );
    }

    /*
      GENEL TEKLİF FORMU — FCFS MARKETPLACE

      - Lead yalnızca bir kez oluşturulur.
      - Kliniklere önceden LeadAssignment oluşturulmaz.
      - Premium / standart dağıtım sıralaması yapılmaz.
      - lastAssignedAt güncellenmez.
      - Şehir + hizmet kapsamı uygun kliniklere bildirim gider.
      - Klinikler lead'i marketplace panelinde kilitli görür.
      - İlk 3 uygun klinik kredi kullanarak satın alabilir.
      - LeadAssignment yalnızca başarılı satın alma sırasında oluşturulur.
    */
    const lead = await createLeadSafely({
      parsed,
      ip,
      ua,
      source: parsed.source,
    });

    /*
     * Lead'in FCFS marketplace'e oluşturulduğunu logla.
     * Log yazılamazsa lead'i kaybetmiyoruz.
     */
    try {
      await prisma.leadDistributionLog.create({
        data: {
          leadId: lead.id,
          clinicId: null,
          city: parsed.city,
          service: parsed.service,
          assigned: false,
          reason: "fcfs_marketplace_created",
          details: {
            model: "fcfs_marketplace",
            maxPurchases: 3,
            unlockPrice: 1,
            assignmentCreatedOnPurchase: true,
          },
        },
      });
    } catch (logError) {
      console.error(
        "FCFS_MARKETPLACE_LOG_FAILED:",
        logError
      );
    }

    /*
     * FCFS modelinde bildirim assignment'a değil kapsama gider.
     * Aktif şehir + hizmet kapsamına sahip klinikler
     * yeni lead bildirimini alır ve yarış başlar.
     */
    try {
      const coverages = await prisma.clinicCoverage.findMany({
        where: {
          city: parsed.city,
          service: parsed.service,
          isActive: true,
          clinic: {
            isActive: true,
          },
        },
        select: {
          clinicId: true,
        },
        take: 50,
      });

      const coverageClinicIds = Array.from(
        new Set(coverages.map((coverage) => coverage.clinicId))
      );

      if (coverageClinicIds.length > 0) {
        await notifyAssignedClinics(
          coverageClinicIds,
          lead.id
        );
      }
    } catch (notifyError) {
      console.error(
        "FCFS_MARKETPLACE_NOTIFY_FAILED:",
        notifyError
      );
    }

    return NextResponse.json(
      {
        ok: true,
        lead,
        assigned: false,
        assignedClinicCount: 0,
      },
      {
        status: 201,
      }
    );
  } catch (err: unknown) {
    if (
      err instanceof
      z.ZodError
    ) {
      const phoneIssue =
        err.issues.find(
          (issue) =>
            issue.path[0] ===
            "phone"
        );

      /*
       * Telefon hatası varsa kullanıcıya
       * doğrudan anlaşılır mesaj gönderiyoruz.
       */
      const message =
        phoneIssue?.message ??
        "Eksik veya hatalı alan var.";

      return NextResponse.json(
        {
          ok: false,

          code:
            "VALIDATION_ERROR",

          message,

          issues:
            err.issues.map(
              (issue) => ({
                path:
                  issue.path.join(
                    "."
                  ),

                message:
                  issue.message,
              })
            ),
        },
        {
          status: 400,
        }
      );
    }

    console.error(
      "LEAD_CREATE_ERROR:",
      err
    );

    return NextResponse.json(
      {
        ok: false,

        code:
          "LEAD_CREATE_ERROR",

        message:
          "Gönderim başarısız. Lütfen tekrar deneyin.",
      },
      {
        status: 500,
      }
    );
  }
}