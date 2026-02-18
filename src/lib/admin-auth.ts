// src/lib/admin-auth.ts
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";

type AdminSession = {
  role: "admin";
};

// middleware.ts zaten bunu istiyor ✅
export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

// middleware-edge (Edge runtime) uyumlu secret ✅
export function getAdminJwtSecret(): Uint8Array {
  // İstersen ADMIN_JWT_SECRET kullan, yoksa ADMIN_SESSION_SECRET'e düş.
  const s =
    process.env.ADMIN_JWT_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    "dev_admin_jwt_secret_change_me";

  return new TextEncoder().encode(s);
}

export async function signAdminSession(payload: AdminSession): Promise<string> {
  // HS256 ile 7 gün geçerli admin token
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAdminJwtSecret());
}

export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminJwtSecret());

    if (payload?.role !== "admin") return null;
    return { role: "admin" };
  } catch {
    return null;
  }
}
