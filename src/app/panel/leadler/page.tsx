import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireClinic } from "@/lib/clinic-auth";

export const dynamic = "force-dynamic";

type LeadStatus = "new" | "contacted" | "won" | "lost";

type Row = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  status: LeadStatus;
  clinicNote: string | null;
  lastContactAt: Date | null;
  createdAt: Date;
};

type SearchParams = {
  status?: string;
  q?: string;
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

function normalizeQuery(v: string | undefined): string {
  return (v ?? "").trim().slice(0, 80);
}

function normalizeStatus(v: string | undefined): LeadStatus | "all" {
  if (v === "new" || v === "contacted" || v === "won" || v === "lost") return v;
  return "all";
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatTR(d: Date): string {
  return d.toLocaleString("tr-TR");
}

function isNewRow(r: Row, now: Date): boolean {
  const diff = now.getTime() - r.createdAt.getTime();
  const sixHours = 6 * 60 * 60 * 1000;
  return r.status === "new" && diff >= 0 && diff <= sixHours;
}

function statusBadgeClass(s: LeadStatus): string {
  if (s === "new") return "panelLeadStatus panelLeadStatusNew";
  if (s === "contacted") return "panelLeadStatus panelLeadStatusContacted";
  if (s === "won") return "panelLeadStatus panelLeadStatusWon";
  return "panelLeadStatus panelLeadStatusLost";
}

export default async function PanelLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<JSX.Element> {
  const sp = await searchParams;
  const session = await requireClinic();

  const now = new Date();

  const activeSub = await prisma.subscription.findFirst({
    where: {
      clinicId: session.clinicId,
      status: "active",
      expiresAt: { gt: new Date() },
    },
    orderBy: { startedAt: "desc" },
    select: { quotaTotal: true, quotaUsed: true, expiresAt: true },
  });

  const quotaTotal = activeSub?.quotaTotal ?? 0;
  const quotaUsed = activeSub?.quotaUsed ?? 0;
  const remaining = Math.max(0, quotaTotal - quotaUsed);
  const quotaPct = quotaTotal > 0 ? clamp(Math.round((quotaUsed / quotaTotal) * 100), 0, 100) : 0;

  const q = normalizeQuery(sp.q);
  const statusFilter = normalizeStatus(sp.status);

  const leads = await prisma.lead.findMany({
    where: {
      assignments: { some: { clinicId: session.clinicId } },
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(q
        ? {
            OR: [{ fullName: { contains: q } }, { phone: { contains: q } }],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      city: true,
      service: true,
      fullName: true,
      phone: true,
      status: true,
      clinicNote: true,
      lastContactAt: true,
      createdAt: true,
    },
  });

  const rows: Row[] = leads.map((l) => ({
    id: l.id,
    city: l.city,
    service: l.service,
    fullName: l.fullName,
    phone: l.phone,
    status: l.status as LeadStatus,
    clinicNote: null,
    lastContactAt: null,
    createdAt: l.createdAt,
  }));

  const buildHref = (next: { status?: string; q?: string }): string => {
    const params = new URLSearchParams();
    const ns = next.status ?? (statusFilter === "all" ? "" : statusFilter);
    const nq = next.q ?? q;

    if (ns) params.set("status", ns);
    if (nq) params.set("q", nq);

    const s = params.toString();
    return s ? `/panel/leadler?${s}` : "/panel/leadler";
  };

  return (
    <div className="panelWrap">
      {/* Header */}
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">📥 Leadler</div>
          <h1 className="panelTitle">Lead Yönetimi</h1>
          <div className="panelSub">
            Klinik: <strong>{session.name}</strong> • Toplam: <strong>{rows.length}</strong>
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel">
            Dashboard →
          </Link>
          <Link className="panelQuickBtn" href="/panel/abonelik">
            Kota / Abonelik →
          </Link>
        </div>
      </div>

      {/* Quota card */}
      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">💎 Kota Durumu</div>
            <div className="panelCardSub">
              {activeSub ? (
                <>
                  Kullanılan <strong>{quotaUsed}</strong> / <strong>{quotaTotal}</strong> • Kalan{" "}
                  <strong>{remaining}</strong>
                </>
              ) : (
                <>Aktif abonelik/kota bulunamadı. Lead almak için abonelik gerekli.</>
              )}
            </div>
          </div>

          {activeSub ? (
            <div className="panelCardHeadRight">
              <span className="panelPill">Aktif</span>
              <span className="panelPill panelPillSoft">%{quotaPct}</span>
            </div>
          ) : (
            <div className="panelCardHeadRight">
              <span className="panelPill">Pasif</span>
            </div>
          )}
        </div>

        <div className="panelProgress" style={{ marginTop: 10 }}>
          <div className="panelProgressBar" style={{ width: `${activeSub ? quotaPct : 0}%` }} />
        </div>

        {activeSub ? (
          <div style={{ marginTop: 10 }} className="panelStatHint">
            Bitiş: <strong>{activeSub.expiresAt ? formatTR(activeSub.expiresAt) : "—"}</strong>
          </div>
        ) : null}
      </div>

      {/* Filters */}
      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">🔎 Filtrele & Ara</div>
            <div className="panelCardSub">Duruma göre filtrele veya ad/telefon ile ara.</div>
          </div>
        </div>

        <div className="panelFilterShell">
          <div className="panelFilterPills">
            <Link
              href={buildHref({ status: "" })}
              className={statusFilter === "all" ? "panelFilterPill panelFilterPillActive" : "panelFilterPill"}
            >
              Tümü
            </Link>

            {(["new", "contacted", "won", "lost"] as LeadStatus[]).map((s) => (
              <Link
                key={s}
                href={buildHref({ status: s })}
                className={statusFilter === s ? "panelFilterPill panelFilterPillActive" : "panelFilterPill"}
              >
                {STATUS_LABEL[s]}
              </Link>
            ))}
          </div>

          <form action="/panel/leadler" method="GET" className="panelSearchRow">
            {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}

            <input
              name="q"
              defaultValue={q}
              placeholder="Ad veya telefon ara…"
              className="panelInput"
              autoComplete="off"
            />

            <button type="submit" className="panelBtnSoft">
              Ara
            </button>

            <Link href="/panel/leadler" className="panelBtnGhost">
              Sıfırla
            </Link>
          </form>
        </div>
      </div>

      {/* List */}
      {rows.length === 0 ? (
        <div className="panelEmpty">Bu filtrede lead yok.</div>
      ) : (
        <div className="panelCard">
          <div className="panelCardHead">
            <div>
              <div className="panelCardTitle">📋 Lead Listesi</div>
              <div className="panelCardSub">Detaya girip durum güncelleyebilir ve not ekleyebilirsin.</div>
            </div>
          </div>

          <div className="panelLeadList">
            {rows.map((r) => (
              <div key={r.id} className="panelLeadRow">
                <div className="panelLeadMain">
                  <div className="panelLeadTop">
                    <div className="panelLeadName">
                      {r.fullName} <span className="panelLeadSep">•</span> {r.phone}
                    </div>

                    <div className="panelLeadRight">
                      {isNewRow(r, now) ? <span className="panelNewBadge">Yeni</span> : null}
                      <span className={statusBadgeClass(r.status)}>{STATUS_LABEL[r.status]}</span>
                      <span className="panelLeadTime">{formatTR(r.createdAt)}</span>
                    </div>
                  </div>

                  <div className="panelLeadMeta">
                    <span className="panelChip">📍 {r.city}</span>
                    <span className="panelChip panelChipSoft">🦷 {r.service}</span>

                    <span className="panelChip panelChipMuted">
                      Son arama: {r.lastContactAt ? formatTR(r.lastContactAt) : "—"}
                    </span>

                    <span className="panelChip panelChipMuted">
                      Not: {r.clinicNote && r.clinicNote.trim().length > 0 ? "📝 Var" : "—"}
                    </span>
                  </div>
                </div>

                <div className="panelLeadActions">
                  <Link href={`/panel/leadler/${r.id}`} className="panelBtn">
                    Detay →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}