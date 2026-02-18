// src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/admin-auth";

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true }, { status: 200 });

  res.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return res;
}
