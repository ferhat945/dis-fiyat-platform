import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminSubscriptionsClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const [clinics, subs] =
    await Promise.all([
      prisma.clinic.findMany({
        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      }),

      prisma.subscription.findMany({
        orderBy: {
          startedAt: "desc",
        },

        take: 200,

        select: {
          id: true,
          clinicId: true,
          status: true,
          quotaTotal: true,
          quotaUsed: true,
          startedAt: true,
          expiresAt: true,

          clinic: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

  const activeClinicCount =
    clinics.filter(
      (clinic) => clinic.isActive
    ).length;

  const activeSubCount =
    subs.filter(
      (sub) =>
        sub.status === "active"
    ).length;

  const totalQuota =
    subs.reduce(
      (sum, sub) =>
        sum +
        sub.quotaTotal,
      0
    );

  const totalUsed =
    subs.reduce(
      (sum, sub) =>
        sum +
        sub.quotaUsed,
      0
    );

  const remaining =
    Math.max(
      0,
      totalQuota -
        totalUsed
    );

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <div className="adminStatLabel">
            Aktif Klinik
          </div>

          <div className="adminStatValue">
            {activeClinicCount}
          </div>

          <div className="adminStatMeta">
            Kota tanımlanabilir hesap
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Aktif Abonelik
          </div>

          <div className="adminStatValue">
            {activeSubCount}
          </div>

          <div className="adminStatMeta">
            Durumu active olan kayıt
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Toplam Kota
          </div>

          <div className="adminStatValue">
            {totalQuota}
          </div>

          <div className="adminStatMeta">
            Tanımlanmış toplam kota
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Kalan Kota
          </div>

          <div className="adminStatValue">
            {remaining}
          </div>

          <div className="adminStatMeta">
            Kullanılmamış kota
          </div>
        </div>
      </section>

      <AdminSubscriptionsClient
        initialClinics={clinics}
        initialSubs={subs}
      />
    </div>
  );
}