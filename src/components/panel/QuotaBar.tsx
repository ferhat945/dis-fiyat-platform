export function QuotaBar({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((used / Math.max(1, total)) * 100));

  return (
    <div className="rounded border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Bu ay kullanılan lead</p>
        <p className="text-sm font-medium">
          {used} / {total}
        </p>
      </div>

      <div className="mt-3 h-2 w-full rounded bg-gray-100">
        <div className="h-2 rounded bg-black" style={{ width: `${pct}%` }} />
      </div>

      <p className="mt-2 text-xs text-gray-600">
        Kotanız dolarsa yeni lead gelmez. Ek lead satın alabilirsiniz.
      </p>
    </div>
  );
}
