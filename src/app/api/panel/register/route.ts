import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const RegisterSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40).optional().or(z.literal("")).transform((v) => (v ? v.trim() : null)),
    password: z.string().min(6).max(200),
    // basit honeypot (bot doldurursa spam say)
    website: z.string().max(200).optional().or(z.literal("")).transform((v) => (v ? v : "")),
  })
  .transform((v) => ({
    name: v.name.trim(),
    email: v.email.toLowerCase().trim(),
    phone: v.phone,
    password: v.password,
    website: v.website,
  }));

type RegisterInput = z.infer<typeof RegisterSchema>;

type RegisterResp =
  | { ok: true; mode: "created"; clinicId: string }
  | { ok: false; code: string };

export async function POST(req: Request): Promise<NextResponse<RegisterResp>> {
  try {
    const json: unknown = await req.json();
    const data: RegisterInput = RegisterSchema.parse(json);

    // honeypot doluysa sessizce OK dön (spam)
    if (data.website.length > 0) {
      return NextResponse.json({ ok: true, mode: "created", clinicId: "spam" }, { status: 200 });
    }

    const exists = await prisma.clinic.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json({ ok: false, code: "EMAIL_ALREADY_EXISTS" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await prisma.clinic.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        isActive: false, // ✅ admin onayı gereksin
      },
      select: { id: true },
    });

    return NextResponse.json(
      { ok: true, mode: "created", clinicId: created.id },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "REGISTER_ERROR";
    return NextResponse.json({ ok: false, code: msg }, { status: 500 });
  }
}