import Link from "next/link";
import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <Container>
        <p className="text-sm text-gray-600">
          Bu site bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir. Kesin fiyat muayene sonrası belirlenir.
        </p>

        <div className="mt-3 flex gap-4 text-sm">
          <Link href="/kvkk">KVKK</Link>
          <Link href="/kullanim-sartlari">Kullanım Şartları</Link>
          <Link href="/iletisim">İletişim</Link>
        </div>
      </Container>
    </footer>
  );
}
