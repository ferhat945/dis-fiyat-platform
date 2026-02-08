import Link from "next/link";

const items = [
  { href: "/panel", label: "Dashboard" },
  { href: "/panel/leadler", label: "Leadler" },
  { href: "/panel/hizmetler", label: "Hizmetler" },
  { href: "/panel/abonelik", label: "Abonelik" },
];

export function Sidebar() {
  return (
    <aside className="w-full border-b p-4 md:min-h-[calc(100vh-56px)] md:w-64 md:border-b-0 md:border-r">
      <div className="mb-4">
        <p className="text-sm text-gray-500">Klinik Paneli</p>
        <p className="text-lg font-semibold">DisFiyat</p>
      </div>

      <nav className="grid gap-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded px-3 py-2 text-sm hover:bg-gray-100"
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
