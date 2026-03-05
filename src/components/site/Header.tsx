import Link from "next/link";

export default function Header(): JSX.Element {
  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link href="/" className="brandPill">
          <span className="brandIcon" aria-hidden>
            D
          </span>
          <span>DişFiyat360</span>
        </Link>

        <nav className="siteNav">
          <Link href="/#sehirler" className="navLink">
            Şehirler
          </Link>
          <Link href="/#hizmetler" className="navLink">
            Hizmetler
          </Link>
          <Link href="/blog" className="navLink">
            Blog
          </Link>
          <Link href="/kvkk" className="navLink">
            KVKK
          </Link>

          {/* ✅ Renkli Klinik Başvurusu */}
          <Link href="/panel" className="navCta navCtaClinic">
            Klinik Başvurusu
          </Link>

          {/* ✅ Teklif Al */}
          <Link href="/teklif-al" className="navCta">
            Teklif Al
          </Link>
        </nav>
      </div>
    </header>
  );
}