import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage(): Promise<JSX.Element> {
  await requireAdmin();

  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);

  const [leads30, assigned30, topCities, topServices] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: d30 } } }),
    prisma.leadAssignment.count({ where: { createdAt: { gte: d30 } } }),
    prisma.lead.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
    prisma.lead.groupBy({
      by: ["service"],
      _count: { service: true },
      orderBy: { _count: { service: "desc" } },
      take: 10,
    }),
  ]);

  const rate = leads30 > 0 ? Math.round((assigned30 / leads30) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Raporlar (30 gün)</h1>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <Box title="Toplam Lead (30g)" value={String(leads30)} />
        <Box title="Atanan Lead (30g)" value={String(assigned30)} />
        <Box title="Atama Oranı" value={`${rate}%`} />
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginTop: 12 }}>
        <div style={panel()}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>En Çok Şehir</div>
          {topCities.map((x) => (
            <div key={x.city} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{x.city}</span>
              <strong>{x._count.city}</strong>
            </div>
          ))}
        </div>

        <div style={panel()}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>En Çok Hizmet</div>
          {topServices.map((x) => (
            <div key={x.service} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{x.service}</span>
              <strong>{x._count.service}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Box({ title, value }: { title: string; value: string }): JSX.Element {
  return (
    <div style={panel()}>
      <div style={{ opacity: 0.75, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function panel(): React.CSSProperties {
  return { border: "1px solid #ddd", borderRadius: 14, padding: 14 };
}
