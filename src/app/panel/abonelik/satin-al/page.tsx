"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PackageCode = "base" | "extra" | "credit_5" | "credit_10" | "credit_25" | "premium";

type StartResp =
  | {
      ok: true;
      mode: "trial" | "created" | "updated" | "credits_added" | "premium_started";
      package: PackageCode;
      creditsAdded?: number;
    }
  | { ok: false; code: string };

function isPackageCode(v: string | null): v is PackageCode {
  return (
    v === "base" ||
    v === "extra" ||
    v === "credit_5" ||
    v === "credit_10" ||
    v === "credit_25" ||
    v === "premium"
  );
}

function packageTitle(pkg: PackageCode): string {
  if (pkg === "credit_5") return "5 Kredi Paketi — 1500 TL";
  if (pkg === "credit_10") return "10 Kredi Paketi — 2000 TL";
  if (pkg === "credit_25") return "25 Kredi Paketi — 4000 TL";
  if (pkg === "premium") return "Premium Üyelik — 2500 TL / ay";
  if (pkg === "base") return "Eski Aylık Abonelik — 2000 TL";
  return "Eski Ek Lead Paketi — 1000 TL";
}

function packageDesc(pkg: PackageCode): string {
  if (pkg === "credit_5") return "5 kredi hesabına eklenir. 1 kredi = 1 lead açma hakkı.";
  if (pkg === "credit_10") return "10 kredi hesabına eklenir. Daha avantajlı kredi paketi.";
  if (pkg === "credit_25") return "25 kredi hesabına eklenir. En avantajlı kredi paketi.";
  if (pkg === "premium") return "Premium aktif olur, 10 kredi yüklenir ve premium öncelik hakkı tanımlanır.";
  if (pkg === "base") return "Eski abonelik sistemi için 10 lead kotası yüklenir.";
  return "Eski abonelik sistemine +10 lead kotası ekler.";
}

export default function BuyPage(): JSX.Element {
  const sp = useSearchParams();
  const pkgParam = sp.get("package");
  const pkg: PackageCode = isPackageCode(pkgParam) ? pkgParam : "credit_10";

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const title = useMemo(() => packageTitle(pkg), [pkg]);
  const desc = useMemo(() => packageDesc(pkg), [pkg]);

  const startMockPayment = async (): Promise<void> => {
    setLoading(true);
    setErr(null);
    setInfo(null);

    try {
      const r = await fetch("/api/payments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkg }),
      });

      const j = (await r.json()) as StartResp;

      if (!r.ok || !j.ok) {
        setErr("İşlem başarısız: " + (j.ok ? "" : j.code));
        return;
      }

      if (j.mode === "credits_added") {
        setInfo(`✅ ${j.creditsAdded ?? 0} kredi hesabına eklendi.`);
      } else if (j.mode === "premium_started") {
        setInfo("✅ Premium üyelik başlatıldı ve 10 kredi yüklendi.");
      } else if (j.mode === "trial") {
        setInfo("✅ Trial başlatıldı.");
      } else if (j.mode === "created") {
        setInfo("✅ Abonelik başlatıldı.");
      } else if (j.mode === "updated") {
        setInfo("✅ Kota güncellendi.");
      }

      window.location.href = "/panel/abonelik";
    } catch {
      setErr("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Satın Al</h1>
        <Link href="/panel/abonelik" style={{ textDecoration: "none", opacity: 0.8 }}>
          ← Kredi Yönetimine dön
        </Link>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontWeight: 950, marginBottom: 6, fontSize: 18 }}>{title}</div>
        <div style={{ opacity: 0.78, fontWeight: 750, lineHeight: 1.7 }}>{desc}</div>

        <div style={{ marginTop: 12, border: "1px solid rgba(15,23,42,0.10)", borderRadius: 12, padding: 12 }}>
          <strong>Not:</strong> Şu an test/mock işlem çalışır. Ödeme sistemi bağlanınca bu ekran gerçek ödeme akışına bağlanacak.
        </div>
      </div>

      <button
        type="button"
        onClick={() => void startMockPayment()}
        disabled={loading}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #111",
          background: loading ? "#555" : "#111",
          color: "#fff",
          fontWeight: 900,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "İşleniyor..." : "İşlemi Başlat"}
      </button>

      {info && <div style={{ marginTop: 12, fontWeight: 800 }}>{info}</div>}
      {err && <div style={{ marginTop: 12, color: "crimson", fontWeight: 800 }}>{err}</div>}

      <div style={{ marginTop: 14 }}>
        <Link href="/panel/leadler" style={{ textDecoration: "none", fontWeight: 900 }}>
          Leadler →
        </Link>
      </div>
    </div>
  );
}