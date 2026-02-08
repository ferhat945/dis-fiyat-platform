import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  isActive: z.boolean(),
});

type PatchInput = z.infer<typeof PatchSchema>;

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
  return parts[parts.length - 1]?.trim() ?? "";
}

export async function PATCH(req: Request, ctx: unknown): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const id = await getParamId(req, ctx);
    if (!id) {
      return NextResponse.json({ ok: false, code: "MISSING_ID" }, { status: 400 });
    }

    const json: unknown = await req.json();
    const data: PatchInput = PatchSchema.parse(json);

    // sahiplik kontrolü
    const existing = await prisma.clinicCoverage.findFirst({
      where: { id, clinicId: session.clinicId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const updated = await prisma.clinicCoverage.update({
      where: { id },
      data: { isActive: data.isActive },
      select: { id: true, city: true, service: true, isActive: true },
    });

    return NextResponse.json({ ok: true, coverage: updated }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
