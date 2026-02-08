"use client";

import { useEffect, useMemo, useState } from "react";

type LogItem = {
  id: string;
  leadId: string;
  clinicId: string | null;
  city: string;
  service: string;
  assigned: boolean;
  reason: string;
  details: unknown;
  createdAt: string;
  clinic: { name: string } | null;
};

type ApiResp = { ok: true; logs: LogItem[] } | { ok: false; code: string };

export default function AdminDistributionLogsPage(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("supersecret123");

  const [city, setCity] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [clinicId, setClinicId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [assigned, setAssigned] = useState<"all" | "true" | "false">("all");

  const [take, setTake] = useState<number>(100);

  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (city.trim()) sp.set("city", city.trim().toLowerCase());
    if (service.trim()) sp.set("service", service.trim().toLowerCase());
    if (clinicId.trim()) sp.set("clinicId", clinicId.trim());
    if (reason.trim()) sp.set("reason", reason.trim());
    if (assigned !== "all") sp.set("assigned", assigned);
    sp.set("take", String(take));
    return sp.toString();
  }, [assigned, city, clinicId, reason, service, take]);

  const load = async (): Promise<void> => {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/admin/distribution-logs?${query}`, {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      const j = (await r.json()) as ApiResp;
      if (!r.ok || !j.ok) {
        setMsg(`Hata: ${"code" in j ? j.code : "UNKNOWN"}`);
        setLogs([]);
        return;
      }
      setLogs(j.logs);
    } catch {
      setMsg("NETWORK_ERROR");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto", display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Admin — Lead Dağıtım Logları</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>Admin Key</div>
        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        />

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Şehir</div>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="istanbul"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Hizmet</div>
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="implant"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>ClinicId</div>
            <input
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              placeholder="cmk..."
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Reason</div>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ASSIGNED / NO_QUOTA / NO_CANDIDATE_CLINIC"
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Assigned</div>
            <select
              value={assigned}
              onChange={(e) => setAssigned(e.target.value as "all" | "true" | "false")}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              <option value="all">Hepsi</option>
              <option value="true">Atandı</option>
              <option value="false">Atanmadı</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Limit</div>
            <input
              type="number"
              value={take}
              min={1}
              max={500}
              onChange={(e) => setTake(Number(e.target.value))}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            />
          </div>
        </div>

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
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Yükleniyor..." : "Filtrele / Yenile"}
        </button>

        {msg && (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
            <strong>Durum:</strong> {msg}
          </div>
        )}
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Son Loglar ({logs.length})</div>

        {logs.length === 0 && <div style={{ opacity: 0.75 }}>Log yok.</div>}

        {logs.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {logs.map((l) => (
              <div key={l.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {l.city} / {l.service} — {l.assigned ? "✅ Atandı" : "❌ Atanmadı"} ({l.reason})
                  </div>
                  <div style={{ opacity: 0.7 }}>{new Date(l.createdAt).toLocaleString("tr-TR")}</div>
                </div>

                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  <strong>LeadId:</strong> {l.leadId}
                </div>

                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  <strong>Klinik:</strong> {l.clinic?.name ?? "—"} {l.clinicId ? `(${l.clinicId})` : ""}
                </div>

                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: "pointer", fontWeight: 800 }}>Detay</summary>
                  <pre style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{JSON.stringify(l.details, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
