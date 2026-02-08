import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    assertAdmin(req);


    const assignments = await prisma.leadAssignment.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        leadId: true,
        clinicId: true,
        createdAt: true,
        lead: {
          select: {
            fullName: true,
            phone: true,
            city: true,
            service: true,
            createdAt: true,
            status: true,
          },
        },
        clinic: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, assignments }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
