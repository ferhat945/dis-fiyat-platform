import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";


export const dynamic = "force-dynamic";

function qp(url: string): URLSearchParams {
  return new URL(url).searchParams;
}

function toBool(v: string | null): boolean | null {
  if (!v) return null;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    assertAdmin(req);

    const sp = qp(req.url);
    const city = (sp.get("city") ?? "").toLowerCase().trim();
    const service = (sp.get("service") ?? "").toLowerCase().trim();
    const clinicId = (sp.get("clinicId") ?? "").trim();
    const reason = (sp.get("reason") ?? "").trim();
    const assigned = toBool(sp.get("assigned"));

    const takeRaw = Number(sp.get("take") ?? "100");
    const take = Number.isFinite(takeRaw) ? Math.min(500, Math.max(1, takeRaw)) : 100;

    const where: Record<string, unknown> = {};
    if (city) where.city = city;
    if (service) where.service = service;
    if (clinicId) where.clinicId = clinicId;
    if (reason) where.reason = reason;
    if (assigned !== null) where.assigned = assigned;

    const logs = await prisma.leadDistributionLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        leadId: true,
        clinicId: true,
        city: true,
        service: true,
        assigned: true,
        reason: true,
        details: true,
        createdAt: true,
        clinic: { select: { name: true } },
      },
    });

    return NextResponse.json({ ok: true, logs }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
