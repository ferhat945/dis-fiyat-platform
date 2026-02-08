"use client";

import { useMemo, useState } from "react";

type ClinicMini = { id: string; name: string; email: string; isActive: boolean };

type SubRow = {
  id: string;
  clinicId: string;
  status: string;
  quotaTotal: number;
  quotaUsed: number;
  startedAt: Date;
  expiresAt: Date;
  clinic: { name: string; email: string };
};

function jsonHeaders(): HeadersInit {
  return { "Content-Type": "application/json" };
}

export default function AdminSubscriptionsClient({
  initialClinics,
  initialSubs,
}: {
  initialClinics: ClinicMini[];
  initialSubs: SubRow[];
}): JSX.Element {
  const clinics = useMemo(() => initialClinics.filter((c) => c.isActive), [initialClinics]);
  const [subs, setSubs] = useState<SubRow[]>(initialSubs);

  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [quotaAdd, setQuotaAdd] = useState(10);
  const [days, setDays] = useState(30);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh(): Promise<void> {
    const r = await fetch("/api/admin/subscriptions", { cache: "no-store" });
    const j: { ok: boolean; subscriptions?: SubRow[]; code?: string } = (await r.json()) as {
      ok: boolean;
      subscriptions?: SubRow[];
      code?: string;
    };

    if (!r.ok || !j.ok) {
      setErr(j.code ?? `REFRESH_FAILED_HTTP_${r.status}`);
      return;
    }

    if (j.subscriptions) setSubs(j.subscriptions);
  }

  async function grant(): Promise<void> {
    setErr(null);
    setLoading(true);

    try {
      const r = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ clinicId, quotaAdd, days }),
      });

      const j: { ok: boolean; code?: string } = (await r.json()) as { ok: boolean; code?: string };

      if (!r.ok || !j.ok) {
        setErr(j.code ?? `GRANT_FAILED_HTTP_${r.status}`);
        return;
      }

      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Kota Yükle (Manuel)</div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} style={inp()}>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>

          <input
            type="number"
            value={quotaAdd}
            onChange={(e) => setQuotaAdd(Number(e.target.value))}
            style={inp()}
            min={1}
          />

          <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} style={inp()} min={1} />
        </div>

        {err && <div style={{ color: "crimson", marginTop: 8, fontWeight: 800 }}>Hata: {err}</div>}

        <button
          onClick={grant}
          disabled={loading || !clinicId || quotaAdd < 1 || days < 1}
          style={btnPrimary()}
        >
          {loading ? "Yükleniyor..." : "Kota Yükle"}
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Son Abonelikler</div>

        <div style={{ display: "grid", gap: 10 }}>
          {subs.map((s) => {
            const remaining = Math.max(0, s.quotaTotal - s.quotaUsed);
            return (
              <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {s.clinic.name} <span style={{ opacity: 0.7 }}>({s.clinic.email})</span>
                  </div>
                  <div style={{ opacity: 0.7 }}>
                    {new Date(s.startedAt).toLocaleDateString("tr-TR")} →{" "}
                    {new Date(s.expiresAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>

                <div style={{ marginTop: 6 }}>
                  <strong>Durum:</strong> {s.status} &nbsp; | &nbsp;
                  <strong>Kullanılan:</strong> {s.quotaUsed} &nbsp; | &nbsp;
                  <strong>Toplam:</strong> {s.quotaTotal} &nbsp; | &nbsp;
                  <strong>Kalan:</strong> {remaining}
                </div>

                <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>ID: {s.id}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function inp(): React.CSSProperties {
  return { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" };
}

function btnPrimary(): React.CSSProperties {
  return {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    opacity: 1,
  };
}
