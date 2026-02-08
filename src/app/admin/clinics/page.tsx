import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminClinicsClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminClinicsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Klinikler</h1>
      <AdminClinicsClient initialClinics={clinics} />
    </div>
  );
}
