"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type ClinicProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  instagramUrl: string | null;
  updatedAt: string;
};

type ProfileResponse =
  | { ok: true; clinic: ClinicProfile }
  | { ok: false; code?: string };

function normalizeInstagramInput(value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  const cleaned = raw.replace(/^@+/, "");

  if (/^https?:\/\//i.test(cleaned)) return cleaned;

  return `https://www.instagram.com/${cleaned}/`;
}

function instagramHandle(urlOrUser: string): string {
  const v = urlOrUser.trim();
  if (!v) return "";

  try {
    const u = new URL(v);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    const first = path.split("/")[0] ?? "";
    return first ? `@${first}` : "Instagram";
  } catch {
    const user = v.replace(/^@+/, "");
    return user ? `@${user}` : "Instagram";
  }
}

export default function ClinicProfilePage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [clinic, setClinic] = useState<ClinicProfile | null>(null);

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [instagramInput, setInstagramInput] = useState<string>("");

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const normalizedInstagram = useMemo<string>(() => normalizeInstagramInput(instagramInput), [instagramInput]);

  const checks = useMemo(() => {
    const nameOk = name.trim().length >= 2;
    const phoneOk = phone.trim().length >= 7;
    const igOk = Boolean(normalizedInstagram);
    return { nameOk, phoneOk, igOk };
  }, [name, phone, normalizedInstagram]);

  const completion = useMemo<number>(() => {
    let score = 0;
    if (checks.nameOk) score += 50;
    if (checks.phoneOk) score += 25;
    if (checks.igOk) score += 25;
    return score;
  }, [checks]);

  const canSave = useMemo<boolean>(() => name.trim().length >= 2, [name]);

  const loadProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/panel/profile", { cache: "no-store" });
      const data: ProfileResponse = await res.json();

      if (!res.ok || !data.ok) {
        setClinic(null);
        setMsg({ type: "err", text: "Profil yüklenemedi." });
        setLoading(false);
        return;
      }

      const c = data.clinic;
      setClinic(c);
      setName(c.name ?? "");
      setPhone(c.phone ?? "");
      setInstagramInput(c.instagramUrl ?? "");
      setLoading(false);
    } catch {
      setClinic(null);
      setMsg({ type: "err", text: "Profil yüklenemedi." });
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (): Promise<void> => {
    if (!canSave) return;

    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/panel/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          instagramUrl: normalizedInstagram,
        }),
      });

      const data: ProfileResponse = await res.json();

      if (!res.ok || !data.ok) {
        setMsg({ type: "err", text: "Kaydedilemedi." });
        setSaving(false);
        return;
      }

      setClinic(data.clinic);
      setMsg({ type: "ok", text: "Profil güncellendi." });
      setSaving(false);
    } catch {
      setMsg({ type: "err", text: "Kaydedilemedi." });
      setSaving(false);
    }
  }, [canSave, name, phone, normalizedInstagram]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <div>
          <div className={styles.pill}>🦷 Klinik Paneli</div>
          <h1 className={styles.h1}>Profil</h1>
          <div className={styles.sub}>Klinik dizininde daha güven veren bir profil için bilgilerini güncelle.</div>
        </div>

        {clinic ? (
          <div className={styles.pill} title="Son güncelleme">
            🕒 {new Date(clinic.updatedAt).toLocaleString("tr-TR")}
          </div>
        ) : null}
      </div>

      <div className={styles.grid}>
        {/* FORM */}
        <div className={`${styles.card} ${styles.cardGlow}`}>
          <div className={styles.cardInner}>
            {loading ? (
              <div className={styles.sub}>Yükleniyor...</div>
            ) : !clinic ? (
              <div className={styles.msgErr}>Profil bulunamadı.</div>
            ) : (
              <>
                {msg ? (
                  <div className={msg.type === "ok" ? styles.msgOk : styles.msgErr}>{msg.text}</div>
                ) : null}

                <div className={styles.formGrid}>
                  <div className={styles.formGrid2}>
                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <div className={styles.label}>Klinik Adı</div>
                        <div className={styles.hint}>Zorunlu</div>
                      </div>

                      <div className={styles.inputFrame}>
                        <div className={styles.icon}>🏥</div>
                        <input
                          className={styles.input}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Örn: Özel X Ağız ve Diş Sağlığı Polikliniği"
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <div className={styles.labelRow}>
                        <div className={styles.label}>Telefon</div>
                        <div className={styles.hint}>Zorunlu</div>
                      </div>

                      <div className={styles.inputFrame}>
                        <div className={styles.icon}>📞</div>
                        <input
                          className={styles.input}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Örn: 0 (5xx) xxx xx xx"
                          inputMode="tel"
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <div className={styles.label}>Instagram (opsiyonel)</div>
                      <div className={styles.hint}>Kullanıcı adı veya link</div>
                    </div>

                    <div className={styles.inputFrame}>
                      <div className={styles.icon}>📸</div>
                      <input
                        className={styles.input}
                        value={instagramInput}
                        onChange={(e) => setInstagramInput(e.target.value)}
                        placeholder='Örn: https://www.instagram.com/kliniginiz/ veya "kliniginiz"'
                      />
                    </div>

                    <div className={styles.badgeRow}>
                      {normalizedInstagram ? (
                        <a className={`${styles.badge} ${styles.badgeIg}`} href={normalizedInstagram} target="_blank" rel="noreferrer">
                          📸 {instagramHandle(normalizedInstagram)} <span aria-hidden>↗</span>
                        </a>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeMuted}`}>Instagram eklenmedi</span>
                      )}
                      <div className={styles.help}>Sadece kullanıcı adı yazarsan otomatik linke çevirir.</div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <div className={styles.label}>E-posta</div>
                      <div className={styles.hint}>Değiştirilemez</div>
                    </div>

                    <div className={styles.inputFrame}>
                      <div className={styles.icon}>✉️</div>
                      <input className={`${styles.input} ${styles.readonly}`} value={clinic.email} readOnly />
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button className={styles.btnPrimary} onClick={saveProfile} disabled={!canSave || saving}>
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>

                    <button className={styles.btnGhost} onClick={loadProfile} disabled={saving}>
                      Yenile
                    </button>

                    <div className={styles.metaRight}>
                      Son güncelleme:{" "}
                      <strong>{new Date(clinic.updatedAt).toLocaleString("tr-TR")}</strong>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SIDE */}
        <aside className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.sideTitle}>Profil Tamamlanma</div>
            <div className={styles.sideSub}>Daha çok güven → daha çok dönüş</div>

            <div className={styles.progressTop}>
              <div className={styles.percentPill}>⭐ {completion}%</div>
              <div className={styles.hint}>Hedef: 100%</div>
            </div>

            <div className={styles.bar} aria-label="Profil tamamlanma çubuğu">
              <div className={styles.barFill} style={{ width: `${completion}%` }} />
            </div>

            <div className={styles.checks}>
              <div className={styles.checkItem}>
                <span>{checks.nameOk ? "✅" : "⬜"}</span>
                <span>Klinik adı</span>
              </div>
              <div className={styles.checkItem}>
                <span>{checks.phoneOk ? "✅" : "⬜"}</span>
                <span>Telefon</span>
              </div>
              <div className={styles.checkItem}>
                <span>{checks.igOk ? "✅" : "⬜"}</span>
                <span>Instagram (opsiyonel)</span>
              </div>
            </div>

            <div className={styles.tip}>
              <div className={styles.tipTitle}>İpucu</div>
              <div className={styles.tipText}>
                Instagram eklemek dizinde profili daha “güven veren” gösterir. Telefon doğru olursa dönüş hızı artar.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
