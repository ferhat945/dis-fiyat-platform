"use client";

import { useMemo, useState } from "react";

type ClinicRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
};

type ClinicsRes = { ok: boolean; clinics?: ClinicRow[]; code?: string };
type CreateRes = { ok: boolean; code?: string };
type PatchRes = { ok: boolean; clinic?: ClinicRow; code?: string };

export default function AdminClinicsClient({ initialClinics }: { initialClinics: ClinicRow[] }): JSX.Element {
  const [clinics, setClinics] = useState<ClinicRow[]>(initialClinics);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sorted = useMemo(() => clinics.slice(), [clinics]);

  async function refresh(): Promise<void> {
    const r = await fetch("/api/admin/clinics", { cache: "no-store" });
    const j: ClinicsRes = (await r.json()) as ClinicsRes;
    if (r.ok && j.ok && j.clinics) setClinics(j.clinics);
    else setErr(j.code ?? "REFRESH_FAILED");
  }

  async function createClinic(): Promise<void> {
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/admin/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, password }),
      });
      const j: CreateRes = (await r.json()) as CreateRes;
      if (!r.ok || !j.ok) {
        setErr(j.code ?? "CREATE_FAILED");
        return;
      }
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, next: boolean): Promise<void> {
    setErr(null);
    try {
      const r = await fetch("/api/admin/clinics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: next }),
      });
      const j: PatchRes = (await r.json()) as PatchRes;
      if (!r.ok || !j.ok || !j.clinic) {
        setErr(j.code ?? "PATCH_FAILED");
        return;
      }
      setClinics((prev) => prev.map((c) => (c.id === id ? j.clinic! : c)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "NETWORK_ERROR");
    }
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Klinik Ekle</div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} style={inp()} />
          <input placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} style={inp()} />
          <input placeholder="Telefon (opsiyonel)" value={phone} onChange={(e) => setPhone(e.target.value)} style={inp()} />
          <input placeholder="Şifre (min 8)" value={password} onChange={(e) => setPassword(e.target.value)} style={inp()} />
        </div>

        {err && <div style={{ color: "crimson", marginTop: 8, fontWeight: 800 }}>Hata: {err}</div>}

        <button
          onClick={createClinic}
          disabled={loading || name.length < 2 || email.length < 3 || password.length < 8}
          style={btnPrimary()}
        >
          {loading ? "Ekleniyor..." : "Klinik Ekle"}
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Klinik Listesi</div>

        <div style={{ display: "grid", gap: 10 }}>
          {sorted.map((c) => (
            <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>
                  {c.name} <span style={{ opacity: 0.7, fontWeight: 700 }}>({c.email})</span>
                </div>
                <div style={{ opacity: 0.7 }}>{new Date(c.createdAt).toLocaleString("tr-TR")}</div>
              </div>

              <div style={{ marginTop: 6, opacity: 0.85 }}>
                <strong>Telefon:</strong> {c.phone ?? "—"}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={() => toggleActive(c.id, !c.isActive)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: c.isActive ? "#111" : "#fff",
                    color: c.isActive ? "#fff" : "#111",
                    fontWeight: 900,
                  }}
                >
                  {c.isActive ? "Aktif" : "Pasif"}
                </button>

                <span style={{ opacity: 0.65, fontSize: 12 }}>ID: {c.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function inp(): React.CSSProperties {
  return { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" };
}

function btnPrimary(): React.CSSProperties {
  return {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
  };
}
