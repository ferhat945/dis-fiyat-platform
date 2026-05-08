import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { absUrl, getBaseUrl } from "@/lib/site-url";
import MobileHeaderMenu from "@/components/site/MobileHeaderMenu";

const SITE_NAME = "DişFiyat360";
const SITE_DESC =
  "KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="tr">
      <body>
        <header className="siteHeader">
          <div className="siteHeaderInner">
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
                <Link className="navCta navCtaPulse" href="/teklif-al">
                  Teklif Al
                </Link>
                <Link className="navClinic" href="/login">
                  Klinik Başvurusu
                </Link>
              </nav>
            </div>

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
                KVKK onaylı form ile kliniklerden teklif al.{" "}
                <strong>Kesin fiyat muayene sonrası netleşir.</strong>
              </div>

              <div className="footerBusinessInfo">
                İşletme Sahibi: <strong>Ferhat Menekşe</strong>
                <br />
                Vergi No: <strong>6150625779</strong>
                <br />
                Adres: Dumlupınar Mahallesi 38007 Sokak No:4
                <br />
                Telefon: <a href="tel:05319171739">0531 917 17 39</a>
                <br />
                E-posta:{" "}
                <a href="mailto:ferhatmenekse945@gmail.com">
                  ferhatmenekse945@gmail.com
                </a>
              </div>
            </div>

            <div>
              <div className="footerTitle">Bağlantılar</div>
              <div className="footerLinks">
                <Link href="/sehir">Şehirler</Link>
                <Link href="/hizmetler">Hizmetler</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/teklif-al">Teklif Al</Link>
                <Link href="/klinikler">Klinik Dizini</Link>
                <Link href="/login">Klinik Giriş</Link>
              </div>
            </div>

            <div>
              <div className="footerTitle">Kurumsal</div>
              <div className="footerLinks">
                <Link href="/hakkimizda">Hakkımızda</Link>
                <Link href="/iletisim">İletişim</Link>
                <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
                <Link href="/gizlilik-politikasi">Gizlilik Politikası</Link>
                <Link href="/cerez-politikasi">Çerez Politikası</Link>
                <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
                <Link href="/mesafeli-satis-sozlesmesi">
                  Mesafeli Satış Sözleşmesi
                </Link>
                <Link href="/iptal-iade">İptal ve İade Politikası</Link>
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