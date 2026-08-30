import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import AdminClinicsClient from "./ui";

export const dynamic = "force-dynamic";

export default async function AdminClinicsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const clinics =
    await prisma.clinic.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

  const activeCount =
    clinics.filter(
      (clinic) => clinic.isActive
    ).length;

  const passiveCount =
    clinics.length - activeCount;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section className="adminStatsGrid">
        <div className="adminStatCard">
          <div className="adminStatLabel">
            Toplam Klinik
          </div>

          <div className="adminStatValue">
            {clinics.length}
          </div>

          <div className="adminStatMeta">
            Sistemde kayıtlı klinikler
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Aktif Klinik
          </div>

          <div className="adminStatValue">
            {activeCount}
          </div>

          <div className="adminStatMeta">
            Lead almaya açık hesaplar
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Pasif Klinik
          </div>

          <div className="adminStatValue">
            {passiveCount}
          </div>

          <div className="adminStatMeta">
            Şu anda devre dışı
          </div>
        </div>

        <div className="adminStatCard">
          <div className="adminStatLabel">
            Aktiflik Oranı
          </div>

          <div className="adminStatValue">
            {clinics.length > 0
              ? Math.round(
                  (activeCount /
                    clinics.length) *
                    100
                )
              : 0}
            %
          </div>

          <div className="adminStatMeta">
            Aktif / toplam klinik
          </div>
        </div>
      </section>

      <AdminClinicsClient
        initialClinics={clinics}
      />
    </div>
  );
}