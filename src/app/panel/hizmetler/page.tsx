"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Coverage = {
  id: string;
  city: string;
  service: string;
  isActive: boolean;
};

type GetResp = { ok: true; coverages: Coverage[] } | { ok: false; code: string };

type PostResp =
  | { ok: true } // API şu an sadece { ok: true } dönüyor
  | { ok: false; code: string; issues?: { path: string; message: string }[] };

type PatchResp = { ok: true } | { ok: false; code: string };

function norm(v: string): string {
  return v.toLowerCase().trim();
}

function labelize(v: string): string {
  const s = v.trim();
  if (!s) return s;
  return s
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
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

  const activeCount = useMemo(() => coverages.filter((c) => c.isActive).length, [coverages]);

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
      const payload = { city: norm(city), service: norm(service) };

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

      // API coverage döndürmüyor -> doğru yöntem: yeniden yükle
      await load();
    } catch {
      setError("NETWORK_ERROR");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Coverage): Promise<void> => {
    setError(null);

    const nextValue = !c.isActive;

    // Optimistic UI
    setCoverages((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: nextValue } : x)));

    try {
      const r = await fetch("/api/panel/coverages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, isActive: nextValue }),
      });

      const j = (await r.json()) as PatchResp;

      if (!r.ok || !j.ok) {
        // geri al
        setCoverages((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: c.isActive } : x)));
        setError(j.ok ? "UNKNOWN" : j.code);
        return;
      }
    } catch {
      // geri al
      setCoverages((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: c.isActive } : x)));
      setError("NETWORK_ERROR");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <div className={styles.pill}>🧩 Kapsam Yönetimi</div>
          <h1 className={styles.h1}>Hizmetlerim</h1>
          <div className={styles.sub}>
            Şehir + hizmet eşleşmelerini ekle. Aktif olanlar lead eşleşmesinde kullanılabilir.
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Toplam Kapsam</div>
            <div className={styles.statValue}>{coverages.length}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Aktif</div>
            <div className={styles.statValue}>{activeCount}</div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* ADD CARD */}
        <section className={`${styles.card} ${styles.cardGlow}`}>
          <div className={styles.cardInner}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Yeni Kapsam Ekle</div>
                <div className={styles.cardSub}>Örn: istanbul + implant</div>
              </div>

              <button className={styles.btnGhost} type="button" onClick={() => void load()} disabled={saving}>
                Yenile
              </button>
            </div>

            {error ? <div className={styles.msgErr}>⚠️ Hata: {error}</div> : null}

            <div className={styles.formRow}>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <div className={styles.label}>Şehir</div>
                  <div className={styles.hint}>küçük harf önerilir</div>
                </div>
                <div className={styles.inputFrame}>
                  <div className={styles.icon}>📍</div>
                  <input
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="istanbul"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <div className={styles.label}>Hizmet</div>
                  <div className={styles.hint}>slug olabilir</div>
                </div>
                <div className={styles.inputFrame}>
                  <div className={styles.icon}>🦷</div>
                  <input
                    className={styles.input}
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="implant"
                    autoComplete="off"
                  />
                </div>
              </div>

              <button className={styles.btnPrimary} type="button" onClick={() => void addCoverage()} disabled={saving}>
                {saving ? "Ekleniyor..." : "Ekle"}
              </button>
            </div>

            <div className={styles.help}>
              İpucu: Şehir/hizmet aynıysa API “upsert” gibi davranır. Ekledikten sonra liste güncellenir.
            </div>
          </div>
        </section>

        {/* LIST CARD */}
        <section className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.cardHead}>
              <div>
                <div className={styles.cardTitle}>Mevcut Kapsamlar</div>
                <div className={styles.cardSub}>Aktif/pasif yönet</div>
              </div>

              <div className={styles.badgeRow}>
                <span className={styles.badge}>Toplam: {sorted.length}</span>
                <span className={`${styles.badge} ${styles.badgeOk}`}>Aktif: {activeCount}</span>
              </div>
            </div>

            {loading ? <div className={styles.loading}>Yükleniyor...</div> : null}

            {!loading && sorted.length === 0 ? (
              <div className={styles.empty}>Henüz kapsam eklenmedi.</div>
            ) : null}

            {!loading && sorted.length > 0 ? (
              <div className={styles.list}>
                {sorted.map((c) => (
                  <div key={c.id} className={styles.item}>
                    <div className={styles.itemTop}>
                      <div className={styles.itemTitle}>
                        <span className={styles.chip}>📍 {labelize(c.city)}</span>
                        <span className={styles.chip}>🦷 {labelize(c.service)}</span>
                      </div>

                      <span className={`${styles.statusPill} ${c.isActive ? styles.statusOn : styles.statusOff}`}>
                        {c.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </div>

                    <div className={styles.itemBottom}>
                      <button
                        type="button"
                        onClick={() => void toggle(c)}
                        className={c.isActive ? styles.btnDangerSoft : styles.btnPrimarySoft}
                      >
                        {c.isActive ? "Pasif Yap" : "Aktif Yap"}
                      </button>

                      <div className={styles.meta}>ID: {c.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}