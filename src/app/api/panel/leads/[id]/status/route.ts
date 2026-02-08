import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  status: z.enum(["new", "contacted", "won", "lost"]),
});

type Body = z.infer<typeof BodySchema>;

async function getParamId(req: Request, ctx: unknown): Promise<string> {
  const anyCtx = ctx as { params?: unknown };

  if (anyCtx?.params) {
    const p = anyCtx.params as unknown;

    // params Promise olabilir
    if (typeof (p as { then?: unknown })?.then === "function") {
      const resolved = (await p) as { id?: string };
      if (typeof resolved?.id === "string" && resolved.id.trim()) return resolved.id.trim();
    }

    // params object olabilir
    const obj = p as { id?: string };
    if (typeof obj?.id === "string" && obj.id.trim()) return obj.id.trim();
  }

  // fallback: URL'nin son segmenti
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return (parts[parts.length - 2] === "status" ? parts[parts.length - 3] : parts[parts.length - 1])?.trim() ?? "";
}

export async function PATCH(req: Request, ctx: unknown): Promise<NextResponse> {
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

    const json: unknown = await req.json();
    const body: Body = BodySchema.parse(json);

    // Bu lead bu kliniğe atanmış mı?
    const assigned = await prisma.leadAssignment.findFirst({
      where: { clinicId: session.clinicId, leadId },
      select: { id: true },
    });

    if (!assigned) {
      return NextResponse.json({ ok: false, code: "FORBIDDEN_NOT_YOURS" }, { status: 403 });
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: body.status },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, lead: updated }, { status: 200 });
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
    console.error("LEAD_STATUS_UPDATE_ERROR:", err);
    return NextResponse.json({ ok: false, code: "LEAD_STATUS_UPDATE_ERROR", detail: msg }, { status: 500 });
  }
}

