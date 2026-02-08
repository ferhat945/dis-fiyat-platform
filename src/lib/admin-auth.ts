// src/lib/admin-auth.ts
import { SignJWT, jwtVerify } from "jose";

export function getAdminCookieName(): string {
  return "admin_session";
}

function getSecret(): Uint8Array {
  const s =
    (process.env.ADMIN_JWT_SECRET ?? "").trim() ||
    (process.env.JWT_SECRET ?? "").trim();

  if (!s) throw new Error("ADMIN_JWT_SECRET_MISSING");
  return new TextEncoder().encode(s);
}

export async function signAdminSession(): Promise<string> {
  const secret = getSecret();

  return new SignJWT({ role: "admin" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret);
}

export async function verifyAdminSession(token: string): Promise<{ role: "admin" } | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "admin") return null;
    return { role: "admin" };
  } catch {
    return null;
  }
}
