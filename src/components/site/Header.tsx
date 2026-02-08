import Link from "next/link";

export default function Header(): JSX.Element {
  return (
    <header className="site-header">
      <div className="header-row">
        <Link href="/" className="brand">
          <span className="brand-badge" aria-hidden>
            D
          </span>
          <span>Diş Fiyat Platform</span>
        </Link>

        <nav className="nav">
          <Link href="/#sehirler">Şehirler</Link>
          <Link href="/#hizmetler">Hizmetler</Link>
          <Link href="/kvkk">KVKK</Link>
        </nav>

        <div className="header-actions">
          <Link href="/panel" className="btn btn-soft">
            Dişçi misiniz?
          </Link>
          <Link href="/#teklif" className="btn btn-primary">
            Teklif Al
          </Link>
        </div>
      </div>
    </header>
  );
}
