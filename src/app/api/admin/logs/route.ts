import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

function normalize(v: string | null): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    requireAdminApi(req);

    const url = new URL(req.url);
    const city = normalize(url.searchParams.get("city"));
    const service = normalize(url.searchParams.get("service"));
    const reason = normalize(url.searchParams.get("reason"));
    const assignedRaw = normalize(url.searchParams.get("assigned"));

    const assigned = assignedRaw === "true" ? true : assignedRaw === "false" ? false : null;

    const rows = await prisma.leadDistributionLog.findMany({
      where: {
        ...(city ? { city } : {}),
        ...(service ? { service } : {}),
        ...(reason ? { reason } : {}),
        ...(assigned !== null ? { assigned } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 300,
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
        clinic: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ ok: true, logs: rows }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
