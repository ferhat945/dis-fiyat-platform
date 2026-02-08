import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

const StartSubSchema = z.object({
  quotaTotal: z.number().int().min(1).max(100000),
  days: z.number().int().min(1).max(3650), // kaç gün aktif
});

type StartSubInput = z.infer<typeof StartSubSchema>;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ clinicId: string }> }
): Promise<NextResponse> {
  try {
    assertAdmin(req);

    const { clinicId } = await ctx.params;
    const json: unknown = await req.json();
    const data: StartSubInput = StartSubSchema.parse(json);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + data.days * 24 * 60 * 60 * 1000);

    const sub = await prisma.subscription.create({
      data: {
        clinicId,
        status: "active",
        quotaTotal: data.quotaTotal,
        quotaUsed: 0,
        startedAt: now,
        expiresAt,
      },
      select: { id: true, clinicId: true, status: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
    });

    return NextResponse.json({ ok: true, subscription: sub }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
