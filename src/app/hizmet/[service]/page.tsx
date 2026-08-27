import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CITIES,
  SERVICES,
  cityLabel,
  isKnownService,
  normalizeSlug,
  serviceLabel,
} from "@/lib/seo-data";
import styles from "./page.module.css";

export const revalidate = 21600;

export function generateStaticParams(): Array<{
  service: string;
}> {
  return SERVICES.map((service) => ({
    service,
  }));
}

type PageProps = {
  params: Promise<{
    service: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { service } = await params;

  const serviceSlug = normalizeSlug(service);
  const ok = isKnownService(serviceSlug);

  if (!ok) {
    return {
      title: "Hizmet bulunamadı | DişFiyat360",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const serviceName = serviceLabel(serviceSlug);

  return {
    title: `${serviceName} | Şehir Seç | DişFiyat360`,
    description: `${serviceName} için şehir seç, tedavi seçeneklerini incele ve KVKK onaylı form ile kliniklerden ücretsiz teklif al. Kesin fiyat muayene sonrası netleşir.`,
    alternates: {
      canonical: `/hizmet/${serviceSlug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ServiceCitiesPage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { service } = await params;

  const serviceSlug = normalizeSlug(service);

  if (!isKnownService(serviceSlug)) {
    return notFound();
  }

  const serviceName = serviceLabel(serviceSlug);

  return (
    <main className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.head}>
          <div className={styles.kickerRow}>
            <span className={styles.kicker}>
              Hizmet
            </span>

            <span
              className={`${styles.kicker} ${styles.kickerSoft}`}
            >
              KVKK Onaylı
            </span>

            <span
              className={`${styles.kicker} ${styles.kickerSoft}`}
            >
              Ücretsiz
            </span>
          </div>

          <h1 className={styles.title}>
            {serviceName} için şehir seç
          </h1>

          <p className={styles.desc}>
            Şehrini seç, {serviceName} hakkında
            bilgi al ve KVKK onaylı form ile
            uygun kliniklerden teklif iste.{" "}
            <strong>
              Kesin fiyat muayene sonrası
              netleşir.
            </strong>
          </p>

          <div className={styles.actions}>
            <Link
              href="/hizmetler"
              className={styles.btn}
            >
              Hizmetler
            </Link>

            <Link
              href="/sehir"
              className={styles.btn}
            >
              Şehirler
            </Link>

            <Link
              href={`/teklif-al?service=${encodeURIComponent(
                serviceSlug,
              )}`}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Teklif Al
            </Link>
          </div>
        </div>

        <div
          className={styles.grid}
          aria-label={`${serviceName} için şehir listesi`}
        >
          {CITIES.map((city) => (
            <Link
              key={city}
              href={`/sehir/${city}/${serviceSlug}`}
              className={styles.card}
            >
              <div
                className={styles.cardIcon}
                aria-hidden
              >
                📍
              </div>

              <div className={styles.cardBody}>
                <div
                  className={styles.cardTitle}
                >
                  {cityLabel(city)}
                </div>

                <div
                  className={styles.cardDesc}
                >
                  {serviceName} için fiyatları
                  ve teklif seçeneklerini incele
                  →
                </div>
              </div>

              <div
                className={styles.cardArrow}
                aria-hidden
              >
                →
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <div>
            <div
              className={styles.ctaTitle}
            >
              {serviceName} için teklif al
            </div>

            <div
              className={styles.ctaDesc}
            >
              Şehrini seç veya doğrudan teklif
              formuna geç. Kesin fiyat muayene
              sonrası netleşir.
            </div>
          </div>

          <Link
            href={`/teklif-al?service=${encodeURIComponent(
              serviceSlug,
            )}`}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Ücretsiz Teklif Al →
          </Link>
        </div>
      </div>
    </main>
  );
}