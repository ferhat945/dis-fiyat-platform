// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminCookieName, signAdminSession } from "@/lib/admin-auth";

const LoginSchema = z.object({
  key: z.string().min(1),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const expected = process.env.ADMIN_KEY;
    if (!expected || data.key !== expected) {
      return NextResponse.json({ ok: false, code: "WRONG_ADMIN_KEY" }, { status: 401 });
    }

    const token = await signAdminSession({ role: "admin" });

    const res = NextResponse.json({ ok: true }, { status: 200 });

    res.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }
}
