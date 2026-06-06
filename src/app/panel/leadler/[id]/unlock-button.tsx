"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UnlockResp =
  | { ok: true; alreadyUnlocked?: boolean }
  | { ok: false; code: string; detail?: string };

export default function UnlockLeadButton({
  leadId,
  disabled,
}: {
  leadId: string;
  disabled?: boolean;
}): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function unlock(): Promise<void> {
    setLoading(true);
    setErr(null);

    try {
      const r = await fetch(`/api/panel/leads/${leadId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const j = (await r.json()) as UnlockResp;

      if (!r.ok || !j.ok) {
        if (!j.ok && j.code === "NO_CREDIT") {
          setErr("Yeterli kredin yok. Kredi satın almalısın.");
          return;
        }

        setErr(!j.ok ? j.code : "UNKNOWN_ERROR");
        return;
      }

      router.refresh();
    } catch {
      setErr("NETWORK_ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        onClick={() => void unlock()}
        disabled={loading || disabled}
        className="panelBtn"
        style={{
          opacity: loading || disabled ? 0.65 : 1,
          cursor: loading || disabled ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Açılıyor..." : "💎 1 Kredi Harca ve Aç"}
      </button>

      {err ? (
        <div style={{ color: "crimson", fontWeight: 900, fontSize: 13 }}>
          Hata: {err}
        </div>
      ) : null}
    </div>
  );
}