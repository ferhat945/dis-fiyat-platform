"use client";

import { useEffect, useState } from "react";

type Clinic = {
  id: string;
  name: string;
  isActive: boolean;
  lastAssignedAt: string | null;
  createdAt: string;
};

type ApiListResp =
  | { ok: true; clinics: Clinic[] }
  | { ok: false; code: string };

type ApiCreateResp =
  | { ok: true; clinic: { id: string; name: string; isActive: boolean; createdAt: string } }
  | { ok: false; code: string };

export default function AdminClinicsPage(): JSX.Element {
  const [adminKey, setAdminKey] = useState<string>("");
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("12345678");

  const load = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/clinics", {
        method: "GET",
        headers: { "x-admin-key": adminKey },
      });

      const j = (await r.json()) as ApiListResp;

      if (!r.ok || !j.ok) {
        setErr(j.ok ? "" : j.code);
        setClinics([]);
        return;
      }

      setClinics(j.clinics);
    } catch {
      setErr("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const createClinic = async (): Promise<void> => {
    if (!adminKey) {
      setErr("Admin key gir.");
      return;
    }
    if (name.trim().length < 2) {
      setErr("Klinik adı en az 2 karakter.");
      return;
    }
    if (email.trim().length < 5) {
      setErr("Email gir.");
      return;
    }
    if (password.trim().length < 8) {
      setErr("Şifre en az 8 karakter.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/admin/clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() ? phone.trim() : undefined,
          password: password.trim(),
        }),
      });

      const j = (await r.json()) as ApiCreateResp;

      if (!r.ok || !j.ok) {
        setErr(j.ok ? "" : j.code);
        return;
      }

      setName("");
      setEmail("");
      setPhone("");
      setPassword("12345678");
      await load();
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
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Admin • Klinikler</h1>

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
            Listeyi Yenile
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Yeni Klinik Oluştur</div>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Klinik adı"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon (opsiyonel)"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre (min 8)"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => void createClinic()}
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
            Klinik Oluştur
          </button>
        </div>
      </div>

      {err && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <strong>Hata:</strong> {err}
        </div>
      )}

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Klinik Listesi</div>

        {clinics.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Klinik yok veya liste yüklenmedi.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {clinics.map((c) => (
              <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>{c.name}</div>
                  <div style={{ opacity: 0.7 }}>{new Date(c.createdAt).toLocaleString("tr-TR")}</div>
                </div>
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  <div>
                    <strong>ID:</strong> <code>{c.id}</code>
                  </div>
                  <div>
                    <strong>Aktif:</strong> {c.isActive ? "Evet" : "Hayır"}
                  </div>
                  <div>
                    <strong>Son Atama:</strong>{" "}
                    {c.lastAssignedAt ? new Date(c.lastAssignedAt).toLocaleString("tr-TR") : "—"}
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
