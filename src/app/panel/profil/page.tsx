"use client";

import { useEffect, useState } from "react";

type Clinic = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type GetResp =
  | { ok: true; clinic: Clinic }
  | { ok: false; code: string };

type PatchProfileResp =
  | { ok: true; clinic: Pick<Clinic, "id" | "name" | "email" | "phone" | "isActive" | "updatedAt"> }
  | { ok: false; code: string; issues?: { path: string; message: string }[] };

type PatchPasswordResp =
  | { ok: true }
  | { ok: false; code: string; issues?: { path: string; message: string }[] };

function errText(j: { code: string; issues?: { path: string; message: string }[] }): string {
  const issues = j.issues?.length ? ` | ${j.issues.map((x) => `${x.path}: ${x.message}`).join(", ")}` : "";
  return `${j.code}${issues}`;
}

export default function PanelProfilePage(): JSX.Element {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingPass, setSavingPass] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const r = await fetch("/api/panel/profile", { cache: "no-store" });
      const j = (await r.json()) as GetResp;

      if (!r.ok || !j.ok) {
        setError(j.ok ? "UNKNOWN" : j.code);
        setClinic(null);
        return;
      }

      setClinic(j.clinic);
      setName(j.clinic.name);
      setPhone(j.clinic.phone ?? "");
    } catch {
      setError("NETWORK_ERROR");
      setClinic(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveProfile = async (): Promise<void> => {
    setSavingProfile(true);
    setError(null);
    setSuccess(null);

    try {
      const r = await fetch("/api/panel/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const j = (await r.json()) as PatchProfileResp;

      if (!r.ok || !j.ok) {
        setError(j.ok ? "UNKNOWN" : errText(j));
        return;
      }

      setClinic((prev) =>
        prev
          ? {
              ...prev,
              name: j.clinic.name,
              phone: j.clinic.phone,
              updatedAt: j.clinic.updatedAt,
            }
          : null
      );

      setSuccess("Profil güncellendi.");
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (): Promise<void> => {
    setSavingPass(true);
    setError(null);
    setSuccess(null);

    try {
      const r = await fetch("/api/panel/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const j = (await r.json()) as PatchPasswordResp;

      if (!r.ok || !j.ok) {
        setError(j.ok ? "UNKNOWN" : errText(j));
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setSuccess("Şifre güncellendi.");
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Profil</h1>

      {loading && <div>Yükleniyor...</div>}

      {!loading && !clinic && (
        <div style={{ border: "1px solid #f2c9c9", background: "#fff5f5", borderRadius: 12, padding: 12 }}>
          Profil yüklenemedi: {error ?? "UNKNOWN"}
          <div style={{ marginTop: 10 }}>
            <a href="/panel/login" style={{ fontWeight: 900 }}>
              /panel/login
            </a>
          </div>
        </div>
      )}

      {!loading && clinic && (
        <>
          {(error || success) && (
            <div
              style={{
                marginBottom: 12,
                border: error ? "1px solid #f2c9c9" : "1px solid #cce9d1",
                background: error ? "#fff5f5" : "#f2fff5",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <strong>{error ? "Hata" : "Başarılı"}:</strong> {error ?? success}
            </div>
          )}

          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Klinik Bilgileri</div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800 }}>Klinik adı</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
                  placeholder="Klinik adı"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800 }}>Telefon</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
                  placeholder="05xx..."
                />
              </label>

              <div style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800 }}>Email</span>
                <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #eee", background: "#fafafa" }}>
                  {clinic.email}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.8 }}>
                <div>
                  <strong>Aktif:</strong> {clinic.isActive ? "Evet" : "Hayır"}
                </div>
                <div>
                  <strong>Güncellendi:</strong> {new Date(clinic.updatedAt).toLocaleString("tr-TR")}
                </div>
              </div>

              <button
                type="button"
                onClick={() => void saveProfile()}
                disabled={savingProfile}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: savingProfile ? "not-allowed" : "pointer",
                  width: 220,
                }}
              >
                {savingProfile ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>Şifre Değiştir</div>

            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800 }}>Mevcut şifre</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
                  placeholder="Mevcut şifre"
                />
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontWeight: 800 }}>Yeni şifre (min 8)</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
                  placeholder="Yeni şifre"
                />
              </label>

              <button
                type="button"
                onClick={() => void changePassword()}
                disabled={savingPass}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: savingPass ? "not-allowed" : "pointer",
                  width: 220,
                }}
              >
                {savingPass ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
