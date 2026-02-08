"use client";

import { useMemo, useState } from "react";

type ClinicMini = { id: string; name: string; email: string; isActive: boolean };
type CoverageRow = {
  id: string;
  clinicId: string;
  city: string;
  service: string;
  isActive: boolean;
  clinic: { name: string };
};

type ApiRes = { ok: boolean; code?: string; coverages?: CoverageRow[] };

export default function AdminCoveragesClient({
  initialClinics,
  initialCoverages,
}: {
  initialClinics: ClinicMini[];
  initialCoverages: CoverageRow[];
}): JSX.Element {
  const [coverages, setCoverages] = useState<CoverageRow[]>(initialCoverages);

  const clinics = useMemo(() => initialClinics.filter((c) => c.isActive), [initialClinics]);

  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [city, setCity] = useState("istanbul");
  const [service, setService] = useState("implant");
  const [err, setErr] = useState<string | null>(null);

  async function refresh(): Promise<void> {
    const r = await fetch("/api/admin/coverages", { cache: "no-store" });
    const j: ApiRes = (await r.json()) as ApiRes;
    if (r.ok && j.ok && j.coverages) setCoverages(j.coverages);
    else setErr(j.code ?? "REFRESH_FAILED");
  }

  async function create(): Promise<void> {
    setErr(null);
    try {
      const r = await fetch("/api/admin/coverages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId, city, service, isActive: true }),
      });
      const j: { ok: boolean; code?: string } = (await r.json()) as { ok: boolean; code?: string };
      if (!r.ok || !j.ok) {
        setErr(j.code ?? "CREATE_FAILED");
        return;
      }
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    }
  }

  async function toggle(id: string, next: boolean): Promise<void> {
    setErr(null);
    try {
      const r = await fetch("/api/admin/coverages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: next }),
      });
      const j: { ok: boolean; code?: string } = (await r.json()) as { ok: boolean; code?: string };
      if (!r.ok || !j.ok) {
        setErr(j.code ?? "PATCH_FAILED");
        return;
      }
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    }
  }

  async function del(id: string): Promise<void> {
    setErr(null);
    try {
      const r = await fetch("/api/admin/coverages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const j: { ok: boolean; code?: string } = (await r.json()) as { ok: boolean; code?: string };
      if (!r.ok || !j.ok) {
        setErr(j.code ?? "DELETE_FAILED");
        return;
      }
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Coverage Ekle</div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} style={inp()}>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>

          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="şehir (istanbul)" style={inp()} />
          <input value={service} onChange={(e) => setService(e.target.value)} placeholder="hizmet (implant)" style={inp()} />
        </div>

        {err && <div style={{ color: "crimson", marginTop: 8, fontWeight: 800 }}>Hata: {err}</div>}

        <button onClick={create} disabled={!clinicId || city.length < 2 || service.length < 2} style={btnPrimary()}>
          Coverage Ekle
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Coverage Listesi</div>

        <div style={{ display: "grid", gap: 10 }}>
          {coverages.map((c) => (
            <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                  {c.city} / {c.service} — <span style={{ opacity: 0.75 }}>{c.clinic.name}</span>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggle(c.id, !c.isActive)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      background: c.isActive ? "#111" : "#fff",
                      color: c.isActive ? "#fff" : "#111",
                      fontWeight: 900,
                    }}
                  >
                    {c.isActive ? "Aktif" : "Pasif"}
                  </button>

                  <button
                    onClick={() => del(c.id)}
                    style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", fontWeight: 900 }}
                  >
                    Sil
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 8, opacity: 0.65, fontSize: 12 }}>ID: {c.id}</div>
            </div>
          ))}
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
  };
}
