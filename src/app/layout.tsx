import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diş Fiyat Platform",
  description: "KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.",
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="tr">
      <body>
        {/* ÜST MENÜ */}
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <Link href="/" className="brandPill" aria-label="Ana sayfa">
              Diş Fiyat Platform
            </Link>

            <nav className="siteNav" aria-label="Üst menü">
              <Link className="navLink" href="/sehir">
                Şehirler
              </Link>
              <Link className="navLink" href="/hizmetler">
                Hizmetler
              </Link>
              <Link className="navLink" href="/kvkk">
                KVKK
              </Link>
              <Link className="navCta" href="/teklif-al">
                Teklif Al
              </Link>
            </nav>
          </div>
        </header>

        {/* SAYFA */}
        <main className="siteMain">{children}</main>

        {/* ALT MENÜ */}
        <footer className="siteFooter">
          <div className="siteFooterInner">
            <div className="footerCol">
              <div className="footerBrand">Diş Fiyat Platform</div>
              <div className="footerText">
                KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.
              </div>
            </div>

            <div className="footerCol">
              <div className="footerTitle">Bağlantılar</div>
              <div className="footerLinks">
                <Link href="/kvkk">KVKK Metni</Link>
                <Link href="/sehir">Şehirler</Link>
                <Link href="/hizmetler">Hizmetler</Link>
                <Link href="/teklif-al">Teklif Al</Link>
                <Link href="/panel/login">Klinik Giriş</Link>
              </div>
            </div>
          </div>

          <div className="footerBottom">
            <span>© {new Date().getFullYear()} • Tüm hakları saklıdır.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
