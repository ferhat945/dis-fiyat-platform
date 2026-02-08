"use client";

import { useSearchParams } from "next/navigation";

export default function PanelPaymentPage() {
  const sp = useSearchParams();
  const type = sp.get("type") ?? "";

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">Ödeme</h1>
      <p className="text-gray-600">
        Seçim: <b>{type || "-"}</b>
      </p>

      <div className="rounded border p-4 text-sm text-gray-700">
        Buraya PayTR iFrame gelecek. Şu an sadece sayfa iskeleti var.
      </div>
    </div>
  );
}
