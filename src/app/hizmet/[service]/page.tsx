import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, cityLabel, isKnownService, normalizeSlug, serviceLabel } from "@/lib/seo-data";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ service: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await params;

  const serviceSlug = normalizeSlug(service);
  const ok = isKnownService(serviceSlug);
  const serviceName = ok ? serviceLabel(serviceSlug) : "Hizmet";

  return {
    title: `${serviceName} | Şehir Seç | Diş Fiyat Platform`,
    description: `${serviceName} için şehir seç, KVKK onaylı form ile kliniklerden teklif al.`,
    alternates: { canonical: `/hizmet/${serviceSlug}` },
    robots: ok ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function ServiceCitiesPage({ params }: PageProps): Promise<JSX.Element> {
  const { service } = await params;

  const serviceSlug = normalizeSlug(service);
  if (!isKnownService(serviceSlug)) return notFound();

  const serviceName = serviceLabel(serviceSlug);

  return (
    <main className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.kickerRow}>
            <span className={styles.kicker}>Hizmet</span>
            <span className={`${styles.kicker} ${styles.kickerSoft}`}>KVKK Onaylı</span>
            <span className={`${styles.kicker} ${styles.kickerSoft}`}>Ücretsiz</span>
          </div>

          <h1 className={styles.title}>{serviceName} için şehir seç</h1>
          <p className={styles.desc}>
            Şehri seç → KVKK onaylı formu doldur → uygun klinikler seninle iletişime geçsin.
          </p>

          <div className={styles.actions}>
            <Link href="/hizmetler" className={styles.btn}>
              Hizmetler
            </Link>
            <Link href="/sehir" className={styles.btn}>
              Şehirler
            </Link>
            <Link href="/teklif-al" className={`${styles.btn} ${styles.btnPrimary}`}>
              Teklif Al
            </Link>
          </div>
        </div>

        <div className={styles.grid} aria-label="Şehir listesi">
          {CITIES.map((city) => (
            <Link key={city} href={`/sehir/${city}/${serviceSlug}`} className={styles.card}>
              <div className={styles.cardIcon} aria-hidden>
                📍
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{cityLabel(city)}</div>
                <div className={styles.cardDesc}>{serviceName} için devam et →</div>
              </div>

              <div className={styles.cardArrow} aria-hidden>
                →
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <div>
            <div className={styles.ctaTitle}>Hazırsan teklif al</div>
            <div className={styles.ctaDesc}>Kesin fiyat muayene sonrası netleşir.</div>
          </div>

          <Link href={`/teklif-al?service=${encodeURIComponent(serviceSlug)}`} className={`${styles.btn} ${styles.btnPrimary}`}>
            Teklif Al
          </Link>
        </div>
      </div>
    </main>
  );
}
