import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signClinicSession, verifyPassword } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    const clinic = await prisma.clinic.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, isActive: true },
    });

    if (!clinic || !clinic.isActive) {
      return NextResponse.json({ ok: false, code: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const ok = await verifyPassword(password, clinic.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, code: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const token = await signClinicSession({
      clinicId: clinic.id,
      email: clinic.email,
      name: clinic.name,
    });

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set("clinic_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, code: "LOGIN_ERROR" }, { status: 500 });
  }
}
