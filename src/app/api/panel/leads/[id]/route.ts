import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getParamId(req: Request, ctx: unknown): Promise<string> {
  const anyCtx = ctx as { params?: unknown };

  if (anyCtx?.params) {
    const paramsValue = anyCtx.params as unknown;

    if (typeof (paramsValue as { then?: unknown })?.then === "function") {
      const resolved = (await paramsValue) as { id?: string };
      if (typeof resolved?.id === "string" && resolved.id.trim()) return resolved.id.trim();
    }

    const obj = paramsValue as { id?: string };
    if (typeof obj?.id === "string" && obj.id.trim()) return obj.id.trim();
  }

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  return last.trim();
}

export async function GET(req: Request, ctx: unknown): Promise<NextResponse> {
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

    // ✅ LeadAssignment üzerinden çekiyoruz (en güvenli)
    const assignment = await prisma.leadAssignment.findFirst({
      where: {
        leadId,
        clinicId: session.clinicId,
      },
      select: {
        id: true,
        lead: {
          select: {
            id: true,
            city: true,
            service: true,
            fullName: true,
            phone: true,
            email: true,
            message: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!assignment || !assignment.lead) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: assignment.lead }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
