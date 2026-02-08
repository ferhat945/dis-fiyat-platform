"use client";

import { useMemo, useState } from "react";

type CoverageRow = {
  id: string;
  clinicId: string;
  city: string;
  service: string;
  isActive: boolean;
};

type ApiList = { ok: boolean; coverages?: CoverageRow[]; code?: string };
type ApiOk = { ok: boolean; code?: string };

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export default function PanelCoveragesClient({ initialCoverages }: { initialCoverages: CoverageRow[] }): JSX.Element {
  const [rows, setRows] = useState<CoverageRow[]>(initialCoverages);
  const [city, setCity] = useState("");
  const [service, setService] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const activeCount = useMemo(() => rows.filter((r) => r.isActive).length, [rows]);

  async function refresh(): Promise<void> {
    const r = await fetch("/api/panel/coverages", { cache: "no-store" });
    const j = (await r.json()) as ApiList;
    if (r.ok && j.ok && j.coverages) setRows(j.coverages);
  }

  async function add(): Promise<void> {
    setErr(null);
    const c = normalize(city);
    const s = normalize(service);
    if (c.length < 2 || s.length < 2) {
      setErr("CITY_SERVICE_REQUIRED");
      return;
    }

    const r = await fetch("/api/panel/coverages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: c, service: s }),
    });

    const j = (await r.json()) as ApiOk;
    if (!r.ok || !j.ok) {
      setErr(j.code ?? "ADD_FAILED");
      return;
    }

    setCity("");
    setService("");
    await refresh();
  }

  async function toggle(id: string, next: boolean): Promise<void> {
    setErr(null);
    const r = await fetch("/api/panel/coverages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: next }),
    });
    const j = (await r.json()) as ApiOk;
    if (!r.ok || !j.ok) {
      setErr(j.code ?? "TOGGLE_FAILED");
      return;
    }
    await refresh();
  }

  async function remove(id: string): Promise<void> {
    setErr(null);
    const r = await fetch("/api/panel/coverages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const j = (await r.json()) as ApiOk;
    if (!r.ok || !j.ok) {
      setErr(j.code ?? "DELETE_FAILED");
      return;
    }
    await refresh();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Yeni Coverage Ekle</div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Şehir (örn: istanbul)" style={inp()} />
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Hizmet (örn: implant)"
            style={inp()}
          />
        </div>

        <button onClick={add} style={btnPrimary()} disabled={normalize(city).length < 2 || normalize(service).length < 2}>
          Ekle
        </button>

        {err && <div style={{ marginTop: 8, color: "crimson", fontWeight: 900 }}>Hata: {err}</div>}
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900 }}>Mevcut Coverages</div>
          <div style={{ opacity: 0.75, fontWeight: 800 }}>Aktif: {activeCount}</div>
        </div>

        {rows.length === 0 && <div style={{ marginTop: 10, opacity: 0.75 }}>Henüz coverage yok.</div>}

        {rows.length > 0 && (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {r.city} / {r.service}
                  </div>
                  <div style={{ fontWeight: 900, opacity: 0.75 }}>{r.isActive ? "Aktif" : "Pasif"}</div>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggle(r.id, !r.isActive)}
                    style={r.isActive ? btnOutline() : btnPrimary()}
                  >
                    {r.isActive ? "Pasif Yap" : "Aktif Yap"}
                  </button>

                  <button onClick={() => remove(r.id)} style={btnDanger()}>
                    Sil
                  </button>
                </div>

                <div style={{ marginTop: 8, opacity: 0.6, fontSize: 12 }}>ID: {r.id}</div>
              </div>
            ))}
          </div>
        )}
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
    cursor: "pointer",
  };
}

function btnOutline(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#fff",
    color: "#111",
    fontWeight: 900,
    cursor: "pointer",
  };
}

function btnDanger(): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #c00",
    background: "#c00",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  };
}
