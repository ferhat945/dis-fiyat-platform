import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      where: {
        assignments: {
          some: { clinicId: session.clinicId },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        city: true,
        service: true,
        fullName: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, leads }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
