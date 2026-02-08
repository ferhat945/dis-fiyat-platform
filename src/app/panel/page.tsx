import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

export const dynamic = "force-dynamic";

export default async function PanelDashboardPage(): Promise<JSX.Element> {
  const session = await requireClinic();
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const activeSub = await prisma.subscription.findFirst({
    where: { clinicId: session.clinicId, status: "active", expiresAt: { gt: now } },
    orderBy: { startedAt: "desc" },
    select: { quotaTotal: true, quotaUsed: true, expiresAt: true },
  });

  const quotaTotal = activeSub?.quotaTotal ?? 0;
  const quotaUsed = activeSub?.quotaUsed ?? 0;
  const remaining = Math.max(0, quotaTotal - quotaUsed);

  const [todayLeadCount, lastLeads, coverageCount] = await Promise.all([
    prisma.lead.count({
      where: {
        createdAt: { gte: since24h },
        assignments: { some: { clinicId: session.clinicId } },
      },
    }),
    prisma.lead.findMany({
      where: { assignments: { some: { clinicId: session.clinicId } } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        fullName: true,
        phone: true,
        city: true,
        service: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.clinicCoverage.count({ where: { clinicId: session.clinicId, isActive: true } }),
  ]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card title="Aktif Hizmet" value={String(coverageCount)} hint="Şehir + hizmet eşleşmeleri" />
        <Card title="Son 24 Saat Lead" value={String(todayLeadCount)} hint="Sana atanan leadler" />
        <Card title="Kalan Kota" value={String(remaining)} hint={activeSub ? "Aktif abonelik" : "Abonelik yok"} />
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Son Leadler</div>
          <Link href="/panel/leadler" style={{ fontWeight: 900, textDecoration: "none" }}>
            Tümünü gör →
          </Link>
        </div>

        {lastLeads.length === 0 && <div style={{ marginTop: 10, opacity: 0.75 }}>Henüz lead yok.</div>}

        {lastLeads.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {lastLeads.map((l) => (
              <div key={l.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {l.fullName} — {l.phone}
                  </div>
                  <div style={{ opacity: 0.7 }}>{new Date(l.createdAt).toLocaleString("tr-TR")}</div>
                </div>

                <div style={{ marginTop: 6 }}>
                  <strong>Şehir:</strong> {l.city} &nbsp; | &nbsp; <strong>Hizmet:</strong> {l.service} &nbsp; | &nbsp;
                  <strong>Durum:</strong> {l.status}
                </div>

                <div style={{ marginTop: 8 }}>
                  <Link
                    href={`/panel/leadler/${l.id}`}
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      fontWeight: 900,
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid #111",
                      background: "#111",
                      color: "#fff",
                    }}
                  >
                    Detay →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!activeSub && (
        <div style={{ border: "1px solid #f0c", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Abonelik yok</div>
          <div style={{ opacity: 0.85 }}>
            Lead almak için <Link href="/panel/abonelik">Abonelik</Link> sayfasından kota yükleyebilirsin.
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, hint }: { title: string; value: string; hint: string }): JSX.Element {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ opacity: 0.75, fontWeight: 900 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>{value}</div>
      <div style={{ opacity: 0.65, marginTop: 4, fontWeight: 700 }}>{hint}</div>
    </div>
  );
}
