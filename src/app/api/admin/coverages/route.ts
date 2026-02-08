import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-api";
import { assertAdmin } from "@/lib/admin";

const CreateCoverageSchema = z.object({
  clinicId: z.string().min(10),
  city: z.string().min(2).max(64),
  service: z.string().min(2).max(64),
  isActive: z.boolean().optional(),
});

const UpdateCoverageSchema = z.object({
  id: z.string().min(10),
  isActive: z.boolean(),
});

const DeleteCoverageSchema = z.object({
  id: z.string().min(10),
});

type CreateCoverageInput = z.infer<typeof CreateCoverageSchema>;
type UpdateCoverageInput = z.infer<typeof UpdateCoverageSchema>;
type DeleteCoverageInput = z.infer<typeof DeleteCoverageSchema>;

export async function GET(req: Request): Promise<NextResponse> {
  try {
    assertAdmin(req);


    const rows = await prisma.clinicCoverage.findMany({
      orderBy: [{ city: "asc" }, { service: "asc" }],
      select: {
        id: true,
        clinicId: true,
        city: true,
        service: true,
        isActive: true,
        clinic: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ ok: true, coverages: rows }, { status: 200 });
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
    const data: CreateCoverageInput = CreateCoverageSchema.parse(json);

    const city = data.city.toLowerCase().trim();
    const service = data.service.toLowerCase().trim();

    const created = await prisma.clinicCoverage.create({
      data: {
        clinicId: data.clinicId,
        city,
        service,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        clinicId: true,
        city: true,
        service: true,
        isActive: true,
        clinic: { select: { name: true } },
      },
    });

    return NextResponse.json({ ok: true, coverage: created }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const json: unknown = await req.json();
    const data: UpdateCoverageInput = UpdateCoverageSchema.parse(json);

    const updated = await prisma.clinicCoverage.update({
      where: { id: data.id },
      data: { isActive: data.isActive },
      select: { id: true, clinicId: true, city: true, service: true, isActive: true },
    });

    return NextResponse.json({ ok: true, coverage: updated }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    await requireAdminApi(req);

    const json: unknown = await req.json();
    const data: DeleteCoverageInput = DeleteCoverageSchema.parse(json);

    await prisma.clinicCoverage.delete({ where: { id: data.id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
