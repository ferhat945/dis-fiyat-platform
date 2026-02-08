"use client";

import { useEffect, useState } from "react";

type ClinicItem = { id: string; name: string; isActive: boolean; createdAt: string };
type ClinicsResp = { ok: true; clinics: ClinicItem[] } | { ok: false; code: string };

type CreateResp =
  | { ok: true; mode: string; subscription: { id: string; quotaTotal: number; quotaUsed: number; expiresAt: string } }
  | { ok: false; code: string };

export default function AdminQuotaPage(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("supersecret123");
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [clinicId, setClinicId] = useState<string>("");
  const [pkg, setPkg] = useState<"base" | "extra">("base");
  const [months, setMonths] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadClinics = async (): Promise<void> => {
    setMsg(null);
    try {
      const r = await fetch("/api/admin/clinics", {
        headers: { "x-admin-key": adminKey },
        cache: "no-store",
      });
      const j = (await r.json()) as ClinicsResp;
      if (!r.ok || !j.ok) {
        setMsg(`Hata: ${"code" in j ? j.code : "UNKNOWN"}`);
        return;
      }
      setClinics(j.clinics);
      if (!clinicId && j.clinics.length > 0) setClinicId(j.clinics[0].id);
    } catch {
      setMsg("NETWORK_ERROR");
    }
  };

  useEffect(() => {
    void loadClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (): Promise<void> => {
    setLoading(true);
    setMsg(null);
    try {
      const body: { clinicId: string; package: "base" | "extra"; months?: number } = {
        clinicId,
        package: pkg,
      };
      if (pkg === "base") body.months = months;

      const r = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      });
      const j = (await r.json()) as CreateResp;
      if (!r.ok || !j.ok) {
        setMsg(`Hata: ${"code" in j ? j.code : "UNKNOWN"}`);
        return;
      }
      setMsg(
        `OK (${j.mode}) → quotaTotal=${j.subscription.quotaTotal}, quotaUsed=${j.subscription.quotaUsed}, expiresAt=${new Date(
          j.subscription.expiresAt
        ).toLocaleDateString("tr-TR")}`
      );
    } catch {
      setMsg("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Admin — Kota Yükle</h1>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>Admin Key</div>
        <input
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="ADMIN_KEY"
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        />
        <button
          type="button"
          onClick={() => void loadClinics()}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 900 }}
        >
          Klinik listesini yenile
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>Klinik Seç</div>

        <select
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
        >
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.id.slice(0, 8)}…)
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="radio" checked={pkg === "base"} onChange={() => setPkg("base")} />
            Base (10 lead / 800 TL)
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="radio" checked={pkg === "extra"} onChange={() => setPkg("extra")} />
            Extra (+10 lead / 600 TL)
          </label>
        </div>

        {pkg === "base" && (
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ fontWeight: 800 }}>Süre (ay)</div>
            <input
              type="number"
              value={months}
              min={1}
              max={24}
              onChange={(e) => setMonths(Number(e.target.value))}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", width: 140 }}
            />
          </div>
        )}

        <button
          type="button"
          disabled={loading || !clinicId}
          onClick={() => void submit()}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 900,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Yükleniyor..." : "Kota Yükle"}
        </button>

        {msg && (
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
            <strong>Durum:</strong> {msg}
          </div>
        )}
      </div>

      <div style={{ opacity: 0.75 }}>
        Bu sayfa PayTR olmadan MVP’yi yürütmek içindir. PayTR gelince “ödeme başarılı → burada yaptığımız kota artırma” otomatik olacak.
      </div>
    </div>
  );
}
