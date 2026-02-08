import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminCoveragesClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminCoveragesPage(): Promise<JSX.Element> {
  await requireAdmin();

  const [clinics, coverages] = await Promise.all([
    prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, isActive: true },
    }),
    prisma.clinicCoverage.findMany({
      orderBy: [{ city: "asc" }, { service: "asc" }],
      select: { id: true, clinicId: true, city: true, service: true, isActive: true, clinic: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Coverage (Şehir + Hizmet)</h1>
      <AdminCoveragesClient initialClinics={clinics} initialCoverages={coverages} />
    </div>
  );
}
