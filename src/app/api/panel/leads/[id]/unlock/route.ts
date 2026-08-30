import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MARKETPLACE_MAX_PURCHASES = 3;
const MARKETPLACE_MAX_AGE_DAYS = 14;
const DEFAULT_MARKETPLACE_PRICE = 1;

type UnlockResult =
  | {
      ok: true;
      alreadyUnlocked: boolean;
      unlockPrice: number;
      balanceAfter?: number;
      unlockCount?: number;
      maxPurchases?: number;
    }
  | {
      ok: false;
      code: string;
    };

async function getParamId(
  req: Request,
  ctx: unknown
): Promise<string> {
  const anyCtx =
    ctx as {
      params?: unknown;
    };

  if (anyCtx?.params) {
    const p =
      anyCtx.params as unknown;

    if (
      typeof (
        p as {
          then?: unknown;
        }
      )?.then === "function"
    ) {
      const resolved =
        (await p) as {
          id?: string;
        };

      if (
        typeof resolved?.id ===
          "string" &&
        resolved.id.trim()
      ) {
        return resolved.id.trim();
      }
    }

    const obj =
      p as {
        id?: string;
      };

    if (
      typeof obj?.id ===
        "string" &&
      obj.id.trim()
    ) {
      return obj.id.trim();
    }
  }

  const url =
    new URL(req.url);

  const parts =
    url.pathname
      .split("/")
      .filter(Boolean);

  return (
    parts[
      parts.length - 2
    ]?.trim() ?? ""
  );
}

function marketplaceCutoff(): Date {
  return new Date(
    Date.now() -
      MARKETPLACE_MAX_AGE_DAYS *
        24 *
        60 *
        60 *
        1000
  );
}

/*
 * ============================================================
 * DIRECT CLINIC LEAD
 * ============================================================
 *
 * Hasta belirli bir klinik profilinden talep bıraktığında
 * eski/direct akışta o klinik için unlocked:false assignment
 * zaten oluşturulmuş olur.
 *
 * Bu lead:
 *
 * - marketplace değildir
 * - 3 klinik sınırına girmez
 * - unlockCount artırılmaz
 * - sadece assignment sahibi klinik açabilir
 */
async function unlockDirectLead(
  tx: Prisma.TransactionClient,
  opts: {
    leadId: string;
    clinicId: string;
    assignmentId: string;
    unlockPrice: number;
  }
): Promise<UnlockResult> {
  const {
    leadId,
    clinicId,
    assignmentId,
  } = opts;

  const price =
    Math.max(
      1,
      opts.unlockPrice
    );

  /*
   * İlk atomik kapı:
   *
   * unlocked:false -> true
   *
   * Aynı direct lead iki sekmeden aynı anda açılırsa
   * yalnızca bir istek count=1 alabilir.
   *
   * Sonraki istek count=0 alır ve kredi düşmez.
   */
  const assignmentUpdate =
    await tx.leadAssignment.updateMany({
      where: {
        id: assignmentId,
        clinicId,
        leadId,
        unlocked: false,
      },

      data: {
        unlocked: true,
        unlockedAt: new Date(),
        status: "new",
      },
    });

  if (
    assignmentUpdate.count !==
    1
  ) {
    const current =
      await tx.leadAssignment.findFirst({
        where: {
          id: assignmentId,
          clinicId,
          leadId,
        },

        select: {
          unlocked: true,
          unlockPrice: true,
        },
      });

    if (current?.unlocked) {
      return {
        ok: true,
        alreadyUnlocked: true,
        unlockPrice:
          Math.max(
            1,
            current.unlockPrice ??
              price
          ),
      };
    }

    return {
      ok: false,
      code:
        "DIRECT_UNLOCK_CONFLICT",
    };
  }

  /*
   * Kredi de atomik düşürülür.
   *
   * creditBalance >= price şartı aynı UPDATE içinde olduğu için
   * paralel işlemler bakiyeyi eksiye düşüremez.
   */
  const creditUpdate =
    await tx.clinic.updateMany({
      where: {
        id: clinicId,

        creditBalance: {
          gte: price,
        },
      },

      data: {
        creditBalance: {
          decrement: price,
        },
      },
    });

  if (
    creditUpdate.count !==
    1
  ) {
    /*
     * Transaction callback'i normal return ederse yukarıdaki
     * assignment update commit olur.
     *
     * Bu nedenle NO_CREDIT durumunda exception atarak
     * transaction'ın tamamını rollback ettiriyoruz.
     */
    throw new NoCreditError();
  }

  /*
   * Clinic satırı UPDATE nedeniyle transaction boyunca
   * kilitli olduğundan burada okuduğumuz bakiye bu işlemin
   * gerçek işlem-sonrası bakiyesidir.
   */
  const clinicAfter =
    await tx.clinic.findUnique({
      where: {
        id: clinicId,
      },

      select: {
        creditBalance: true,
      },
    });

  if (!clinicAfter) {
    throw new Error(
      "CLINIC_NOT_FOUND_AFTER_CREDIT_UPDATE"
    );
  }

  const balanceAfter =
    clinicAfter.creditBalance;

  const balanceBefore =
    balanceAfter + price;

  await tx.creditTransaction.create({
    data: {
      clinicId,

      amount: -price,

      type: "lead_unlock",

      note:
        `Direct lead açıldı: ${leadId}`,

      balanceBefore,
      balanceAfter,
      deliveredAt: new Date(),
    },
  });

  return {
    ok: true,
    alreadyUnlocked: false,
    unlockPrice: price,
    balanceAfter,
  };
}

/*
 * ============================================================
 * MARKETPLACE LEAD
 * ============================================================
 */
async function unlockMarketplaceLead(
  tx: Prisma.TransactionClient,
  opts: {
    leadId: string;
    clinicId: string;
  }
): Promise<UnlockResult> {
  const {
    leadId,
    clinicId,
  } = opts;

  const price =
    DEFAULT_MARKETPLACE_PRICE;

  /*
   * Daha önce gerçekten satın almış mı?
   *
   * unlocked:false eski dağıtım kayıtları satın alma değildir.
   */
  const purchasedBefore =
    await tx.leadAssignment.findFirst({
      where: {
        leadId,
        clinicId,
        unlocked: true,
      },

      select: {
        id: true,
        unlockPrice: true,
      },
    });

  if (purchasedBefore) {
    const currentLead =
      await tx.lead.findUnique({
        where: {
          id: leadId,
        },

        select: {
          unlockCount: true,
        },
      });

    return {
      ok: true,
      alreadyUnlocked: true,

      unlockPrice:
        Math.max(
          1,
          purchasedBefore.unlockPrice ??
            price
        ),

      unlockCount:
        currentLead?.unlockCount,

      maxPurchases:
        MARKETPLACE_MAX_PURCHASES,
    };
  }

  /*
   * Marketplace lead'inin gerçekten yeni FCFS sistemiyle
   * oluşturulduğunu doğruluyoruz.
   *
   * Böylece eski lead'ler yanlışlıkla satılamaz.
   */
  const lead =
    await tx.lead.findFirst({
      where: {
        id: leadId,

        createdAt: {
          gte:
            marketplaceCutoff(),
        },

        source: {
          not:
            "clinic_direct",
        },

        distributionLogs: {
          some: {
            reason:
              "fcfs_marketplace_created",
          },
        },
      },

      select: {
        id: true,
        city: true,
        service: true,
        unlockCount: true,
      },
    });

  if (!lead) {
    return {
      ok: false,
      code:
        "LEAD_NOT_AVAILABLE",
    };
  }

  /*
   * Klinik bu şehir + hizmet için gerçekten yetkili mi?
   *
   * UI'da görünmüş olması tek başına yeterli değildir.
   * Backend de tekrar kontrol eder.
   */
  const coverage =
    await tx.clinicCoverage.findFirst({
      where: {
        clinicId,

        city: lead.city,
        service: lead.service,

        isActive: true,

        clinic: {
          isActive: true,
        },
      },

      select: {
        id: true,
      },
    });

  if (!coverage) {
    return {
      ok: false,
      code:
        "SERVICE_NOT_COVERED",
    };
  }

  /*
   * ========================================================
   * ATOMİK 3 KONTENJAN KAPISI
   * ========================================================
   *
   * Tek SQL UPDATE:
   *
   * WHERE id = leadId
   * AND unlockCount < 3
   *
   * başarılıysa:
   * unlockCount = unlockCount + 1
   *
   * MySQL satır kilidi sayesinde aynı anda 10 klinik bassa bile
   * yalnızca ilk 3 işlem bu şarttan geçebilir.
   */
  const slotReservation =
    await tx.lead.updateMany({
      where: {
        id: leadId,

        unlockCount: {
          lt:
            MARKETPLACE_MAX_PURCHASES,
        },
      },

      data: {
        unlockCount: {
          increment: 1,
        },
      },
    });

  if (
    slotReservation.count !==
    1
  ) {
    return {
      ok: false,
      code:
        "LEAD_SOLD_OUT",
    };
  }

  /*
   * Kredi atomik olarak düşülür.
   *
   * Bakiye kontrolü ile düşüm aynı UPDATE içindedir.
   * Bu nedenle iki paralel istek aynı bakiyeyi okuyup
   * bakiyeyi eksiye indiremez.
   */
  const creditUpdate =
    await tx.clinic.updateMany({
      where: {
        id: clinicId,

        isActive: true,

        creditBalance: {
          gte: price,
        },
      },

      data: {
        creditBalance: {
          decrement: price,
        },
      },
    });

  if (
    creditUpdate.count !==
    1
  ) {
    /*
     * Slot rezervasyonu yapılmıştı.
     *
     * Exception atıyoruz ki bütün transaction rollback olsun:
     *
     * unlockCount artışı da geri alınır.
     */
    throw new NoCreditError();
  }

  const clinicAfter =
    await tx.clinic.findUnique({
      where: {
        id: clinicId,
      },

      select: {
        creditBalance: true,
      },
    });

  if (!clinicAfter) {
    throw new Error(
      "CLINIC_NOT_FOUND_AFTER_CREDIT_UPDATE"
    );
  }

  const balanceAfter =
    clinicAfter.creditBalance;

  const balanceBefore =
    balanceAfter + price;

  /*
   * Eski sistemden unlocked:false hayalet assignment varsa
   * yeni satır oluşturmuyoruz; mevcut kaydı gerçek satın almaya
   * dönüştürüyoruz.
   *
   * Yeni FCFS lead'inde normalde assignment hiç olmayacaktır.
   */
  const legacyAssignment =
    await tx.leadAssignment.findFirst({
      where: {
        leadId,
        clinicId,
        unlocked: false,
      },

      select: {
        id: true,
      },
    });

  if (legacyAssignment) {
    await tx.leadAssignment.update({
      where: {
        id:
          legacyAssignment.id,
      },

      data: {
        unlocked: true,
        unlockedAt: new Date(),
        unlockPrice: price,
        status: "new",
      },
    });
  } else {
    /*
     * @@unique([leadId, clinicId]) aynı kliniğin aynı lead'i
     * ikinci kez satın almasını DB seviyesinde de engeller.
     */
    await tx.leadAssignment.create({
      data: {
        leadId,
        clinicId,

        unlocked: true,
        unlockedAt: new Date(),

        unlockPrice: price,
        status: "new",
      },
    });
  }

  await tx.creditTransaction.create({
    data: {
      clinicId,

      amount: -price,

      type: "lead_unlock",

      note:
        `Marketplace lead satın alındı: ${leadId}`,

      balanceBefore,
      balanceAfter,

      deliveredAt: new Date(),
    },
  });

  /*
   * Transaction içindeki artırılmış güncel sayacı al.
   */
  const updatedLead =
    await tx.lead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        unlockCount: true,
      },
    });

  return {
    ok: true,
    alreadyUnlocked: false,

    unlockPrice: price,
    balanceAfter,

    unlockCount:
      updatedLead?.unlockCount,

    maxPurchases:
      MARKETPLACE_MAX_PURCHASES,
  };
}

/*
 * NO_CREDIT durumunda transaction rollback gerekir.
 *
 * Normal bir result dönmek yerine özel error kullanmamızın nedeni bu.
 */
class NoCreditError extends Error {
  constructor() {
    super("NO_CREDIT");
    this.name =
      "NoCreditError";
  }
}

export async function POST(
  req: Request,
  ctx: unknown
): Promise<NextResponse> {
  try {
    const token =
      (
        await cookies()
      ).get(
        "clinic_session"
      )?.value ?? "";

    const session =
      token
        ? await verifyClinicSession(
            token
          )
        : null;

    if (!session) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "UNAUTHORIZED_CLINIC",
        },
        {
          status: 401,
        }
      );
    }

    const leadId =
      await getParamId(
        req,
        ctx
      );

    if (!leadId) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "MISSING_ID",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Önce lead'in direct mi marketplace mi olduğunu
     * belirliyoruz.
     */
    const lead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },

        select: {
          id: true,
          source: true,
        },
      });

    if (!lead) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "LEAD_NOT_FOUND",
        },
        {
          status: 404,
        }
      );
    }

    let result:
      UnlockResult;

    /*
     * ======================================================
     * DIRECT CLINIC
     * ======================================================
     */
    if (
      lead.source ===
      "clinic_direct"
    ) {
      const directAssignment =
        await prisma.leadAssignment.findFirst({
          where: {
            leadId,
            clinicId:
              session.clinicId,
          },

          select: {
            id: true,
            unlocked: true,
            unlockPrice: true,
          },
        });

      /*
       * Başka kliniğin direct lead'ine erişim yok.
       */
      if (!directAssignment) {
        return NextResponse.json(
          {
            ok: false,
            code:
              "FORBIDDEN_NOT_YOURS",
          },
          {
            status: 403,
          }
        );
      }

      if (
        directAssignment.unlocked
      ) {
        return NextResponse.json(
          {
            ok: true,
            alreadyUnlocked: true,

            unlockPrice:
              Math.max(
                1,
                directAssignment.unlockPrice ??
                  1
              ),
          },
          {
            status: 200,
          }
        );
      }

      try {
        result =
          await prisma.$transaction(
            (
              tx:
                Prisma.TransactionClient
            ) =>
              unlockDirectLead(
                tx,
                {
                  leadId,

                  clinicId:
                    session.clinicId,

                  assignmentId:
                    directAssignment.id,

                  unlockPrice:
                    directAssignment.unlockPrice,
                }
              )
          );
      } catch (error) {
        if (
          error instanceof
          NoCreditError
        ) {
          return NextResponse.json(
            {
              ok: false,
              code:
                "NO_CREDIT",
            },
            {
              status: 402,
            }
          );
        }

        throw error;
      }
    } else {
      /*
       * ====================================================
       * MARKETPLACE
       * ====================================================
       */
      try {
        result =
          await prisma.$transaction(
            (
              tx:
                Prisma.TransactionClient
            ) =>
              unlockMarketplaceLead(
                tx,
                {
                  leadId,

                  clinicId:
                    session.clinicId,
                }
              )
          );
      } catch (error) {
        if (
          error instanceof
          NoCreditError
        ) {
          return NextResponse.json(
            {
              ok: false,
              code:
                "NO_CREDIT",
            },
            {
              status: 402,
            }
          );
        }

        /*
         * Aynı klinik aynı lead'i iki paralel request ile
         * satın almaya çalışırsa composite unique koruması
         * ikinci transaction'ı P2002 ile rollback ettirebilir.
         *
         * İlk işlem gerçekten tamamlandıysa kullanıcıya hata
         * göstermek yerine alreadyUnlocked dönüyoruz.
         */
        if (
          error instanceof
            Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const existing =
            await prisma.leadAssignment.findFirst({
              where: {
                leadId,
                clinicId:
                  session.clinicId,
                unlocked: true,
              },

              select: {
                unlockPrice: true,
              },
            });

          if (existing) {
            const currentLead =
              await prisma.lead.findUnique({
                where: {
                  id: leadId,
                },

                select: {
                  unlockCount: true,
                },
              });

            return NextResponse.json(
              {
                ok: true,
                alreadyUnlocked: true,

                unlockPrice:
                  Math.max(
                    1,
                    existing.unlockPrice ??
                      DEFAULT_MARKETPLACE_PRICE
                  ),

                unlockCount:
                  currentLead?.unlockCount,

                maxPurchases:
                  MARKETPLACE_MAX_PURCHASES,
              },
              {
                status: 200,
              }
            );
          }
        }

        throw error;
      }
    }

    if (!result.ok) {
      let status = 400;

      if (
        result.code ===
        "LEAD_SOLD_OUT"
      ) {
        status = 409;
      } else if (
        result.code ===
        "SERVICE_NOT_COVERED"
      ) {
        status = 403;
      } else if (
        result.code ===
        "LEAD_NOT_AVAILABLE"
      ) {
        status = 410;
      } else if (
        result.code ===
        "DIRECT_UNLOCK_CONFLICT"
      ) {
        status = 409;
      }

      return NextResponse.json(
        result,
        {
          status,
        }
      );
    }

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "UNKNOWN";

    console.error(
      "LEAD_UNLOCK_ERROR:",
      err
    );

    return NextResponse.json(
      {
        ok: false,
        code:
          "LEAD_UNLOCK_ERROR",
        detail: msg,
      },
      {
        status: 500,
      }
    );
  }
}