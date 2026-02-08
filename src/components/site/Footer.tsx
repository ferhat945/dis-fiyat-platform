import Link from "next/link";

export default function Footer(): JSX.Element {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="h2">Diş Fiyat Platform</div>
          <p className="p">
            KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.
          </p>
        </div>

        <div>
          <div className="h2">Bağlantılar</div>
          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <Link className="link" href="/kvkk">
              KVKK Metni
            </Link>
            <Link className="link" href="/#sehirler">
              Şehirler
            </Link>
            <Link className="link" href="/#hizmetler">
              Hizmetler
            </Link>
          </div>
        </div>

        <div>
          <div className="h2">Not</div>
          <p className="p">
            Bu site bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir.
          </p>
        </div>
      </div>

      <div className="footer-bottom">© {new Date().getFullYear()} • Tüm hakları saklıdır.</div>
    </footer>
  );
}
