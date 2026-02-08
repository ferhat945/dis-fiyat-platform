"use client";

import { useEffect, useMemo, useState } from "react";

type Coverage = {
  id: string;
  city: string;
  service: string;
  isActive: boolean;
};

type GetResp =
  | { ok: true; coverages: Coverage[] }
  | { ok: false; code: string };

type PostResp =
  | { ok: true; coverage: Coverage }
  | { ok: false; code: string; issues?: { path: string; message: string }[] };

type PatchResp =
  | { ok: true; coverage: Coverage }
  | { ok: false; code: string };

function norm(v: string): string {
  return v.toLowerCase().trim();
}

export default function PanelServicesPage(): JSX.Element {
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [city, setCity] = useState<string>("istanbul");
  const [service, setService] = useState<string>("implant");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const sorted = useMemo(() => {
    return [...coverages].sort((a, b) => {
      const x = `${a.city}|${a.service}`;
      const y = `${b.city}|${b.service}`;
      return x.localeCompare(y, "tr");
    });
  }, [coverages]);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/panel/coverages", { cache: "no-store" });
      const j = (await r.json()) as GetResp;
      if (!r.ok || !j.ok) {
        setError(j.ok ? "UNKNOWN" : j.code);
        setCoverages([]);
        return;
      }
      setCoverages(j.coverages);
    } catch {
      setError("NETWORK_ERROR");
      setCoverages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addCoverage = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        city: norm(city),
        service: norm(service),
        isActive: true,
      };

      const r = await fetch("/api/panel/coverages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = (await r.json()) as PostResp;

      if (!r.ok || !j.ok) {
        const issues =
          "issues" in j && j.issues?.length
            ? ` | ${j.issues.map((x) => `${x.path}: ${x.message}`).join(", ")}`
            : "";
        setError(`${j.ok ? "UNKNOWN" : j.code}${issues}`);
        return;
      }

      // listeyi güncelle (upsert olduğu için replace)
      setCoverages((prev) => {
        const idx = prev.findIndex((x) => x.id === j.coverage.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = j.coverage;
          return next;
        }
        return [j.coverage, ...prev];
      });
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Coverage): Promise<void> => {
    setError(null);
    try {
      const r = await fetch(`/api/panel/coverages/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !c.isActive }),
      });

      const j = (await r.json()) as PatchResp;

      if (!r.ok || !j.ok) {
        setError(j.ok ? "UNKNOWN" : j.code);
        return;
      }

      setCoverages((prev) => prev.map((x) => (x.id === j.coverage.id ? j.coverage : x)));
    } catch {
      setError("NETWORK_ERROR");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Hizmetlerim</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Yeni Kapsam Ekle</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="şehir (örn: istanbul)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", flex: "1 1 220px" }}
          />
          <input
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="hizmet (örn: implant)"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", flex: "1 1 220px" }}
          />
          <button
            type="button"
            onClick={() => void addCoverage()}
            disabled={saving}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Ekleniyor..." : "Ekle"}
          </button>

          <button
            type="button"
            onClick={() => void load()}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Yenile
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 10, border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 10, padding: 10 }}>
            <strong>Hata:</strong> {error}
          </div>
        )}
      </div>

      {loading && <div>Yükleniyor...</div>}

      {!loading && sorted.length === 0 && <div>Henüz kapsam eklenmedi.</div>}

      {!loading && sorted.length > 0 && (
        <div style={{ display: "grid", gap: 10 }}>
          {sorted.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                  {c.city} / {c.service}
                </div>
                <div style={{ opacity: 0.8 }}>
                  Aktif: <strong>{c.isActive ? "Evet" : "Hayır"}</strong>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => void toggle(c)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #111",
                    background: c.isActive ? "#fff" : "#111",
                    color: c.isActive ? "#111" : "#fff",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {c.isActive ? "Pasif Yap" : "Aktif Yap"}
                </button>

                <div style={{ opacity: 0.65, alignSelf: "center" }}>ID: {c.id}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
