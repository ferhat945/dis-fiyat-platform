import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { absUrl, getBaseUrl } from "@/lib/site-url";
import MobileHeaderMenu from "@/components/site/MobileHeaderMenu";

const SITE_NAME = "DişFiyat360";
const SITE_DESC = "KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    url: absUrl("/"),
    locale: "tr_TR",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="tr">
      <body>
        <header className="siteHeader">
          <div className="siteHeaderInner">
            {/* DESKTOP HEADER */}
            <div className="desktopHeaderBar">
              <Link href="/" className="brandPill" aria-label="Ana sayfa">
                <span className="brandIcon" aria-hidden>
                  🦷
                </span>
                {SITE_NAME}
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
                <Link className="navLink" href="/blog">
                  Blog
                </Link>
                <Link className="navLink" href="/kvkk">
                  KVKK
                </Link>
                <Link className="navCta" href="/teklif-al">
                  Teklif Al
                </Link>
                <Link className="navClinic" href="/login">
                  Klinik Başvurusu
                </Link>
              </nav>
            </div>

            {/* MOBILE HEADER */}
            <MobileHeaderMenu siteName={SITE_NAME} />
          </div>
        </header>

        <main className="siteMain">{children}</main>

        <footer className="siteFooter">
          <div className="siteFooterInner">
            <div>
              <div className="footerBrand">
                <span className="brandIcon" aria-hidden>
                  🦷
                </span>
                {SITE_NAME}
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
                <Link href="/login">Klinik Giriş</Link>
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