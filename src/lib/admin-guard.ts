// src/lib/admin-guard.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminSession } from "@/lib/admin-auth";

export async function requireAdmin(): Promise<void> {
  const c = await cookies();
  const token = c.get(getAdminCookieName())?.value ?? "";
  const session = token ? await verifyAdminSession(token) : null;

  if (!session) redirect("/admin/login");
}
