import { requireAdmin } from "@/lib/admin-guard";
import LeadsClient from "./LeadsClient";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage(): Promise<JSX.Element> {
  await requireAdmin();
  return <LeadsClient />;
}