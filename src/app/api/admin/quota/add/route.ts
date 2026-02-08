import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

const AddQuotaSchema = z.object({
  clinicId: z.string().min(1),
  addLeads: z.number().int().min(1).max(100000), // örn 10
  extendDays: z.number().int().min(0).max(3650).optional(), // örn 30
});

type AddQuotaInput = z.infer<typeof AddQuotaSchema>;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    assertAdmin(req);

    const json: unknown = await req.json();
    const data: AddQuotaInput = AddQuotaSchema.parse(json);

    const now = new Date();
    const extendDays = data.extendDays ?? 30;
    const newExpiry = new Date(now.getTime() + extendDays * 24 * 60 * 60 * 1000);

    // Aktif subscription var mı?
    const active = await prisma.subscription.findFirst({
      where: {
        clinicId: data.clinicId,
        status: "active",
        expiresAt: { gt: now },
      },
      orderBy: { startedAt: "desc" },
      select: { id: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
    });

    if (!active) {
      // yoksa yeni subscription aç
      const created = await prisma.subscription.create({
        data: {
          clinicId: data.clinicId,
          status: "active",
          quotaTotal: data.addLeads,
          quotaUsed: 0,
          startedAt: now,
          expiresAt: newExpiry,
        },
        select: { id: true, clinicId: true, quotaTotal: true, quotaUsed: true, startedAt: true, expiresAt: true },
      });

      return NextResponse.json({ ok: true, mode: "created", subscription: created }, { status: 201 });
    }

    // varsa kota ekle ve süreyi uzat (istersen)
    const updated = await prisma.subscription.update({
      where: { id: active.id },
      data: {
        quotaTotal: { increment: data.addLeads },
        expiresAt: active.expiresAt < newExpiry ? newExpiry : active.expiresAt,
      },
      select: { id: true, clinicId: true, quotaTotal: true, quotaUsed: true, startedAt: true, expiresAt: true },
    });

    return NextResponse.json({ ok: true, mode: "updated", subscription: updated }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
