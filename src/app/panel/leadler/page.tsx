import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyClinicSession } from "@/lib/auth";

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

type QuotaInfo = {
  quotaTotal: number;
  quotaUsed: number;
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

export default async function PanelLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<JSX.Element> {
  const sp = await searchParams;

  const token = (await cookies()).get("clinic_session")?.value ?? "";
  const session = token ? await verifyClinicSession(token) : null;

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Yetkisiz</h1>
        <div>
          Lütfen <a href="/login">/login</a> üzerinden giriş yap.
        </div>
      </div>
    );
  }

  const activeSub = await prisma.subscription.findFirst({
    where: {
      clinicId: session.clinicId,
      status: "active",
      expiresAt: { gt: new Date() },
    },
    orderBy: { startedAt: "desc" },
    select: { quotaTotal: true, quotaUsed: true },
  });

  const quota: QuotaInfo | null = activeSub
    ? { quotaTotal: activeSub.quotaTotal, quotaUsed: activeSub.quotaUsed }
    : null;

  const remaining = quota ? Math.max(0, quota.quotaTotal - quota.quotaUsed) : 0;

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
    clinicNote: l.clinicNote,
    lastContactAt: l.lastContactAt,
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
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Leadler</h1>
        <div style={{ opacity: 0.8 }}>Klinik: {session.name}</div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 14, display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 700 }}>Kota Durumu</div>
        {!quota && <div style={{ opacity: 0.75 }}>Aktif abonelik/kota bulunamadı.</div>}
        {quota && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div>
              <strong>Kullanılan:</strong> {quota.quotaUsed}
            </div>
            <div>
              <strong>Toplam:</strong> {quota.quotaTotal}
            </div>
            <div>
              <strong>Kalan:</strong> {remaining}
            </div>
          </div>
        )}
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 14, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 800 }}>Filtre</div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={buildHref({ status: "" })} style={pill(statusFilter === "all")}>
            Tümü
          </Link>

          {(["new", "contacted", "won", "lost"] as LeadStatus[]).map((s) => (
            <Link key={s} href={buildHref({ status: s })} style={pill(statusFilter === s)}>
              {STATUS_LABEL[s]}
            </Link>
          ))}
        </div>

        <form action="/panel/leadler" method="GET" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Ad veya telefon ara…"
            style={{ flex: "1 1 260px", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", outline: "none" }}
          />
          <button type="submit" style={btn()}>
            Ara
          </button>

          <Link href="/panel/leadler" style={btnSecondary()}>
            Sıfırla
          </Link>
        </form>
      </div>

      {rows.length === 0 && <div>Bu filtrede lead yok.</div>}

      {rows.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 700 }}>
                  {r.fullName} — {r.phone}
                </div>
                <div style={{ opacity: 0.7 }}>{new Date(r.createdAt).toLocaleString("tr-TR")}</div>
              </div>

              <div style={{ marginTop: 6 }}>
                <strong>Şehir:</strong> {r.city} &nbsp; | &nbsp; <strong>Hizmet:</strong> {r.service}
              </div>

              <div style={{ marginTop: 6 }}>
                <strong>Durum:</strong> {STATUS_LABEL[r.status]}
              </div>

              <div style={{ marginTop: 6, opacity: 0.85, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong>Son arama:</strong> {r.lastContactAt ? new Date(r.lastContactAt).toLocaleString("tr-TR") : "—"}
                </div>
                <div>
                  <strong>Not:</strong> {r.clinicNote && r.clinicNote.trim().length > 0 ? "📝 Var" : "—"}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <Link href={`/panel/leadler/${r.id}`} style={detailBtn()}>
                  Detay →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function pill(active: boolean): React.CSSProperties {
  return {
    textDecoration: "none",
    fontWeight: 900,
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
  };
}

function btn(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  };
}

function btnSecondary(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    color: "#111",
  };
}

function detailBtn(): React.CSSProperties {
  return {
    display: "inline-block",
    textDecoration: "none",
    fontWeight: 800,
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
  };
}
