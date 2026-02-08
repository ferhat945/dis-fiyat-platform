"use client";

import { useState } from "react";

type ApiIssue = { path: string; message: string };

type PatchResp =
  | { ok: true; lead: { id: string; clinicNote: string | null; lastContactAt: string | null; updatedAt: string } }
  | { ok: false; code: string; detail?: string; issues?: ApiIssue[] };

type Props = {
  leadId: string;
  initialNote: string | null;
  initialLastContactAt: string | null;
};

export default function NoteEditor({ leadId, initialNote, initialLastContactAt }: Props): JSX.Element {
  const [note, setNote] = useState<string>(initialNote ?? "");
  const [lastContactAt, setLastContactAt] = useState<string | null>(initialLastContactAt);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const apply = async (payload: { clinicNote?: string; setLastContactNow?: boolean; clearLastContactAt?: boolean }): Promise<void> => {
    setLoading(true);
    setError(null);
    setOkMsg(null);

    try {
      const r = await fetch(`/api/panel/leads/${leadId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = (await r.json()) as PatchResp;

      if (!r.ok || !j.ok) {
        const issues =
          "issues" in j && j.issues?.length
            ? ` | ${j.issues.map((x) => `${x.path}: ${x.message}`).join(", ")}`
            : "";
        const detail = "detail" in j && j.detail ? ` | ${j.detail}` : "";
        setError(`${"code" in j ? j.code : "UNKNOWN"}${detail}${issues}`);
        return;
      }

      setNote(j.lead.clinicNote ?? "");
      setLastContactAt(j.lead.lastContactAt);
      setOkMsg("Kaydedildi.");
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 900 }}>Klinik Notu</div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Bu lead için not yaz (klinik içi)..."
        rows={5}
        style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", resize: "vertical" }}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          disabled={loading}
          onClick={() => void apply({ clinicNote: note })}
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
          {loading ? "Kaydediliyor..." : "Notu Kaydet"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => void apply({ setLastContactNow: true })}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Arandı (Şimdi)
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => void apply({ clearLastContactAt: true })}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Arama Tarihini Temizle
        </button>
      </div>

      <div style={{ opacity: 0.8 }}>
        <strong>Son arama:</strong>{" "}
        {lastContactAt ? new Date(lastContactAt).toLocaleString("tr-TR") : "—"}
      </div>

      {error && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 10, padding: 10 }}>
          <strong>Hata:</strong> {error}
        </div>
      )}

      {okMsg && (
        <div style={{ border: "1px solid #cce9d1", background: "#f2fff5", borderRadius: 10, padding: 10 }}>
          <strong>OK:</strong> {okMsg}
        </div>
      )}
    </div>
  );
}
