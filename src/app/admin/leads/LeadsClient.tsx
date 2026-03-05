// src/app/admin/leads/LeadsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type AssignedClinic = {
  id: string;
  name: string;
  email: string;
};

type Lead = {
  id: string;
  city: string;
  service: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string | null;
  intent: string;
  source: string | null;
  status: string;
  createdAt: string; // API JSON ile string gelir
  assignedClinic: AssignedClinic | null;
};

type LeadsResp =
  | { ok: true; leads: Lead[] }
  | { ok: false; code: string };

function formatTR(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("tr-TR");
}

function pillStyle(bg: string, border: string, color: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontWeight: 900,
    fontSize: 12,
    lineHeight: 1,
  };
}

export default function LeadsClient(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState<string>(""); // basit arama

  const load = async (): Promise<void> => {
    if (!adminKey.trim()) {
      setErr("Admin key gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/leads", {
        method: "GET",
        headers: { "x-admin-key": adminKey.trim() },
        cache: "no-store",
      });

      const j = (await r.json()) as LeadsResp;

      if (!r.ok || !j.ok) {
        setErr(j.ok ? "UNKNOWN" : j.code);
        setLeads([]);
        return;
      }

      setLeads(j.leads);
    } catch {
      setErr("NETWORK_ERROR");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // adminKey değişince hatayı temizle
    setErr(null);
  }, [adminKey]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return leads;

    return leads.filter((l) => {
      const hay = [
        l.city,
        l.service,
        l.fullName,
        l.phone,
        l.email ?? "",
        l.message ?? "",
        l.status,
        l.intent,
        l.source ?? "",
        l.assignedClinic?.name ?? "",
        l.assignedClinic?.email ?? "",
        l.id,
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [leads, q]);

  return (
    <div style={{ padding: 16, maxWidth: 1050, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 950, marginBottom: 12 }}>Admin • Leadler</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Admin Key</div>

        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="x-admin-key"
          style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Yükleniyor..." : "Leadleri Yükle"}
          </button>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: isim / tel / şehir / hizmet / klinik..."
            style={{
              flex: "1 1 320px",
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </div>
      </div>

      {err && (
        <div
          style={{
            border: "1px solid #f2c9c9",
            background: "#fff5f5",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            fontWeight: 800,
          }}
        >
          <strong>Hata:</strong> {err}
        </div>
      )}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 950 }}>Kayıtlar</div>
          <div style={{ opacity: 0.75, fontWeight: 900 }}>
            Toplam: {filtered.length} / {leads.length}
          </div>
        </div>

        {loading ? (
          <div style={{ marginTop: 10, opacity: 0.75 }}>Yükleniyor…</div>
        ) : filtered.length === 0 ? (
          <div style={{ marginTop: 10, opacity: 0.75 }}>Kayıt yok.</div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {filtered.map((l) => {
              const assigned = Boolean(l.assignedClinic);
              const statusLabel = (l.status || "new").toLowerCase();

              return (
                <div key={l.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 950 }}>
                      {l.city} / {l.service} • {statusLabel}
                    </div>
                    <div style={{ opacity: 0.75, fontWeight: 900 }}>{formatTR(l.createdAt)}</div>
                  </div>

                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    <div>
                      <strong>Hasta:</strong> {l.fullName} • <strong>Tel:</strong> {l.phone}
                      {l.email ? (
                        <>
                          {" "}
                          • <strong>Email:</strong> {l.email}
                        </>
                      ) : null}
                    </div>

                    {l.message ? (
                      <div style={{ opacity: 0.85 }}>
                        <strong>Not:</strong> {l.message}
                      </div>
                    ) : null}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={
                          assigned
                            ? pillStyle("rgba(34,197,94,0.10)", "rgba(34,197,94,0.35)", "#166534")
                            : pillStyle("rgba(239,68,68,0.10)", "rgba(239,68,68,0.35)", "#7f1d1d")
                        }
                      >
                        {assigned ? "ATANDI" : "ATANMADI"}
                      </span>

                      <span style={pillStyle("rgba(15,23,42,0.06)", "rgba(15,23,42,0.12)", "#0f172a")}>
                        Lead ID: {l.id.slice(0, 10)}…
                      </span>
                    </div>

                    <div style={{ marginTop: 2 }}>
                      <strong>Atanan Klinik:</strong>{" "}
                      {l.assignedClinic ? (
                        <>
                          {l.assignedClinic.name}{" "}
                          <span style={{ opacity: 0.75, fontWeight: 800 }}>
                            ({l.assignedClinic.email})
                          </span>
                        </>
                      ) : (
                        "Atanmadı"
                      )}
                    </div>

                    <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>
                      <strong>Kaynak:</strong> {l.source ?? "—"} • <strong>İstek:</strong> {l.intent ?? "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}