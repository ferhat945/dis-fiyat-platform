"use client";

import { useEffect, useMemo, useState } from "react";

type Clinic = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

type Subscription = {
  id: string;
  clinicId: string;
  status: "active" | "inactive" | "canceled";
  quotaTotal: number;
  quotaUsed: number;
  startedAt: string;
  expiresAt: string;
};

type ClinicsResp =
  | { ok: true; clinics: Clinic[] }
  | { ok: false; code: string };

type SubsResp =
  | { ok: true; subscriptions: Subscription[] }
  | { ok: false; code: string };

type AddQuotaResp =
  | { ok: true; subscription: Subscription }
  | { ok: false; code: string };

function formatTR(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("tr-TR");
}

export default function AdminSubscriptionsPage(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [addAmount, setAddAmount] = useState<number>(10);
  const [extendDays, setExtendDays] = useState<number>(30);

  const activeClinics = useMemo(() => clinics.filter((c) => c.isActive), [clinics]);

  const loadClinics = async (): Promise<void> => {
    const r = await fetch("/api/admin/clinics", {
      method: "GET",
      headers: { "x-admin-key": adminKey },
    });

    const j = (await r.json()) as ClinicsResp;
    if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

    setClinics(j.clinics);

    if (!selectedClinicId && j.clinics.length > 0) {
      setSelectedClinicId(j.clinics[0].id);
    }
  };

  const loadSubs = async (): Promise<void> => {
    const r = await fetch("/api/admin/subscriptions", {
      method: "GET",
      headers: { "x-admin-key": adminKey },
    });

    const j = (await r.json()) as SubsResp;
    if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

    setSubs(j.subscriptions);
  };

  const loadAll = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      await Promise.all([loadClinics(), loadSubs()]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "NETWORK_ERROR";
      setErr(msg);
      setClinics([]);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  const addQuota = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }
    if (!selectedClinicId) {
      setErr("Klinik seç.");
      return;
    }
    if (!Number.isFinite(addAmount) || addAmount <= 0) {
      setErr("Eklenecek kota > 0 olmalı.");
      return;
    }
    if (!Number.isFinite(extendDays) || extendDays <= 0) {
      setErr("Gün > 0 olmalı.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          clinicId: selectedClinicId,
          addQuota: addAmount,
          extendDays,
        }),
      });

      const j = (await r.json()) as AddQuotaResp;

      if (!r.ok || !j.ok) {
        setErr(j.ok ? "" : j.code);
        return;
      }

      await loadSubs();
    } catch {
      setErr("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setErr(null);
  }, [adminKey]);

  const filteredSubs = useMemo(() => {
    if (!selectedClinicId) return subs;
    return subs.filter((s) => s.clinicId === selectedClinicId);
  }, [subs, selectedClinicId]);

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Admin • Abonelik / Kota</h1>

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
            onClick={() => void loadAll()}
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
            Klinik + Abonelik Yükle
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Kota Ekle</div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <select
            value={selectedClinicId}
            onChange={(e) => setSelectedClinicId(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            {activeClinics.length === 0 && <option value="">Önce klinikleri yükle</option>}
            {activeClinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id.slice(0, 8)}…)
              </option>
            ))}
          </select>

          <input
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(Number(e.target.value))}
            min={1}
            placeholder="Eklenecek kota (örn 10)"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />

          <input
            type="number"
            value={extendDays}
            onChange={(e) => setExtendDays(Number(e.target.value))}
            min={1}
            placeholder="Süre uzatma (gün)"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => void addQuota()}
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
            Kota Yükle
          </button>
        </div>
      </div>

      {err && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <strong>Hata:</strong> {err}
        </div>
      )}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Abonelikler</div>

        {filteredSubs.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Bu klinikte abonelik yok (kota yükleyince otomatik oluşur).</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filteredSubs.map((s) => (
              <div key={s.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {s.status.toUpperCase()} • {s.quotaUsed}/{s.quotaTotal}
                  </div>
                  <div style={{ opacity: 0.7 }}>
                    Bitiş: {formatTR(s.expiresAt)}
                  </div>
                </div>

                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  <div>
                    <strong>KlinikId:</strong> <code>{s.clinicId}</code>
                  </div>
                  <div>
                    <strong>Başlangıç:</strong> {formatTR(s.startedAt)}
                  </div>
                  <div>
                    <strong>Abonelik ID:</strong> <code>{s.id}</code>
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
