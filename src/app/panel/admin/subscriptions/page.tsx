"use client";

import { useEffect, useMemo, useState } from "react";

type Clinic = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trialUsedAt: string | null;
  trialEndsAt: string | null;
};

type SubscriptionStatus = "active" | "inactive" | "canceled" | "trial";

type Subscription = {
  id: string;
  clinicId: string;
  status: SubscriptionStatus;
  quotaTotal: number;
  quotaUsed: number;
  startedAt: string;
  expiresAt: string;
  clinic?: { name: string; email: string };
};

type ClinicsResp = { ok: true; clinics: Clinic[] } | { ok: false; code: string };
type SubsResp = { ok: true; subscriptions: Subscription[] } | { ok: false; code: string };
type AddQuotaResp = { ok: true; subscription: Subscription } | { ok: false; code: string };
type PatchClinicResp = { ok: true; clinic: Clinic } | { ok: false; code: string };

function formatTR(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("tr-TR");
}

function formatDateTR(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("tr-TR");
}

type PlanKind = "trial" | "active" | "none";
type StatusFilter = "all" | "trial" | "active" | "none" | "trialExpired";

function isStatusFilter(v: string): v is StatusFilter {
  return v === "all" || v === "trial" || v === "active" || v === "none" || v === "trialExpired";
}

type ClinicPlanRow = {
  clinic: Clinic;
  plan: PlanKind;
  sub?: Subscription;
  remaining?: number;
  trialExpired: boolean;
};

function badgeForRow(row: ClinicPlanRow): { text: string; bg: string; color: string; border: string } {
  if (row.plan === "trial") return { text: "TRIAL", bg: "#d1fadf", color: "#0f5132", border: "#8be4b0" };
  if (row.plan === "active") return { text: "ABONE", bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" };
  if (row.trialExpired) return { text: "TRIAL BİTTİ", bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
  return { text: "ABONE DEĞİL", bg: "#eee", color: "#111", border: "#ddd" };
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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState<string>("");
  const [showInactiveClinics, setShowInactiveClinics] = useState<boolean>(false);

  const activeClinics = useMemo(() => clinics.filter((c) => c.isActive), [clinics]);
  const pendingClinics = useMemo(() => clinics.filter((c) => !c.isActive), [clinics]);

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

  const setClinicActive = async (clinicId: string, isActive: boolean): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/clinics", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ id: clinicId, isActive }),
      });

      const j = (await r.json()) as PatchClinicResp;
      if (!r.ok || !j.ok) {
        setErr(j.ok ? "" : j.code);
        return;
      }

      // listeleri tazele
      await loadClinics();
    } catch {
      setErr("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setErr(null);
  }, [adminKey]);

  const clinicPlans: ClinicPlanRow[] = useMemo(() => {
    const now = new Date();

    const subsByClinic = new Map<string, Subscription[]>();
    for (const s of subs) {
      const arr = subsByClinic.get(s.clinicId) ?? [];
      arr.push(s);
      subsByClinic.set(s.clinicId, arr);
    }

    return clinics.map((c) => {
      const list = (subsByClinic.get(c.id) ?? []).slice();
      list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

      const activePaid = list.find((s) => s.status === "active" && new Date(s.expiresAt) > now);
      if (activePaid) {
        const remaining = Math.max(0, activePaid.quotaTotal - activePaid.quotaUsed);
        return { clinic: c, plan: "active", sub: activePaid, remaining, trialExpired: false };
      }

      const activeTrial = list.find((s) => s.status === "trial" && new Date(s.expiresAt) > now);
      if (activeTrial) {
        const remaining = Math.max(0, activeTrial.quotaTotal - activeTrial.quotaUsed);
        return { clinic: c, plan: "trial", sub: activeTrial, remaining, trialExpired: false };
      }

      const trialEndsAt = c.trialEndsAt ? new Date(c.trialEndsAt) : null;
      const trialExpired = Boolean(c.trialUsedAt && trialEndsAt && trialEndsAt <= now);

      return { clinic: c, plan: "none", trialExpired };
    });
  }, [clinics, subs]);

  const counts = useMemo(() => {
    const total = clinicPlans.length;
    const trial = clinicPlans.filter((r) => r.plan === "trial").length;
    const active = clinicPlans.filter((r) => r.plan === "active").length;
    const none = clinicPlans.filter((r) => r.plan === "none" && !r.trialExpired).length;
    const trialExpired = clinicPlans.filter((r) => r.plan === "none" && r.trialExpired).length;
    const pending = clinics.filter((c) => !c.isActive).length;
    return { total, trial, active, none, trialExpired, pending };
  }, [clinicPlans, clinics]);

  const filteredClinicPlans = useMemo(() => {
    const q = query.trim().toLowerCase();

    return clinicPlans
      .filter((r) => (showInactiveClinics ? true : r.clinic.isActive))
      .filter((r) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "trial") return r.plan === "trial";
        if (statusFilter === "active") return r.plan === "active";
        if (statusFilter === "trialExpired") return r.plan === "none" && r.trialExpired;
        return r.plan === "none" && !r.trialExpired;
      })
      .filter((r) => {
        if (!q) return true;
        return (
          r.clinic.name.toLowerCase().includes(q) ||
          r.clinic.email.toLowerCase().includes(q) ||
          r.clinic.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const p = (x: PlanKind) => (x === "trial" ? 0 : x === "active" ? 1 : 2);
        const pa = p(a.plan);
        const pb = p(b.plan);
        if (pa !== pb) return pa - pb;

        if (a.plan === "none" && b.plan === "none" && a.trialExpired !== b.trialExpired) {
          return a.trialExpired ? -1 : 1;
        }

        const ea = a.sub ? new Date(a.sub.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        const eb = b.sub ? new Date(b.sub.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        if (ea !== eb) return ea - eb;

        return a.clinic.name.localeCompare(b.clinic.name, "tr");
      });
  }, [clinicPlans, query, statusFilter, showInactiveClinics]);

  const filteredSubs = useMemo(() => {
    if (!selectedClinicId) return subs;
    return subs.filter((s) => s.clinicId === selectedClinicId);
  }, [subs, selectedClinicId]);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
        Admin • Klinikler (Trial / Abone / Bekleyen)
      </h1>

      {/* Admin Key */}
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

          <div style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.9, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800 }}>Özet:</span>
            <span>Toplam: <strong>{counts.total}</strong></span>
            <span>Trial: <strong>{counts.trial}</strong></span>
            <span>Abone: <strong>{counts.active}</strong></span>
            <span>Abone değil: <strong>{counts.none}</strong></span>
            <span>Trial bitti: <strong>{counts.trialExpired}</strong></span>
            <span>Bekleyen: <strong>{counts.pending}</strong></span>
          </div>
        </div>
      </div>

      {/* ✅ Bekleyen klinikler */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Bekleyen Klinikler (Onay Bekliyor)</div>

        {pendingClinics.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Bekleyen klinik yok.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {pendingClinics.map((c) => (
              <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontWeight: 900 }}>{c.name}</div>
                    <div style={{ opacity: 0.85 }}>
                      <strong>Email:</strong> {c.email}
                      {c.phone ? (
                        <>
                          {" "}• <strong>Tel:</strong> {c.phone}
                        </>
                      ) : null}
                    </div>
                    <div style={{ opacity: 0.7 }}>
                      Kayıt: {formatTR(c.createdAt)} • ID: <code>{c.id.slice(0, 10)}…</code>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void setClinicActive(c.id, true)}
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
                      Onayla (Aktif Yap)
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setSelectedClinicId(c.id);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        background: "#fff",
                        color: "#111",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      Seç
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Klinik filtreleri + liste */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ fontWeight: 900 }}>Klinikler</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                const v = e.target.value;
                setStatusFilter(isStatusFilter(v) ? v : "all");
              }}
              style={{ padding: 8, borderRadius: 10, border: "1px solid #ddd" }}
            >
              <option value="all">Tümü</option>
              <option value="trial">Trial</option>
              <option value="active">Abone</option>
              <option value="trialExpired">Trial bitti (ödeme yok)</option>
              <option value="none">Abone değil</option>
            </select>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara: ad / email / id"
              style={{ padding: 8, borderRadius: 10, border: "1px solid #ddd", minWidth: 280 }}
            />

            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}>
              <input
                type="checkbox"
                checked={showInactiveClinics}
                onChange={(e) => setShowInactiveClinics(e.target.checked)}
              />
              Pasif klinikleri de göster
            </label>
          </div>
        </div>

        {filteredClinicPlans.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Liste boş. Önce “Klinik + Abonelik Yükle”.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {filteredClinicPlans.map((r) => {
              const b = badgeForRow(r);

              const endsText =
                r.plan === "trial" || r.plan === "active"
                  ? `Bitiş: ${formatDateTR(r.sub!.expiresAt)}`
                  : r.trialExpired && r.clinic.trialEndsAt
                    ? `Trial bitti: ${formatDateTR(r.clinic.trialEndsAt)}`
                    : "Aktif plan yok";

              return (
                <div
                  key={r.clinic.id}
                  style={{
                    border: selectedClinicId === r.clinic.id ? "2px solid #111" : "1px solid #eee",
                    borderRadius: 12,
                    padding: 12,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedClinicId(r.clinic.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          margin: 0,
                          cursor: "pointer",
                          fontWeight: 900,
                          fontSize: 16,
                        }}
                      >
                        {r.clinic.name}
                      </button>

                      {!r.clinic.isActive && (
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#b91c1c" }}>PASİF</span>
                      )}

                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: b.bg,
                          color: b.color,
                          border: `1px solid ${b.border}`,
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        {b.text}
                      </span>
                    </div>

                    <div style={{ opacity: 0.75 }}>
                      {endsText}
                      {(r.plan === "trial" || r.plan === "active") && r.sub ? (
                        <>
                          {" "}• Kota: <strong>{r.sub.quotaUsed}/{r.sub.quotaTotal}</strong>
                          {" "}• Kalan: <strong>{r.remaining ?? 0}</strong>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ marginTop: 6, opacity: 0.85 }}>
                    <strong>Email:</strong> {r.clinic.email}
                    {r.clinic.phone ? (
                      <>
                        {" "}• <strong>Tel:</strong> {r.clinic.phone}
                      </>
                    ) : null}
                    <div style={{ marginTop: 4 }}>
                      <strong>ID:</strong> <code>{r.clinic.id}</code>
                      {r.sub ? (
                        <>
                          {" "}• <strong>Plan:</strong> <code>{r.sub.status}</code>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {r.clinic.isActive ? (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void setClinicActive(r.clinic.id, false)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid #b91c1c",
                          background: "#fff",
                          color: "#b91c1c",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        Pasif Et
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => void setClinicActive(r.clinic.id, true)}
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
                        Onayla (Aktif Yap)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Kota Ekle */}
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
        <div
          style={{
            border: "1px solid #f2c9c9",
            background: "#fff5f5",
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <strong>Hata:</strong> {err}
        </div>
      )}

      {/* Seçili kliniğin abonelik geçmişi */}
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Seçili Klinik • Abonelikler</div>

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
                  <div style={{ opacity: 0.7 }}>Bitiş: {formatTR(s.expiresAt)}</div>
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