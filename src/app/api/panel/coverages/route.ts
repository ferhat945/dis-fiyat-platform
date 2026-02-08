import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyClinicSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getSession(): Promise<{ clinicId: string; name: string; email: string } | null> {
  const token = (await cookies()).get("clinic_session")?.value ?? "";
  return token ? await verifyClinicSession(token) : null;
}

const CreateSchema = z.object({
  city: z.string().min(2).max(64),
  service: z.string().min(2).max(64),
});

const PatchSchema = z.object({
  id: z.string().min(1),
  isActive: z.boolean(),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

  const coverages = await prisma.clinicCoverage.findMany({
    where: { clinicId: session.clinicId },
    orderBy: [{ city: "asc" }, { service: "asc" }],
    select: { id: true, clinicId: true, city: true, service: true, isActive: true },
  });

  return NextResponse.json({ ok: true, coverages }, { status: 200 });
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

    const json = (await req.json()) as unknown;
    const data = CreateSchema.parse(json);

    await prisma.clinicCoverage.create({
      data: {
        clinicId: session.clinicId,
        city: data.city.toLowerCase().trim(),
        service: data.service.toLowerCase().trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "CREATE_FAILED";
    // Unique constraint hatasında daha anlaşılır dönelim
    if (msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ ok: false, code: "ALREADY_EXISTS" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, code: "CREATE_FAILED" }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

    const json = (await req.json()) as unknown;
    const data = PatchSchema.parse(json);

    // sahiplik kontrolü
    const exists = await prisma.clinicCoverage.findFirst({
      where: { id: data.id, clinicId: session.clinicId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

    await prisma.clinicCoverage.update({
      where: { id: data.id },
      data: { isActive: data.isActive },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, code: "PATCH_FAILED" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });

    const json = (await req.json()) as unknown;
    const data = DeleteSchema.parse(json);

    const exists = await prisma.clinicCoverage.findFirst({
      where: { id: data.id, clinicId: session.clinicId },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });

    await prisma.clinicCoverage.delete({ where: { id: data.id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, code: "DELETE_FAILED" }, { status: 500 });
  }
}
