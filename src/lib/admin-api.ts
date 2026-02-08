// src/lib/admin-api.ts
import { assertAdmin } from "@/lib/admin";

/**
 * Admin API route'larında kullan:
 * await requireAdminApi(req)
 */
export async function requireAdminApi(req: Request): Promise<void> {
  await assertAdmin(req);
}
