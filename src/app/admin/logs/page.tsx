import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function norm(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: { city?: string; service?: string; reason?: string; assigned?: string };
}): Promise<JSX.Element> {
  await requireAdmin();

  const city = norm(searchParams.city);
  const service = norm(searchParams.service);
  const reason = norm(searchParams.reason);
  const assignedRaw = norm(searchParams.assigned);

  const assigned = assignedRaw === "true" ? true : assignedRaw === "false" ? false : null;

  const logs = await prisma.leadDistributionLog.findMany({
    where: {
      ...(city ? { city } : {}),
      ...(service ? { service } : {}),
      ...(reason ? { reason } : {}),
      ...(assigned !== null ? { assigned } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: {
      id: true,
      leadId: true,
      clinicId: true,
      city: true,
      service: true,
      assigned: true,
      reason: true,
      createdAt: true,
      clinic: { select: { name: true } },
    },
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Dağıtım Logları</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ opacity: 0.75, marginBottom: 8 }}>
          Filtre: <code>?city=istanbul&service=implant&assigned=true</code>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {logs.map((l) => (
            <div key={l.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                  {l.city}/{l.service} — {l.assigned ? "✅ ASSIGNED" : "❌ NOT_ASSIGNED"} —{" "}
                  <span style={{ opacity: 0.75 }}>{l.reason}</span>
                </div>
                <div style={{ opacity: 0.7 }}>{new Date(l.createdAt).toLocaleString("tr-TR")}</div>
              </div>

              <div style={{ marginTop: 6 }}>
                <strong>Klinik:</strong> {l.clinic?.name ?? "—"} &nbsp; | &nbsp; <strong>Lead:</strong> {l.leadId}
              </div>

              <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>LogID: {l.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
