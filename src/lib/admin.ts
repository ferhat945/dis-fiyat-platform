// src/lib/admin.ts
import { cookies } from "next/headers";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";

function expectedAdminKey(): string {
  const key = (process.env.ADMIN_KEY ?? "").trim();
  // dev ortamında env yoksa fallback
  if (key) return key;
  if (process.env.NODE_ENV !== "production") return "supersecret123";
  return "";
}

/**
 * Admin API'leri için yetki kontrolü.
 * 1) x-admin-key header (PowerShell için %100)
 * 2) admin_session cookie (admin panel login için)
 */
export async function assertAdmin(req: Request): Promise<void> {
  const expected = expectedAdminKey();

  // 1) Header ile kontrol (en sağlamı)
  const headerKey = (req.headers.get("x-admin-key") ?? "").trim();
  if (expected && headerKey === expected) return;

  // 2) Cookie ile kontrol (admin panel login)
  const c = await cookies();
  const token = c.get(getAdminCookieName())?.value ?? "";
  if (!token) throw new Error("UNAUTHORIZED_ADMIN");

  const session = await verifyAdminSession(token);
  if (!session) throw new Error("UNAUTHORIZED_ADMIN");
}
