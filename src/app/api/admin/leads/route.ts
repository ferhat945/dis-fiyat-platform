// src/app/api/admin/leads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  intent: string;
  source: string | null;
  status: string;
  createdAt: Date;

  assignedClinic: null | {
    id: string;
    name: string;
    email: string;
  };
};

type Resp =
  | { ok: true; leads: LeadRow[] }
  | { ok: false; code: string };

export async function GET(req: Request): Promise<NextResponse<Resp>> {
  try {
    requireAdminApi(req);

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        city: true,
        service: true,
        fullName: true,
        phone: true,
        email: true,
        message: true,
        intent: true,
        source: true,
        status: true,
        createdAt: true,

        // ✅ atama bilgisi (LeadAssignment -> Clinic)
        assignments: {
          take: 1,
          select: {
            clinic: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    const out: LeadRow[] = leads.map((l) => ({
      id: l.id,
      city: l.city,
      service: l.service,
      fullName: l.fullName,
      phone: l.phone,
      email: l.email,
      message: l.message,
      intent: l.intent,
      source: l.source,
      status: l.status,
      createdAt: l.createdAt,
      assignedClinic: l.assignments[0]?.clinic ?? null,
    }));

    return NextResponse.json({ ok: true, leads: out }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}