"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PackageCode = "base" | "extra";

type StartResp =
  | { ok: true; mode: "created" | "updated"; package: PackageCode }
  | { ok: false; code: string };

function isPackageCode(v: string | null): v is PackageCode {
  return v === "base" || v === "extra";
}

export default function BuyPage(): JSX.Element {
  const sp = useSearchParams();
  const pkgParam = sp.get("package");
  const pkg: PackageCode = isPackageCode(pkgParam) ? pkgParam : "base";

  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => {
    return pkg === "base"
      ? "Başlangıç Paketi (10 Lead / 800 TL)"
      : "Ek Lead Paketi (+10 Lead / 600 TL)";
  }, [pkg]);

  const startMockPayment = async (): Promise<void> => {
    setLoading(true);
    setErr(null);

    try {
      const r = await fetch("/api/payments/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkg }),
      });

      const j = (await r.json()) as StartResp;

      if (!r.ok || !j.ok) {
        setErr("Ödeme başlatılamadı: " + (j.ok ? "" : j.code));
        return;
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
          ← Aboneliğe dön
        </Link>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
        <div style={{ opacity: 0.75 }}>
          Şu an PayTR kurulmadığı için test modunda “mock ödeme” ile kota yüklenecektir.
        </div>
      </div>

      <button
        type="button"
        onClick={() => void startMockPayment()}
        disabled={loading}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #111",
          background: loading ? "#555" : "#111",
          color: "#fff",
          fontWeight: 900,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "İşleniyor..." : "Test Ödemesi Yap (+10 Lead)"}
      </button>

      {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}

      <div style={{ marginTop: 14 }}>
        <Link href="/panel/leadler" style={{ textDecoration: "none", fontWeight: 900 }}>
          Leadler →
        </Link>
      </div>
    </div>
  );
}
