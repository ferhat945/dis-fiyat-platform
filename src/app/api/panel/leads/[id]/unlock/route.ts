import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getParamId(req: Request, ctx: unknown): Promise<string> {
  const anyCtx = ctx as { params?: unknown };

  if (anyCtx?.params) {
    const p = anyCtx.params as unknown;

    if (typeof (p as { then?: unknown })?.then === "function") {
      const resolved = (await p) as { id?: string };
      if (typeof resolved?.id === "string" && resolved.id.trim()) return resolved.id.trim();
    }

    const obj = p as { id?: string };
    if (typeof obj?.id === "string" && obj.id.trim()) return obj.id.trim();
  }

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 2]?.trim() ?? "";
}

export async function POST(req: Request, ctx: unknown): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const leadId = await getParamId(req, ctx);

    if (!leadId) {
      return NextResponse.json({ ok: false, code: "MISSING_ID" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const assignment = await tx.leadAssignment.findFirst({
        where: {
          leadId,
          clinicId: session.clinicId,
        },
        select: {
          id: true,
        },
      });

      if (!assignment) {
        return { ok: false as const, code: "FORBIDDEN_NOT_YOURS" };
      }

      const clinic = await tx.clinic.findUnique({
        where: { id: session.clinicId },
        select: {
          id: true,
          creditBalance: true,
        },
      });

      if (!clinic) {
        return { ok: false as const, code: "CLINIC_NOT_FOUND" };
      }

      if (clinic.creditBalance < 1) {
        return { ok: false as const, code: "NO_CREDIT" };
      }

      await tx.clinic.update({
        where: { id: clinic.id },
        data: {
          creditBalance: { decrement: 1 },
        },
      });

      await tx.creditTransaction.create({
        data: {
          clinicId: clinic.id,
          amount: -1,
          type: "lead_unlock",
          note: `Lead açıldı: ${leadId}`,
        },
      });

      return { ok: true as const };
    });

    if (!result.ok) {
      const status = result.code === "NO_CREDIT" ? 402 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    console.error("LEAD_UNLOCK_ERROR:", err);
    return NextResponse.json({ ok: false, code: "LEAD_UNLOCK_ERROR", detail: msg }, { status: 500 });
  }
}