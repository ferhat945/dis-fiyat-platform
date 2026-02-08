import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const token = (await cookies()).get("clinic_session")?.value ?? "";
    const session = token ? await verifyClinicSession(token) : null;

    if (!session) {
      return NextResponse.json({ ok: false, code: "UNAUTHORIZED_CLINIC" }, { status: 401 });
    }

    const now = new Date();

    const sub = await prisma.subscription.findFirst({
      where: {
        clinicId: session.clinicId,
        status: "active",
        expiresAt: { gt: now },
      },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        status: true,
        quotaTotal: true,
        quotaUsed: true,
        startedAt: true,
        expiresAt: true,
      },
    });

    if (!sub) {
      return NextResponse.json(
        { ok: true, hasSubscription: false, subscription: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        hasSubscription: true,
        subscription: {
          ...sub,
          quotaRemaining: Math.max(0, sub.quotaTotal - sub.quotaUsed),
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}
