import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";

const GrantSchema = z.object({
  clinicId: z.string().min(10),
  quotaAdd: z.number().int().min(1).max(1000),
  days: z.number().int().min(1).max(365).optional(),
  note: z.string().max(200).optional(),
});

type GrantInput = z.infer<typeof GrantSchema>;

export async function GET(req: Request): Promise<NextResponse> {
  try {
    requireAdminApi(req);

    const subs = await prisma.subscription.findMany({
      orderBy: { startedAt: "desc" },
      take: 200,
      select: {
        id: true,
        clinicId: true,
        status: true,
        quotaTotal: true,
        quotaUsed: true,
        startedAt: true,
        expiresAt: true,
        clinic: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ ok: true, subscriptions: subs }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const json: unknown = await req.json();
    const data: GrantInput = GrantSchema.parse(json);

    const now = new Date();
    const days = data.days ?? 30;
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + days);

    // Aynı clinic için aktif subscription varsa onu artırmak daha mantıklı;
    // ama “admin manuel yükleme” için yeni kayıt da olur.
    // Biz basit ve güvenli kalsın diye: aktif varsa update, yoksa create yapacağız.
    const active = await prisma.subscription.findFirst({
      where: { clinicId: data.clinicId, status: "active", expiresAt: { gt: now } },
      orderBy: { startedAt: "desc" },
      select: { id: true, expiresAt: true },
    });

    if (!active) {
      const created = await prisma.subscription.create({
        data: {
          clinicId: data.clinicId,
          status: "active",
          quotaTotal: data.quotaAdd,
          quotaUsed: 0,
          startedAt: now,
          expiresAt,
        },
        select: {
          id: true,
          clinicId: true,
          status: true,
          quotaTotal: true,
          quotaUsed: true,
          startedAt: true,
          expiresAt: true,
        },
      });

      return NextResponse.json({ ok: true, mode: "created", subscription: created, note: data.note ?? null }, { status: 201 });
    }

    const updated = await prisma.subscription.update({
      where: { id: active.id },
      data: {
        quotaTotal: { increment: data.quotaAdd },
        expiresAt: active.expiresAt < expiresAt ? expiresAt : active.expiresAt,
      },
      select: {
        id: true,
        clinicId: true,
        status: true,
        quotaTotal: true,
        quotaUsed: true,
        startedAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ ok: true, mode: "updated", subscription: updated, note: data.note ?? null }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
