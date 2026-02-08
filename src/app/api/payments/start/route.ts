import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  package: z.enum(["base", "extra"]),
});

type Body = z.infer<typeof BodySchema>;

function addMonths(d: Date, months: number): Date {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + months);
  return nd;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const json: unknown = await req.json();
    const body: Body = BodySchema.parse(json);

    const now = new Date();
    const quotaToAdd = 10;

    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.findUnique({
        where: { id: session.clinicId },
        select: { id: true },
      });
      if (!clinic) {
        return { ok: false as const, code: "CLINIC_NOT_FOUND" as const };
      }

      const active = await tx.subscription.findFirst({
        where: {
          clinicId: session.clinicId,
          status: "active",
          expiresAt: { gt: now },
        },
        orderBy: { startedAt: "desc" },
        select: { id: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
      });

      if (body.package === "base") {
        if (!active) {
          const created = await tx.subscription.create({
            data: {
              clinicId: session.clinicId,
              status: "active",
              quotaTotal: quotaToAdd,
              quotaUsed: 0,
              startedAt: now,
              expiresAt: addMonths(now, 1),
            },
            select: { id: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
          });

          return { ok: true as const, mode: "created" as const, subscription: created };
        }

        const updated = await tx.subscription.update({
          where: { id: active.id },
          data: {
            quotaTotal: { increment: quotaToAdd },
            expiresAt: addMonths(active.expiresAt, 1),
          },
          select: { id: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
        });

        return { ok: true as const, mode: "extended" as const, subscription: updated };
      }

      // extra
      if (!active) {
        const created = await tx.subscription.create({
          data: {
            clinicId: session.clinicId,
            status: "active",
            quotaTotal: quotaToAdd,
            quotaUsed: 0,
            startedAt: now,
            expiresAt: addMonths(now, 1),
          },
          select: { id: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
        });

        return { ok: true as const, mode: "created_from_extra" as const, subscription: created };
      }

      const updated = await tx.subscription.update({
        where: { id: active.id },
        data: { quotaTotal: { increment: quotaToAdd } },
        select: { id: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
      });

      return { ok: true as const, mode: "topped_up" as const, subscription: updated };
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 404 });
    }

    // ✅ ok tekrar etmiyoruz (result zaten ok:true içeriyor)
    return NextResponse.json(
      {
        ...result,
        demo: true,
        package: body.package,
      },
      { status: 200 }
    );
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

    const msg = err instanceof Error ? err.message : "UNKNOWN";
    console.error("PAYMENTS_START_ERROR:", err);
    return NextResponse.json({ ok: false, code: "PAYMENTS_START_ERROR", detail: msg }, { status: 500 });
  }
}
