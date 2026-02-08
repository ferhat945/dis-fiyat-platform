import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

const AddCoverageSchema = z.object({
  city: z.string().min(2).max(64),
  service: z.string().min(2).max(64),
});

type AddCoverageInput = z.infer<typeof AddCoverageSchema>;

export async function POST(
  req: Request,
  ctx: { params: Promise<{ clinicId: string }> }
): Promise<NextResponse> {
  try {
    assertAdmin(req);

    const { clinicId } = await ctx.params;
    const json: unknown = await req.json();
    const data: AddCoverageInput = AddCoverageSchema.parse(json);

    const coverage = await prisma.clinicCoverage.upsert({
      where: { clinicId_city_service: { clinicId, city: data.city, service: data.service } },
      create: { clinicId, city: data.city, service: data.service, isActive: true },
      update: { isActive: true },
      select: { id: true, clinicId: true, city: true, service: true, isActive: true },
    });

    return NextResponse.json({ ok: true, coverage }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
