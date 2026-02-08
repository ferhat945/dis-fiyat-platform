import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminSubscriptionsClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const [clinics, subs] = await Promise.all([
    prisma.clinic.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, isActive: true },
    }),
    prisma.subscription.findMany({
      orderBy: { startedAt: "desc" },
      take: 200,
      select: {
        id: true,
        clinicId: true,
        status: true,
        quotaTotal: true,
        quotaUsed: true,
        startedAt: true,
        expiresAt: true,
        clinic: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Abonelik / Kota</h1>
      <AdminSubscriptionsClient initialClinics={clinics} initialSubs={subs} />
    </div>
  );
}
