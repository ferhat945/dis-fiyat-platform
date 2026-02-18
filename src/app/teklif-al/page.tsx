import type { Metadata } from "next";
import Link from "next/link";
import styles from "./OfferPage.module.css";
import OfferForm from "./OfferForm";

export const metadata: Metadata = {
  title: "Teklif Al | Diş Fiyat Platform",
  description: "Şehir + işlem seç, KVKK onaylı formu doldur. Uygun klinikler seninle iletişime geçsin.",
};

export default function OfferPage(): JSX.Element {
  return (
    <section className={styles.wrap}>
      <div className="container">
        <div className={styles.grid}>
          {/* SOL: FORM KARTI */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.badges}>
                <span className={styles.badge}>KVKK Onaylı</span>
                <span className={`${styles.badge} ${styles.badgeSoft}`}>Ücretsiz</span>
                <span className={`${styles.badge} ${styles.badgeSoft}`}>Hızlı iletişim</span>
              </div>

              <h1 className={styles.h1}>Şimdi teklif al, klinikler seni arasın</h1>

              <p className={styles.desc}>
                30 saniyede formu doldur. KVKK onaylıdır. <strong>Kesin fiyat muayene sonrası netleşir.</strong>
              </p>

              <div className={styles.ctaRow}>
                <Link className={styles.btn} href="/sehir">
                  Şehirleri Gör
                </Link>
                <Link className={styles.btn} href="/hizmetler">
                  Hizmetler
                </Link>
                <Link className={styles.btn} href="/kvkk">
                  KVKK Metni
                </Link>
              </div>

              <div className={styles.kvkkHint}>
                Bu bir bilgilendirme formudur; tıbbi teşhis/tavsiye değildir.
              </div>
            </div>

            {/* FORM */}
            <OfferForm />
          </div>

          {/* SAĞ: BİLGİ KARTLARI */}
          <aside className={styles.rightCol}>
            <div className={styles.card}>
              <div className={styles.infoItem}>
                <span className={styles.dot} aria-hidden />
                <div>
                  <div className={styles.infoTitle}>Spam önleme</div>
                  <div className={styles.infoDesc}>Rate limit + honeypot ile korunur.</div>
                </div>
              </div>

              <div className={styles.infoItem} style={{ marginTop: 10 }}>
                <span className={styles.dot} aria-hidden />
                <div>
                  <div className={styles.infoTitle}>KVKK zorunlu</div>
                  <div className={styles.infoDesc}>İzin olmadan form gönderilemez.</div>
                </div>
              </div>

              <div className={styles.infoItem} style={{ marginTop: 10 }}>
                <span className={styles.dot} aria-hidden />
                <div>
                  <div className={styles.infoTitle}>Teklif formu</div>
                  <div className={styles.infoDesc}>Ad, telefon ve ne zaman bilgisi. Hepsi bu.</div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.infoTitle}>Öneri</div>
              <div className={styles.infoDesc} style={{ marginTop: 6 }}>
                Şehir + işlem seçtikten sonra formu doldur. Uygun klinikler seninle iletişime geçsin.
              </div>

              <div className={styles.chipsRow}>
                <span className={styles.chip}>
                  <span className={styles.dot} aria-hidden /> Hızlı
                </span>
                <span className={styles.chip}>
                  <span className={styles.dot} aria-hidden /> Güvenli
                </span>
                <span className={styles.chip}>
                  <span className={styles.dot} aria-hidden /> Ücretsiz
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
