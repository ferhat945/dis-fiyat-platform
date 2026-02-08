import Link from "next/link";
import { Container } from "./Container";

export function SiteHeader() {
  return (
    <header className="border-b">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold">
            DisFiyat
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/islemler">İşlemler</Link>
            <Link href="/sehir/istanbul">Şehirler</Link>
            <Link href="/panel">Dişçi misiniz?</Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
