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
  createdAt: Date;
  unlocked: boolean;
  unlockPrice: number;
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

function safeStatus(v: string): LeadStatus {
  if (v === "new" || v === "contacted" || v === "won" || v === "lost") return v;
  return "new";
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

export default async function PanelLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<JSX.Element> {
  const sp = await searchParams;
  const session = await requireClinic();

  const now = new Date();

  let creditBalance = 0;
  let rows: Row[] = [];
  let loadError: string | null = null;

  const q = normalizeQuery(sp.q);
  const statusFilter = normalizeStatus(sp.status);

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.clinicId },
      select: { creditBalance: true },
    });

    creditBalance = clinic?.creditBalance ?? 0;
  } catch (e) {
    console.error("PANEL_LEADLER_CREDIT_ERROR", e);
  }

  try {
    const assignments = await prisma.leadAssignment.findMany({
      where: {
        clinicId: session.clinicId,
        lead: {
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          ...(q
            ? {
                OR: [{ fullName: { contains: q } }, { phone: { contains: q } }],
              }
            : {}),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        unlocked: true,
        unlockPrice: true,
        lead: {
          select: {
            id: true,
            city: true,
            service: true,
            fullName: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    rows = assignments.map((a) => ({
      id: a.lead.id,
      city: a.lead.city,
      service: a.lead.service,
      fullName: a.lead.fullName,
      phone: a.lead.phone,
      status: safeStatus(a.lead.status),
      createdAt: a.lead.createdAt,
      unlocked: a.unlocked,
      unlockPrice: Math.max(1, a.unlockPrice ?? 1),
    }));
  } catch (e) {
    console.error("PANEL_LEADLER_LEADS_ERROR", e);
    loadError = "Leadler şu an yüklenemedi. Panelin diğer alanlarını kullanmaya devam edebilirsin.";
  }

  const lockedCount = rows.filter((r) => !r.unlocked).length;
  const unlockedCount = rows.filter((r) => r.unlocked).length;

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
      <div className="panelHeader">
        <div className="panelHeaderLeft">
          <div className="panelKicker">📥 Leadler</div>
          <h1 className="panelTitle">Lead Yönetimi</h1>
          <div className="panelSub">
            Klinik: <strong>{session.name}</strong> • Toplam: <strong>{rows.length}</strong> • Kilitli:{" "}
            <strong>{lockedCount}</strong> • Açılmış: <strong>{unlockedCount}</strong>
          </div>
        </div>

        <div className="panelHeaderRight">
          <Link className="panelQuickBtn panelQuickBtnSoft" href="/panel">
            Dashboard →
          </Link>
          <Link className="panelQuickBtn" href="/panel/abonelik">
            💎 Kredi: {creditBalance}
          </Link>
        </div>
      </div>

      {loadError ? (
        <div className="panelCard">
          <div className="panelCardTitle">⚠️ Leadler yüklenemedi</div>
          <div className="panelCardSub" style={{ marginTop: 8 }}>
            {loadError}
          </div>
        </div>
      ) : null}

      <div className="panelCard">
        <div className="panelCardHead">
          <div>
            <div className="panelCardTitle">💎 Kredi Durumu</div>
            <div className="panelCardSub">
              Lead iletişim bilgilerini açmak için kredi kullanılır. 1 kredi = 1 lead açma hakkı.
            </div>
          </div>

          <div className="panelCardHeadRight">
            <span className="panelPill">Kredi: {creditBalance}</span>
            <Link href="/panel/abonelik" className="panelMiniCta">
              Kredi Al →
            </Link>
          </div>
        </div>

        {creditBalance <= 0 ? (
          <div style={{ marginTop: 10 }} className="panelStatHint">
            Kredin yok. Kilitli leadleri açmak için kredi satın almalısın.
          </div>
        ) : null}
      </div>

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
            {statusFilter !== "all" ? <input type="hidden" name="status" value={statusFilter} /> : null}

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

      {rows.length === 0 ? (
        <div className="panelEmpty">{loadError ? "Leadler yüklenemedi." : "Bu filtrede lead yok."}</div>
      ) : (
        <div className="panelCard">
          <div className="panelCardHead">
            <div>
              <div className="panelCardTitle">📋 Lead Listesi</div>
              <div className="panelCardSub">
                Kilitli leadlerde iletişim bilgileri maskelenir. Detaya girip kredi ile açabilirsin.
              </div>
            </div>
          </div>

          <div className="panelLeadList">
            {rows.map((r) => {
              const shownName = r.unlocked ? r.fullName : maskName(r.fullName);
              const shownPhone = r.unlocked ? r.phone : maskPhone(r.phone);

              return (
                <div key={r.id} className="panelLeadRow">
                  <div className="panelLeadMain">
                    <div className="panelLeadTop">
                      <div className="panelLeadName">
                        {shownName} <span className="panelLeadSep">•</span> {shownPhone}
                      </div>

                      <div className="panelLeadRight">
                        {isNewRow(r, now) ? <span className="panelNewBadge">Yeni</span> : null}
                        {!r.unlocked ? <span className="panelLeadStatus panelLeadStatusNew">Kilitli</span> : null}
                        <span className={statusBadgeClass(r.status)}>{STATUS_LABEL[r.status]}</span>
                        <span className="panelLeadTime">{formatTR(r.createdAt)}</span>
                      </div>
                    </div>

                    <div className="panelLeadMeta">
                      <span className="panelChip">📍 {r.city}</span>
                      <span className="panelChip panelChipSoft">🦷 {r.service}</span>
                      {!r.unlocked ? (
                        <span className="panelChip panelChipMuted">🔒 Açma bedeli: {r.unlockPrice} kredi</span>
                      ) : (
                        <span className="panelChip panelChipMuted">✅ Açıldı</span>
                      )}
                    </div>
                  </div>

                  <div className="panelLeadActions">
                    <Link href={`/panel/leadler/${r.id}`} className="panelBtn">
                      {r.unlocked ? "Detay →" : "Kilidi Aç →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}