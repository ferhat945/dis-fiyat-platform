import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminCoveragesClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminCoveragesPage(): Promise<JSX.Element> {
  await requireAdmin();

  const [clinics, coverages] =
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

      prisma.clinicCoverage.findMany({
        orderBy: [
          {
            city: "asc",
          },
          {
            service: "asc",
          },
        ],

        select: {
          id: true,
          clinicId: true,
          city: true,
          service: true,
          isActive: true,

          clinic: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

  const activeCoverageCount =
    coverages.filter(
      (coverage) =>
        coverage.isActive
    ).length;

  const activeClinicCount =
    clinics.filter(
      (clinic) =>
        clinic.isActive
    ).length;

  const cityCount =
    new Set(
      coverages.map(
        (coverage) =>
          coverage.city
      )
    ).size;

  const serviceCount =
    new Set(
      coverages.map(
        (coverage) =>
          coverage.service
      )
    ).size;

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
            Aktif Coverage
          </div>

          <div className="adminStatValue">
            {activeCoverageCount}
          </div>

          <div className="adminStatMeta">
            Şu anda aktif eşleşmeler
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Aktif Klinik
          </div>

          <div className="adminStatValue">
            {activeClinicCount}
          </div>

          <div className="adminStatMeta">
            Kapsam atanabilir hesap
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Şehir
          </div>

          <div className="adminStatValue">
            {cityCount}
          </div>

          <div className="adminStatMeta">
            Coverage bulunan şehir
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Hizmet
          </div>

          <div className="adminStatValue">
            {serviceCount}
          </div>

          <div className="adminStatMeta">
            Tanımlı hizmet türü
          </div>
        </div>
      </section>

      <AdminCoveragesClient
        initialClinics={clinics}
        initialCoverages={coverages}
      />
    </div>
  );
}