import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

export const dynamic = "force-dynamic";

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysAgoUTC(days: number): Date {
  const d = startOfTodayUTC();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function maxOf(arr: number[]): number {
  let m = 0;
  for (const x of arr) m = Math.max(m, x);
  return m;
}

function fmtDayTR(d: Date): string {
  return new Date(d).toLocaleDateString("tr-TR", { weekday: "short", day: "2-digit", month: "short" });
}

export default async function PanelIstatistikPage(): Promise<JSX.Element> {
  const session = await requireClinic();

  const today = startOfTodayUTC();
  const last7Start = daysAgoUTC(6); // bugün dahil 7 gün

  const [todayRow, last7Rows, totalAgg] = await Promise.all([
    prisma.clinicPageView.findUnique({
      where: { clinicId_day: { clinicId: session.clinicId, day: today } },
      select: { count: true },
    }),
    prisma.clinicPageView.findMany({
      where: { clinicId: session.clinicId, day: { gte: last7Start, lte: today } },
      select: { day: true, count: true },
      orderBy: { day: "asc" },
    }),
    prisma.clinicPageView.aggregate({
      where: { clinicId: session.clinicId },
      _sum: { count: true },
    }),
  ]);

  const todayCount = todayRow?.count ?? 0;
  const last7Count = last7Rows.reduce((acc, r) => acc + r.count, 0);
  const totalCount = totalAgg._sum.count ?? 0;

  // last7Rows bazı günleri içermeyebilir -> 7 günün tamamını doldur
  const map = new Map<string, number>();
  for (const r of last7Rows) map.set(startOfTodayUTCFor(r.day).toISOString(), r.count);

  const series: { day: Date; count: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = daysAgoUTC(i);
    const key = d.toISOString();
    series.push({ day: d, count: map.get(key) ?? 0 });
  }

  const counts = series.map((x) => x.count);
  const peak = Math.max(1, maxOf(counts));
  const avg = Math.round(last7Count / 7);

  const last = series[6]?.count ?? 0;
  const prev = series[5]?.count ?? 0;
  const delta = last - prev;
  const deltaLabel =
    delta === 0 ? "Değişim yok" : delta > 0 ? `+${delta} artış` : `${delta} azalış`;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 44px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.72)",
              fontWeight: 950,
              fontSize: 12,
              boxShadow: "0 10px 18px rgba(2,6,23,0.05)",
            }}
          >
            📊 Görüntülenme Analitiği
          </div>

          <h1 style={{ margin: "10px 0 0", fontSize: 30, lineHeight: 1.1, fontWeight: 950, letterSpacing: "-0.02em" }}>
            İstatistikler
          </h1>

          <div style={{ marginTop: 8, color: "rgba(15,23,42,0.72)", fontWeight: 750, lineHeight: 1.75, maxWidth: "70ch" }}>
            Klinik detay sayfan görüntülendikçe sayı artar. Bu ölçüm SEO’yu bozmaz; sadece sayfa açılışını sayar.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
            minWidth: 280,
          }}
        >
          <MiniCard title="Ortalama (7g)" value={String(avg)} hint="Günlük ortalama" />
          <MiniCard title="Dün → Bugün" value={deltaLabel} hint="Son 2 gün" />
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard title="Bugün" value={todayCount} hint="Bugünkü görüntülenme" tone="primary" />
        <StatCard title="Son 7 Gün" value={last7Count} hint="Bugün dahil toplam" tone="soft" />
        <StatCard title="Toplam" value={totalCount} hint="Tüm zamanlar" tone="soft" />
      </div>

      {/* CHART */}
      <div
        style={{
          marginTop: 12,
          borderRadius: 22,
          border: "1px solid rgba(15,23,42,0.10)",
          background: "rgba(255,255,255,0.78)",
          boxShadow: "0 18px 45px rgba(2,6,23,0.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 14, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Son 7 Gün Trend</div>
            <div style={{ opacity: 0.72, fontWeight: 800, fontSize: 12, marginTop: 4 }}>
              Zirve: <strong>{peak}</strong> • Ortalama: <strong>{avg}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={badgeStyle()}>📌 Günlük bar</span>
            <span style={{ ...badgeStyle(), borderColor: "rgba(34,197,94,0.22)", background: "rgba(34,197,94,0.10)" }}>
              ✅ Takip açık
            </span>
          </div>
        </div>

        <div style={{ padding: 14, paddingTop: 0 }}>
          <div style={{ display: "grid", gap: 10 }}>
            {series.map((r) => {
              const w = clamp(Math.round((r.count / peak) * 100), 0, 100);
              return (
                <div
                  key={r.day.toISOString()}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 60px",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ opacity: 0.75, fontWeight: 900, fontSize: 12 }}>{fmtDayTR(r.day)}</div>

                  <div
                    style={{
                      height: 14,
                      borderRadius: 999,
                      border: "1px solid rgba(15,23,42,0.10)",
                      background: "rgba(255,255,255,0.70)",
                      overflow: "hidden",
                    }}
                    aria-label="Günlük görüntülenme çubuğu"
                  >
                    <div
                      style={{
                        width: `${w}%`,
                        height: "100%",
                        borderRadius: 999,
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
                        boxShadow: "0 16px 30px rgba(2,6,23,0.10)",
                      }}
                    />
                  </div>

                  <div style={{ textAlign: "right", fontWeight: 950 }}>{r.count}</div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 18,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.72)",
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 900 }}>
              💡 İpucu: Klinik profili güncel (telefon + Instagram) olanların dönüş oranı daha iyi olur.
            </div>
            <div style={{ opacity: 0.75, fontWeight: 850, fontSize: 12 }}>
              Klinik: <strong>{session.name}</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, opacity: 0.7, fontWeight: 800, fontSize: 12 }}>
        Not: Bu sayım, klinik detay sayfan açıldığında artar. (SEO sayfayı bozmaz.)
      </div>
    </div>
  );
}

function startOfTodayUTCFor(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function badgeStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.75)",
    fontWeight: 900,
    fontSize: 12,
  };
}

function MiniCard({ title, value, hint }: { title: string; value: string; hint: string }): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.78)",
        borderRadius: 18,
        padding: "12px 14px",
        boxShadow: "0 12px 26px rgba(2,6,23,0.06)",
      }}
    >
      <div style={{ opacity: 0.75, fontWeight: 900, fontSize: 12 }}>{title}</div>
      <div style={{ marginTop: 6, fontWeight: 950, fontSize: 16 }}>{value}</div>
      <div style={{ marginTop: 4, opacity: 0.7, fontWeight: 850, fontSize: 12 }}>{hint}</div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: number;
  hint: string;
  tone: "primary" | "soft";
}): JSX.Element {
  const bg =
    tone === "primary"
      ? "radial-gradient(700px 220px at 15% 0%, rgba(124,58,237,0.22), transparent 60%), rgba(255,255,255,0.78)"
      : "rgba(255,255,255,0.78)";

  const border =
    tone === "primary" ? "1px solid rgba(124,58,237,0.18)" : "1px solid rgba(15,23,42,0.10)";

  return (
    <div
      style={{
        borderRadius: 22,
        border,
        background: bg,
        padding: 14,
        boxShadow: "0 18px 45px rgba(2,6,23,0.08)",
      }}
    >
      <div style={{ opacity: 0.75, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 36, fontWeight: 950, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 8, opacity: 0.75, fontWeight: 800, lineHeight: 1.5 }}>{hint}</div>
    </div>
  );
}