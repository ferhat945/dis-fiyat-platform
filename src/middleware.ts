import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getAdminCookieName } from "@/lib/admin-auth";

function getSecret(): Uint8Array | null {
  const raw = process.env.ADMIN_JWT_SECRET ?? "";
  if (raw.length < 20) return null;
  return new TextEncoder().encode(raw);
}

async function isAdmin(req: NextRequest): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;

  const token = req.cookies.get(getAdminCookieName())?.value ?? "";
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow login/logout endpoints
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") return NextResponse.next();

  const needsAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin");

  if (!needsAdmin) return NextResponse.next();

  const ok = await isAdmin(req);
  if (ok) return NextResponse.next();

  // API -> 401, Page -> redirect
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED_ADMIN" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
