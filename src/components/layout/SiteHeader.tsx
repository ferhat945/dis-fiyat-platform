import Link from "next/link";
import { Container } from "./Container";

export function SiteHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg">
            DisFiyat
          </Link>

          {/* Menü */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/islemler" className="hover:text-blue-600 transition">
              İşlemler
            </Link>

            <Link href="/sehir/istanbul" className="hover:text-blue-600 transition">
              Şehirler
            </Link>

            {/* ✅ Renkli Klinik Başvurusu */}
            <Link
              href="/panel"
              className="px-4 py-2 rounded-lg text-white font-semibold 
                         bg-gradient-to-r from-pink-500 to-purple-600 
                         hover:from-pink-600 hover:to-purple-700 
                         transition shadow-md"
            >
              Klinik Başvurusu
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}