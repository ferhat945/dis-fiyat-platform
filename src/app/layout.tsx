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
        {/* HEADER */}
        <header className="siteHeader">
          <div className="siteHeaderInner">
            <Link href="/" className="brandPill" aria-label="Ana sayfa">
              <span className="brandIcon" aria-hidden>
                🦷
              </span>
              Diş Fiyat Platform
            </Link>

            <nav className="siteNav" aria-label="Üst menü">
              <Link className="navLink" href="/">
                Ana Sayfa
              </Link>
              <Link className="navLink" href="/sehir">
                Şehirler
              </Link>
              <Link className="navLink" href="/hizmetler">
                Hizmetler
              </Link>

              {/* ✅ Blog */}
              <Link className="navLink" href="/blog">
                Blog
              </Link>

              <Link className="navLink" href="/kvkk">
                KVKK
              </Link>
              <Link className="navCta" href="/teklif-al">
                Teklif Al
              </Link>
              <Link className="navLink" href="/login">
                Dişçi misiniz?
              </Link>
            </nav>
          </div>
        </header>

        {/* PAGE */}
        <main className="siteMain">{children}</main>

        {/* FOOTER */}
        <footer className="siteFooter">
          <div className="siteFooterInner">
            <div>
              <div className="footerBrand">
                <span className="brandIcon" aria-hidden>
                  🦷
                </span>
                Diş Fiyat Platform
              </div>
              <div className="footerText">
                KVKK onaylı form ile kliniklerden teklif al. <strong>Kesin fiyat muayene sonrası netleşir.</strong>
              </div>
            </div>

            <div>
              <div className="footerTitle">Bağlantılar</div>
              <div className="footerLinks">
                <Link href="/sehir">Şehirler</Link>
                <Link href="/hizmetler">Hizmetler</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/kvkk">KVKK Metni</Link>
                <Link href="/teklif-al">Teklif Al</Link>
              </div>
            </div>

            <div>
              <div className="footerTitle">Klinikler</div>
              <div className="footerLinks">
                <Link href="/panel/login">Klinik Giriş</Link>
                <Link href="/panel">Klinik Panel</Link>
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
