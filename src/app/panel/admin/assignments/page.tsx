"use client";

import { useState } from "react";

type Assignment = {
  id: string;
  leadId: string;
  clinicId: string;
  createdAt: string;
  lead: {
    fullName: string;
    phone: string;
    city: string;
    service: string;
    createdAt: string;
  };
  clinic: {
    name: string;
  };
};

type ApiResp =
  | { ok: true; assignments: Assignment[] }
  | { ok: false; code: string };

function formatTR(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("tr-TR");
}

export default function AdminAssignmentsPage(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Assignment[]>([]);

  const load = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/assignments", {
        method: "GET",
        headers: { "x-admin-key": adminKey },
      });

      const j = (await r.json()) as ApiResp;

      if (!r.ok || !j.ok) {
        setErr(j.ok ? "UNKNOWN" : j.code);
        setRows([]);
        return;
      }

      setRows(j.assignments);
    } catch {
      setErr("NETWORK_ERROR");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
        Admin • Lead Dağıtım Logları
      </h1>

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
              cursor: "pointer",
            }}
          >
            Logları Yükle
          </button>
        </div>
      </div>

      {err && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <strong>Hata:</strong> {err}
        </div>
      )}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Son 300 Atama</div>

        {rows.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Henüz log yok veya yüklenmedi.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((a) => (
              <div key={a.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {a.lead.fullName} — {a.lead.phone}
                  </div>
                  <div style={{ opacity: 0.7 }}>{formatTR(a.createdAt)}</div>
                </div>

                <div style={{ marginTop: 6 }}>
                  <strong>Şehir:</strong> {a.lead.city} &nbsp;|&nbsp; <strong>Hizmet:</strong>{" "}
                  {a.lead.service}
                </div>

                <div style={{ marginTop: 6 }}>
                  <strong>Atanan Klinik:</strong> {a.clinic.name}
                </div>

                <div style={{ marginTop: 6, opacity: 0.8 }}>
                  <div>
                    <strong>Assignment ID:</strong> <code>{a.id}</code>
                  </div>
                  <div>
                    <strong>Lead ID:</strong> <code>{a.leadId}</code>
                  </div>
                  <div>
                    <strong>Clinic ID:</strong> <code>{a.clinicId}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
