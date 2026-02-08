"use client";

import { useState } from "react";

type LeadStatus = "new" | "contacted" | "won" | "lost";

type Props = {
  leadId: string;
  currentStatus: LeadStatus;
};

type ApiIssue = { path: string; message: string };

type PatchResp =
  | { ok: true; lead: { id: string; status: LeadStatus; updatedAt: string } }
  | { ok: false; code: string; detail?: string; issues?: ApiIssue[] };

const STATUSES: { key: LeadStatus; label: string }[] = [
  { key: "new", label: "Yeni" },
  { key: "contacted", label: "İletişime Geçildi" },
  { key: "won", label: "Kazanıldı" },
  { key: "lost", label: "Kaybedildi" },
];

export default function StatusActions({ leadId, currentStatus }: Props): JSX.Element {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setLeadStatus = async (next: LeadStatus): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`/api/panel/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const j = (await r.json()) as PatchResp;

      if (!r.ok || !j.ok) {
        const extra =
          "issues" in j && j.issues?.length
            ? ` | ${j.issues.map((x) => `${x.path}: ${x.message}`).join(", ")}`
            : "";
        const detail = "detail" in j && j.detail ? ` | ${j.detail}` : "";
        setError(`${"code" in j ? j.code : "UNKNOWN"}${detail}${extra}`);
        return;
      }

      setStatus(j.lead.status);
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {STATUSES.map((s) => {
          const active = s.key === status;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => void setLeadStatus(s.key)}
              disabled={loading}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: active ? "1px solid #111" : "1px solid #ddd",
                background: active ? "#111" : "#fff",
                color: active ? "#fff" : "#111",
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={{ opacity: 0.75 }}>
        <strong>Seçili:</strong> {status.toUpperCase()}
      </div>

      {error && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 10, padding: 10 }}>
          <strong>Hata:</strong> {error}
        </div>
      )}
    </div>
  );
}
