"use client";

import { useEffect, useMemo, useState } from "react";

type Clinic = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

type Coverage = {
  id: string;
  clinicId: string;
  city: string;
  service: string;
  isActive: boolean;
  createdAt: string | null;
  clinic?: { name: string } | null;
};

type ListCoveragesResp =
  | { ok: true; coverages: Coverage[] }
  | { ok: false; code: string };

type ListClinicsResp =
  | { ok: true; clinics: Clinic[] }
  | { ok: false; code: string };

type CreateCoverageResp =
  | { ok: true; coverage: Coverage }
  | { ok: false; code: string };

function formatTRDate(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR");
}

export default function AdminCoveragesPage(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [coverages, setCoverages] = useState<Coverage[]>([]);

  const [clinicId, setClinicId] = useState<string>("");
  const [city, setCity] = useState<string>("istanbul");
  const [service, setService] = useState<string>("implant");
  const [isActive, setIsActive] = useState<boolean>(true);

  const activeClinics = useMemo(() => clinics.filter((c) => c.isActive), [clinics]);

  const loadClinics = async (): Promise<void> => {
    const r = await fetch("/api/admin/clinics", {
      method: "GET",
      headers: { "x-admin-key": adminKey },
    });

    const j = (await r.json()) as ListClinicsResp;
    if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

    setClinics(j.clinics);
    if (!clinicId && j.clinics.length > 0) {
      setClinicId(j.clinics[0].id);
    }
  };

  const loadCoverages = async (): Promise<void> => {
    const r = await fetch("/api/admin/coverages", {
      method: "GET",
      headers: { "x-admin-key": adminKey },
    });

    const j = (await r.json()) as ListCoveragesResp;
    if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

    setCoverages(j.coverages);
  };

  const loadAll = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      await Promise.all([loadClinics(), loadCoverages()]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "NETWORK_ERROR";
      setErr(msg);
      setClinics([]);
      setCoverages([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }
    if (clinicId.trim().length < 5) {
      setErr("Klinik seç.");
      return;
    }
    if (city.trim().length < 2) {
      setErr("city gir.");
      return;
    }
    if (service.trim().length < 2) {
      setErr("service gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/coverages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          clinicId: clinicId.trim(),
          city: city.trim().toLowerCase(),
          service: service.trim().toLowerCase(),
          isActive,
        }),
      });

      const j = (await r.json()) as CreateCoverageResp;

      if (!r.ok || !j.ok) {
        setErr(j.ok ? "" : j.code);
        return;
      }

      await loadCoverages();
    } catch {
      setErr("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setErr(null);
  }, [adminKey]);

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Admin • Coverage</h1>

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
            Klinik + Coverage Yükle
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Yeni Coverage Ekle</div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <select
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            {activeClinics.length === 0 && <option value="">Önce Klinik yükle</option>}
            {activeClinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id.slice(0, 8)}…)
              </option>
            ))}
          </select>

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="city (istanbul)"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="service (implant)"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Aktif
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => void create()}
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
            Coverage Oluştur
          </button>
        </div>
      </div>

      {err && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <strong>Hata:</strong> {err}
        </div>
      )}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Coverage Listesi</div>

        {coverages.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Coverage yok veya liste yüklenmedi.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {coverages.map((c) => (
              <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>
                    {c.city} / {c.service}
                  </div>
                  <div style={{ opacity: 0.7 }}>{formatTRDate(c.createdAt)}</div>
                </div>

                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  <div>
                    <strong>Klinik:</strong> {c.clinic?.name ? `${c.clinic.name} ` : ""}
                    <code>{c.clinicId}</code>
                  </div>
                  <div>
                    <strong>Aktif:</strong> {c.isActive ? "Evet" : "Hayır"}
                  </div>
                  <div>
                    <strong>ID:</strong> <code>{c.id}</code>
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
