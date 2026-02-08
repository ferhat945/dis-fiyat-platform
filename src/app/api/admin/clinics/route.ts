// src/app/api/admin/clinics/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { assertAdmin } from "@/lib/admin";

const CreateClinicSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().max(40).optional(),
});

const UpdateClinicSchema = z.object({
  id: z.string().min(10),
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(40).optional().nullable(),
  isActive: z.boolean().optional(),
});

type CreateClinicInput = z.infer<typeof CreateClinicSchema>;
type UpdateClinicInput = z.infer<typeof UpdateClinicSchema>;

export async function GET(req: Request): Promise<NextResponse> {
  try {
    await assertAdmin(req);

    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        lastAssignedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, clinics }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    await assertAdmin(req);

    const json: unknown = await req.json();
    const data: CreateClinicInput = CreateClinicSchema.parse(json);

    const passwordHash = await bcrypt.hash(data.password, 10);

    const clinic = await prisma.clinic.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim(),
        passwordHash,
        isActive: true,
      },
      select: { id: true, name: true, email: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, clinic }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    await assertAdmin(req);

    const json: unknown = await req.json();
    const data: UpdateClinicInput = UpdateClinicSchema.parse(json);

    const updated = await prisma.clinic.update({
      where: { id: data.id },
      data: {
        ...(typeof data.name === "string" ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
        ...(typeof data.isActive === "boolean" ? { isActive: data.isActive } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, clinic: updated }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "UNKNOWN";
    const status = msg === "UNAUTHORIZED_ADMIN" ? 401 : 500;
    return NextResponse.json({ ok: false, code: msg }, { status });
  }
}
