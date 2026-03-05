// src/app/panel/fiyatlar/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { CITIES, SERVICES, cityLabel, serviceLabel } from "@/lib/seo-data";

type PriceRange = {
  id: string;
  city: string;
  service: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  isActive: boolean;
  updatedAt?: string;
  createdAt?: string;
};

type ListResp =
  | { ok: true; items: PriceRange[] }
  | { ok: false; code: string };

type CreateResp =
  | { ok: true; item: PriceRange }
  | { ok: false; code: string };

function onlyDigits(v: string): string {
  return (v ?? "").replace(/[^\d]/g, "");
}

function toIntSafe(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtTRY(n: number): string {
  try {
    return new Intl.NumberFormat("tr-TR").format(n);
  } catch {
    return String(n);
  }
}

type RowState = {
  minPrice: string; // ✅ string -> 0100 biter
  maxPrice: string;
  currency: string;
  isActive: boolean;
  existingId?: string; // varsa “güncelleme” gibi davranır (API upsert ise)
};

export default function PanelFiyatlarPage(): JSX.Element {
  const [city, setCity] = useState<string>(CITIES[0] ?? "istanbul");

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  // service -> row state
  const [rows, setRows] = useState<Record<string, RowState>>({});

  // satır bazlı “saving” (hangi hizmet kaydediliyor)
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // server’dan gelen tüm kayıtlar
  const [items, setItems] = useState<PriceRange[]>([]);

  const itemsByService = useMemo(() => {
    const m = new Map<string, PriceRange>();
    for (const it of items) {
      if (it.city === city) m.set(it.service, it);
    }
    return m;
  }, [items, city]);

  function ensureRowsInitialized(fromItems: PriceRange[], selectedCity: string): void {
    // var olan rows'u bozmayalım ama boşsa dolduralım
    setRows((prev) => {
      const next: Record<string, RowState> = { ...prev };

      for (const s of SERVICES) {
        const existing = fromItems.find((x) => x.city === selectedCity && x.service === s);
        // eğer kullanıcı bir şey yazdıysa ezmeyelim
        if (next[s]) continue;

        next[s] = {
          minPrice: existing ? String(existing.minPrice) : "",
          maxPrice: existing ? String(existing.maxPrice) : "",
          currency: existing?.currency ?? "TRY",
          isActive: existing?.isActive ?? true,
          existingId: existing?.id,
        };
      }
      return next;
    });
  }

  async function load(): Promise<void> {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/panel/price-ranges", { method: "GET" });
      const j = (await r.json()) as ListResp;
      if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

      setItems(j.items);
      ensureRowsInitialized(j.items, city);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "NETWORK_ERROR";
      setErr(msg);
      setItems([]);
      // rows'u bozmayalım
    } finally {
      setLoading(false);
    }
  }

  async function saveService(service: string): Promise<void> {
    setErr(null);

    const row = rows[service];
    if (!row) return;

    const min = toIntSafe(row.minPrice || "0");
    const max = toIntSafe(row.maxPrice || "0");

    if (min <= 0 || max <= 0) {
      setErr(`${serviceLabel(service)}: Min/Max 0’dan büyük olmalı.`);
      return;
    }
    if (max < min) {
      setErr(`${serviceLabel(service)}: Max, Min’den küçük olamaz.`);
      return;
    }

    setSaving((p) => ({ ...p, [service]: true }));
    try {
      const r = await fetch("/api/panel/price-ranges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          service,
          minPrice: min,
          maxPrice: max,
          currency: row.currency || "TRY",
          isActive: row.isActive ?? true,
        }),
      });

      const j = (await r.json()) as CreateResp;
      if (!r.ok || !j.ok) throw new Error(j.ok ? "UNKNOWN" : j.code);

      // local update: items listesine ekle/güncelle
      setItems((prev) => {
        const next = [...prev];
        const idx = next.findIndex((x) => x.city === city && x.service === service);
        if (idx >= 0) next[idx] = j.item;
        else next.push(j.item);
        return next;
      });

      // row existing id + normalize
      setRows((prev) => ({
        ...prev,
        [service]: {
          ...prev[service],
          minPrice: String(j.item.minPrice),
          maxPrice: String(j.item.maxPrice),
          currency: j.item.currency ?? prev[service].currency ?? "TRY",
          isActive: j.item.isActive ?? prev[service].isActive ?? true,
          existingId: j.item.id,
        },
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "NETWORK_ERROR";
      setErr(msg);
    } finally {
      setSaving((p) => ({ ...p, [service]: false }));
    }
  }

  function setRow(service: string, patch: Partial<RowState>): void {
    setRows((prev) => ({
      ...prev,
      [service]: {
        ...(prev[service] ?? { minPrice: "", maxPrice: "", currency: "TRY", isActive: true }),
        ...patch,
      },
    }));
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // şehir değişince: o şehre ait kayıtları satırlara bas (kullanıcı yazmışsa ezmek istemiyoruz)
  useEffect(() => {
    // yeni şehirde rows yoksa doldur
    ensureRowsInitialized(items, city);

    // ama şehir değişince “mevcut kayıt” varsa ve inputlar boşsa dolduralım
    setRows((prev) => {
      const next = { ...prev };
      for (const s of SERVICES) {
        const existing = items.find((x) => x.city === city && x.service === s);
        if (!existing) continue;

        const cur = next[s];
        if (!cur) continue;

        // kullanıcı bir şey yazmamışsa doldur
        const minEmpty = !cur.minPrice;
        const maxEmpty = !cur.maxPrice;

        next[s] = {
          ...cur,
          minPrice: minEmpty ? String(existing.minPrice) : cur.minPrice,
          maxPrice: maxEmpty ? String(existing.maxPrice) : cur.maxPrice,
          currency: cur.currency || existing.currency || "TRY",
          isActive: typeof cur.isActive === "boolean" ? cur.isActive : (existing.isActive ?? true),
          existingId: existing.id,
        };
      }
      return next;
    });
  }, [city, items]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 950 }}>Fiyat Aralıkları</div>
          <div style={{ opacity: 0.75, fontWeight: 750, marginTop: 4 }}>
            Şehir seç → işlemler alt alta → hızlıca fiyat girip kaydet.
          </div>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          style={btnSoft(loading)}
        >
          Yenile
        </button>
      </div>

      {err ? (
        <div style={errBox()}>
          <strong>Hata:</strong> {err}
        </div>
      ) : null}

      <section style={{ ...card(), marginTop: 12 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 950 }}>Şehir</div>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={inp()}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {cityLabel(c)}
              </option>
            ))}
          </select>

          <div style={{ opacity: 0.7, fontWeight: 800, fontSize: 12 }}>
            Seçili şehir: <strong>{cityLabel(city)}</strong> • Kayıtlı:{" "}
            <strong>{Array.from(itemsByService.values()).length}</strong>
          </div>
        </div>
      </section>

      {/* LIST: tüm hizmetler alt alta */}
      <section style={{ marginTop: 12 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {SERVICES.map((s) => {
            const row = rows[s] ?? { minPrice: "", maxPrice: "", currency: "TRY", isActive: true };
            const existing = itemsByService.get(s);
            const isSaving = !!saving[s];

            return (
              <div key={s} style={rowCard()}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ fontWeight: 950, fontSize: 15 }}>
                    {serviceLabel(s)}
                    {existing ? (
                      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 900, opacity: 0.7 }}>
                        (kayıtlı)
                      </span>
                    ) : (
                      <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 900, opacity: 0.55 }}>
                        (boş)
                      </span>
                    )}
                  </div>

                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 850, opacity: 0.9 }}>
                    <input
                      type="checkbox"
                      checked={row.isActive ?? true}
                      onChange={(e) => setRow(s, { isActive: e.target.checked })}
                    />
                    Aktif
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "grid",
                    gap: 10,
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    alignItems: "end",
                  }}
                >
                  <label style={lbl()}>
                    <span style={lblTitle()}>Min (₺)</span>
                    <input
                      value={row.minPrice}
                      onChange={(e) => setRow(s, { minPrice: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="Örn: 10000"
                      style={inp()}
                    />
                    <span style={hint()}>
                      {row.minPrice ? `${fmtTRY(toIntSafe(row.minPrice))} ₺` : "—"}
                    </span>
                  </label>

                  <label style={lbl()}>
                    <span style={lblTitle()}>Max (₺)</span>
                    <input
                      value={row.maxPrice}
                      onChange={(e) => setRow(s, { maxPrice: onlyDigits(e.target.value) })}
                      inputMode="numeric"
                      placeholder="Örn: 25000"
                      style={inp()}
                    />
                    <span style={hint()}>
                      {row.maxPrice ? `${fmtTRY(toIntSafe(row.maxPrice))} ₺` : "—"}
                    </span>
                  </label>

                  <label style={lbl()}>
                    <span style={lblTitle()}>Para birimi</span>
                    <select
                      value={row.currency || "TRY"}
                      onChange={(e) => setRow(s, { currency: e.target.value })}
                      style={inp()}
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <span style={hint()}>Varsayılan: TRY</span>
                  </label>

                  <div style={{ display: "grid", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => void saveService(s)}
                      disabled={
                        isSaving ||
                        !row.minPrice ||
                        !row.maxPrice ||
                        toIntSafe(row.minPrice) <= 0 ||
                        toIntSafe(row.maxPrice) <= 0 ||
                        toIntSafe(row.maxPrice) < toIntSafe(row.minPrice)
                      }
                      style={btnPrimary(isSaving)}
                    >
                      {isSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>

                    <div style={{ fontSize: 12, fontWeight: 850, opacity: 0.7 }}>
                      {existing ? (
                        <>
                          Son kayıt:{" "}
                          <strong>
                            {fmtTRY(existing.minPrice)}–{fmtTRY(existing.maxPrice)} {existing.currency}
                          </strong>
                        </>
                      ) : (
                        <>Henüz kayıt yok</>
                      )}
                    </div>
                  </div>
                </div>

                {row.minPrice && row.maxPrice && toIntSafe(row.maxPrice) < toIntSafe(row.minPrice) ? (
                  <div style={warn()}>
                    Max fiyat min fiyattan küçük olamaz.
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ marginTop: 14, opacity: 0.8, fontWeight: 800, fontSize: 12 }}>
        Not: Kesin fiyat muayene sonrası netleşir. Bu aralıklar bilgilendirme amaçlıdır.
      </div>
    </div>
  );
}

/* ---- styles ---- */

function card(): React.CSSProperties {
  return {
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.55)",
    borderRadius: 18,
    padding: 14,
  };
}

function rowCard(): React.CSSProperties {
  return {
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.55)",
    borderRadius: 18,
    padding: 14,
  };
}

function inp(): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: "#fff",
    outline: "none",
    fontWeight: 800,
  };
}

function lbl(): React.CSSProperties {
  return { display: "flex", flexDirection: "column", gap: 6 };
}

function lblTitle(): React.CSSProperties {
  return { fontWeight: 950 };
}

function hint(): React.CSSProperties {
  return { fontSize: 12, fontWeight: 850, opacity: 0.7 };
}

function errBox(): React.CSSProperties {
  return {
    marginTop: 12,
    border: "1px solid #f2c9c9",
    background: "#fff5f5",
    borderRadius: 14,
    padding: 12,
    fontWeight: 850,
    color: "#7f1d1d",
  };
}

function warn(): React.CSSProperties {
  return {
    marginTop: 10,
    border: "1px solid rgba(245,158,11,0.35)",
    background: "rgba(245,158,11,0.10)",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 850,
    color: "rgba(120,53,15,0.95)",
  };
}

function btnPrimary(disabled: boolean): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    background: disabled ? "rgba(17,17,17,0.6)" : "#111",
    color: "#fff",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
  };
}

function btnSoft(disabled: boolean): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.6)",
    color: "#111",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}
