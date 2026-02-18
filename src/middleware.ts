// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAdminCookieName, getAdminJwtSecret } from "@/lib/admin-auth";

async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(getAdminCookieName())?.value ?? "";
  if (!token) return false;

  try {
    const secret = getAdminJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

function clearAdminCookie(res: NextResponse): NextResponse {
  const name = getAdminCookieName();

  // ✅ Cookie’yi sil (prod/dev uyumlu)
  // Not: domain set etme; en güvenlisi path "/" ile expire etmek.
  res.cookies.set(name, "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow login/logout endpoints
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") return NextResponse.next();

  const needsAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!needsAdmin) return NextResponse.next();

  const ok = await isAdmin(req);
  if (ok) return NextResponse.next();

  // ✅ Yetkisizse: eski/bozuk admin cookie varsa otomatik temizle
  // API -> 401 + cookie clear
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.json({ ok: false, code: "UNAUTHORIZED_ADMIN" }, { status: 401 });
    return clearAdminCookie(res);
  }

  // Page -> login redirect + cookie clear
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  const res = NextResponse.redirect(url);
  return clearAdminCookie(res);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
