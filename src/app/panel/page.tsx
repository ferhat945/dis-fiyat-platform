// src/app/panel/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  service: string;
  status: string;
  createdAt: Date;
  unlocked: boolean;
};

type DailyPoint = { label: string; value: number };

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatTR(dt: Date): string {
  return dt.toLocaleString("tr-TR");
}

function formatDayLabel(dt: Date): string {
  return dt.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

function startOfDayLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function isNewLead(l: LeadRow, now: Date): boolean {
  const diff = now.getTime() - l.createdAt.getTime();
  const sixHours = 6 * 60 * 60 * 1000;
  return l.status === "new" && diff >= 0 && diff <= sixHours;
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Kilitli lead";

  return parts
    .map((p) => {
      const first = p[0] ?? "";
      return `${first}${"*".repeat(Math.max(3, p.length - 1))}`;
    })
    .join(" ");
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6) return "05** *** ** **";
  return `${digits.slice(0, 2)}** *** ** ${digits.slice(-2)}`;
}

function buildSparkPath(values: number[], w: number, h: number, pad: number): string {
  if (values.length === 0) return "";

  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values, 0);

  const usableW = w - pad * 2;
  const usableH = h - pad * 2;
  const den = maxV - minV || 1;

  const pts = values.map((v, i) => {
    const x = pad + (usableW * i) / Math.max(1, values.length - 1);
    const t = (v - minV) / den;
    const y = pad + usableH * (1 - t);
    return { x, y };
  });

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const cx = ((prev.x + cur.x) / 2).toFixed(2);
    const cy = ((prev.y + cur.y) / 2).toFixed(2);
    d += ` Q ${prev.x.toFixed(2)} ${prev.y.toFixed(2)} ${cx} ${cy}`;
  }

  const last = pts[pts.length - 1];
  d += ` T ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

  return d;
}

export default async function PanelDashboardPage(): Promise<JSX.Element> {
  const session = await requireClinic();

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let clinic: {
    creditBalance: number;
    isPremium: boolean;
    premiumExpiresAt: Date | null;
    autoRenewPremium: boolean;
  } | null = null;

  let activeSub: {
    quotaTotal: number;
    quotaUsed: number;
    expiresAt: Date;
  } | null = null;

  let assignments14d: Array<{ createdAt: Date }> = [];
  let todayLeadCount = 0;
  let lastLeads: LeadRow[] = [];
  let coverageCount = 0;

  try {
    clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: {
        creditBalance: true,
        isPremium: true,
        premiumExpiresAt: true,
        autoRenewPremium: true,
      },
    });
  } catch (e) {
    console.error("PANEL_DASHBOARD_CLINIC_ERROR", e);
  }

  try {
    activeSub = await prisma.subscription.findFirst({
      where: {
        clinicId: session.clinicId,
        status: "active",
        expiresAt: { gt: now },
      },
      orderBy: { startedAt: "desc" },
      select: {
        quotaTotal: true,
        quotaUsed: true,
        expiresAt: true,
      },
    });
  } catch (e) {
    console.error("PANEL_DASHBOARD_SUBSCRIPTION_ERROR", e);
  }

  const creditBalance = clinic?.creditBalance ?? 0;
  const isPremiumActive = Boolean(
    clinic?.isPremium && clinic.premiumExpiresAt && clinic.premiumExpiresAt.getTime() > now.getTime()
  );

  const quotaTotal = activeSub?.quotaTotal ?? 0;
  const quotaUsed = activeSub?.quotaUsed ?? 0;
  const remaining = Math.max(0, quotaTotal - quotaUsed);
  const quotaPct = quotaTotal > 0 ? clamp(Math.round((quotaUsed / quotaTotal) * 100), 0, 100) : 0;

  const trendDays = 14;
  const startDay = startOfDayLocal(addDays(now, -(trendDays - 1)));
  const endDay = addDays(startOfDayLocal(now), 1);

  try {
    assignments14d = await prisma.leadAssignment.findMany({
      where: {
        clinicId: session.clinicId,
        createdAt: { gte: startDay, lt: endDay },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.error("PANEL_DASHBOARD_ASSIGNMENTS_ERROR", e);
  }

  try {
    todayLeadCount = await prisma.lead.count({
      where: {
        createdAt: { gte: since24h },
        assignments: { some: { clinicId: session.clinicId } },
      },
    });
  } catch (e) {
    console.error("PANEL_DASHBOARD_TODAY_COUNT_ERROR", e);
  }

  try {
    const assignments = await prisma.leadAssignment.findMany({
      where: {
        clinicId: session.clinicId,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        unlocked: true,
        lead: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            city: true,
            service: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    lastLeads = assignments.map((a) => ({
      id: a.lead.id,
      fullName: a.lead.fullName,
      phone: a.lead.phone,
      city: a.lead.city,
      service: a.lead.service,
      status: a.lead.status,
      createdAt: a.lead.createdAt,
      unlocked: a.unlocked,
    }));
  } catch (e) {
    console.error("PANEL_DASHBOARD_LAST_LEADS_ERROR", e);
  }

  try {
    coverageCount = await prisma.clinicCoverage.count({
      where: {
        clinicId: session.clinicId,
        isActive: true,
      },
    });
  } catch (e) {
    console.error("PANEL_DASHBOARD_COVERAGE_ERROR", e);
  }

  const map = new Map<string, number>();

  for (const a of assignments14d) {
    const d = startOfDayLocal(a.createdAt);
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  const series: DailyPoint[] = [];

  for (let i = 0; i < trendDays; i++) {
    const d = addDays(startDay, i);
    const key = d.toISOString().slice(0, 10);
    series.push({ label: formatDayLabel(d), value: map.get(key) ?? 0 });
  }

  const values = series.map((x) => x.value);
  const sparkW = 520;
  const sparkH = 120;
  const sparkPad = 10;
  const pathD = buildSparkPath(values, sparkW, sparkH, sparkPad);
  const maxV = Math.max(...values, 0);

  const hasActiveSub = Boolean(activeSub);

  return (
    <div className="panelWrap">
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">🏥 Klinik Paneli</div>
          <h1 className="panelTitle">Hoş geldin, {session.name}</h1>
          <div className="panelSub">
            Bugün panelde: <strong>{todayLeadCount}</strong> lead (son 24 saat) •{" "}
            <strong>{coverageCount}</strong> aktif kapsam • <strong>{creditBalance}</strong> kredi
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link className="panelQuickBtn" href="/panel/leadler">
            Leadler →
          </Link>
          <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel/abonelik">
            Kredi Al →
          </Link>
          <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel/hizmetler">
            Kapsamlar →
          </Link>
        </div>
      </div>

      <div className="panelGrid3">
        <div className="panelStatCard panelStatCardAccent">
          <div className="panelStatTop">
            <div className="panelStatLabel">Kredi Bakiyesi</div>
            <div className="panelStatIcon">💎</div>
          </div>

          <div className="panelStatValue">{creditBalance}</div>
          <div className="panelStatHint">1 kredi = 1 lead açma hakkı</div>

          <div className="panelStatFoot">
            <Link className="panelLink panelLinkStrong" href="/panel/abonelik">
              Kredi Satın Al →
            </Link>
          </div>
        </div>

        <div className="panelStatCard">
          <div className="panelStatTop">
            <div className="panelStatLabel">Premium Durumu</div>
            <div className="panelStatIcon">⭐</div>
          </div>

          <div className="panelStatRow">
            <div className="panelStatValueSmall">{isPremiumActive ? "Aktif" : "Pasif"}</div>
            <div className="panelStatBadge">{clinic?.autoRenewPremium ? "Oto yenileme açık" : "Standart"}</div>
          </div>

          <div className="panelStatHint">
            {isPremiumActive && clinic?.premiumExpiresAt ? (
              <>
                Bitiş: <strong>{formatTR(clinic.premiumExpiresAt)}</strong>
              </>
            ) : (
              <>Premium ile öncelikli lead erişimi kazanırsın.</>
            )}
          </div>

          <div className="panelStatFoot">
            <Link className="panelLink" href="/panel/abonelik">
              Premium Paket →
            </Link>
          </div>
        </div>

        <div className="panelStatCard">
          <div className="panelStatTop">
            <div className="panelStatLabel">Aktif Hizmet</div>
            <div className="panelStatIcon">🧩</div>
          </div>
          <div className="panelStatValue">{coverageCount}</div>
          <div className="panelStatHint">Şehir + hizmet eşleşmeleri</div>
          <div className="panelStatFoot">
            <Link className="panelLink" href="/panel/hizmetler">
              Düzenle →
            </Link>
          </div>
        </div>
      </div>

      {creditBalance <= 0 ? (
        <div className="panelQuotaAlert">
          <div>
            <div className="panelQuotaTitle">💎 Kredin yok</div>
            <div className="panelQuotaDesc">
              Yeni leadlerin iletişim bilgilerini açmak için kredi satın almalısın.
            </div>
          </div>

          <Link href="/panel/abonelik" className="panelQuotaBtn">
            Kredi Satın Al →
          </Link>
        </div>
      ) : null}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">📊 Lead Trend (Son 14 Gün)</div>
            <div className="panelCardSub">
              Atama bazlı günlük dağılım. Tepe gün: <strong>{maxV}</strong>
            </div>
          </div>
          <div className="panelCardHeadRight">
            <span className="panelPill">Günlük</span>
            <span className="panelPill panelPillSoft">Atama</span>
          </div>
        </div>

        <div className="panelChartShell">
          <svg
            width="100%"
            height={sparkH}
            viewBox={`0 0 ${sparkW} ${sparkH}`}
            role="img"
            aria-label="Lead trend grafiği"
          >
            <g opacity={0.18}>
              <line x1="0" y1={sparkH - 1} x2={sparkW} y2={sparkH - 1} stroke="currentColor" />
              <line x1="0" y1={sparkH * 0.66} x2={sparkW} y2={sparkH * 0.66} stroke="currentColor" />
              <line x1="0" y1={sparkH * 0.33} x2={sparkW} y2={sparkH * 0.33} stroke="currentColor" />
            </g>

            {pathD ? (
              <>
                <path
                  d={`${pathD} L ${sparkW - sparkPad} ${sparkH - sparkPad} L ${sparkPad} ${
                    sparkH - sparkPad
                  } Z`}
                  fill="currentColor"
                  opacity={0.06}
                />
                <path d={pathD} fill="none" stroke="currentColor" strokeWidth="3" opacity={0.85} />
              </>
            ) : null}
          </svg>

          <div className="panelChartLabels" aria-hidden>
            {series.map((p) => (
              <div key={p.label} className="panelChartTick" title={`${p.label}: ${p.value}`}>
                {p.label}
              </div>
            ))}
          </div>
        </div>

        <div className="panelChartLegend">
          <div className="panelLegendItem">
            <span className="panelLegendDot" /> Günlük lead (atama)
          </div>
          <div className="panelLegendItem panelLegendMuted">
            Not: Gerçek dönüşler klinik iletişimine göre değişir.
          </div>
        </div>
      </div>

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">🔥 Son Leadler</div>
            <div className="panelCardSub">En son atanan 10 lead.</div>
          </div>

          <Link href="/panel/leadler" className="panelMiniCta">
            Tümünü gör →
          </Link>
        </div>

        {lastLeads.length === 0 ? (
          <div className="panelEmpty">Henüz lead yok.</div>
        ) : (
          <div className="panelLeadList">
            {lastLeads.map((l) => {
              const shownName = l.unlocked ? l.fullName : maskName(l.fullName);
              const shownPhone = l.unlocked ? l.phone : maskPhone(l.phone);

              return (
                <div
                  key={l.id}
                  className={`panelLeadRow ${isNewLead(l, now) ? "panelLeadRowNew" : ""}`}
                >
                  <div className="panelLeadMain">
                    <div className="panelLeadTop">
                      <div className="panelLeadName">
                        {shownName} <span className="panelLeadSep">•</span> {shownPhone}
                      </div>

                      <div className="panelLeadRight">
                        {isNewLead(l, now) ? <span className="panelNewBadge">Yeni</span> : null}
                        {!l.unlocked ? <span className="panelLeadStatus panelLeadStatusNew">Kilitli</span> : null}
                        <span className="panelLeadTime">{formatTR(l.createdAt)}</span>
                      </div>
                    </div>

                    <div className="panelLeadMeta">
                      <span className="panelChip">📍 {l.city}</span>
                      <span className="panelChip panelChipSoft">🦷 {l.service}</span>
                      <span className="panelChip panelChipMuted">Durum: {l.status}</span>
                    </div>
                  </div>

                  <div className="panelLeadActions">
                    <Link className="panelBtn" href={`/panel/leadler/${l.id}`}>
                      {l.unlocked ? "Detay →" : "Kilidi Aç →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hasActiveSub ? (
        <div className="panelAlert">
          <div className="panelAlertTitle">Eski abonelik bilgisi</div>
          <div className="panelAlertDesc">
            Eski kota sisteminde kalan: <strong>{remaining}</strong> / {quotaTotal} • Kullanım: %{quotaPct}.
            Yeni sistemde lead açma işlemleri kredi bakiyesi üzerinden ilerler.
          </div>
        </div>
      ) : null}
    </div>
  );
}