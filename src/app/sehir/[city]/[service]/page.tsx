import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  cityLabel,
  isKnownCity,
  isKnownService,
  normalizeSlug,
  serviceLabel,
  SERVICES,
} from "@/lib/seo-data";
import { cityServiceFaq } from "@/lib/seo-faq";
import { breadcrumbsJsonLd, faqJsonLd } from "@/lib/seo-jsonld";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ city: string; service: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, service } = await params;

  const citySlug = normalizeSlug(city);
  const serviceSlug = normalizeSlug(service);

  const ok = isKnownCity(citySlug) && isKnownService(serviceSlug);
  if (!ok) {
    return { title: "Sayfa bulunamadı | Diş Fiyat Platform", robots: { index: false, follow: false } };
  }

  const c = cityLabel(citySlug);
  const s = serviceLabel(serviceSlug);

  return {
    title: `${c} ${s} Fiyatları | Teklif Al | Diş Fiyat Platform`,
    description: `${c} içinde ${s} fiyatları hakkında bilgi al. KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.`,
    alternates: { canonical: `/sehir/${citySlug}/${serviceSlug}` },
    robots: { index: true, follow: true },
  };
}

export default async function CityServiceLanding({ params }: PageProps): Promise<JSX.Element> {
  const { city, service } = await params;

  const citySlug = normalizeSlug(city);
  const serviceSlug = normalizeSlug(service);

  if (!isKnownCity(citySlug) || !isKnownService(serviceSlug)) return notFound();

  const c = cityLabel(citySlug);
  const s = serviceLabel(serviceSlug);

  const teklifHref = `/teklif-al?city=${encodeURIComponent(citySlug)}&service=${encodeURIComponent(serviceSlug)}`;

  const faq = cityServiceFaq(citySlug, serviceSlug);

  const breadcrumbs = breadcrumbsJsonLd([
    { name: "Anasayfa", path: "/" },
    { name: "Şehirler", path: "/sehir" },
    { name: c, path: `/sehir/${citySlug}` },
    { name: s, path: `/sehir/${citySlug}/${serviceSlug}` },
  ]);

  const faqLd = faqJsonLd(faq);

  const otherServices = SERVICES.filter((x) => x !== serviceSlug).slice(0, 6);

  return (
    <main className={styles.wrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className={styles.container}>
        <div className={styles.topGrid}>
          {/* HERO */}
          <div className={styles.hero}>
            <div className={styles.kickers}>
              <span className={styles.kicker}>Şehir / Hizmet</span>
              <span className={`${styles.kicker} ${styles.kickerSoft}`}>KVKK Onaylı</span>
              <span className={`${styles.kicker} ${styles.kickerSoft}`}>Ücretsiz</span>
            </div>

            <h1 className={styles.title}>
              {c} {s} fiyatları
            </h1>

            <p className={styles.desc}>
              {c} içinde {s} hakkında bilgi al, KVKK onaylı form ile kliniklerden teklif iste.{" "}
              <strong>Kesin fiyat muayene sonrası netleşir.</strong>
            </p>

            <div className={styles.actions}>
              <Link href={teklifHref} className={`${styles.btn} ${styles.btnPrimary}`}>
                Teklif Al →
              </Link>
              <Link href={`/sehir/${citySlug}`} className={styles.btn}>
                {c} Hizmetleri
              </Link>
              <Link href="/hizmetler" className={styles.btn}>
                Tüm Hizmetler
              </Link>
            </div>

            <div className={styles.noticeCard}>
              <div className={styles.noticeTitle}>Bilgilendirme</div>
              <div className={styles.noticeText}>
                Bu sayfa bilgilendirme amaçlıdır. Kesin fiyat muayene ve gerekli görülürse görüntüleme sonrası netleşir.
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>Nasıl çalışır?</div>
              <div className={styles.sideSub}>3 adımda teklif al</div>
              <ul className={styles.bullets}>
                <li>Şehir / hizmet seç</li>
                <li>KVKK onaylı formu doldur</li>
                <li>Uygun klinikler iletişime geçsin</li>
              </ul>

              <div className={styles.sideActions}>
                <Link href={teklifHref} className={`${styles.btn} ${styles.btnPrimary}`}>
                  Teklif Al
                </Link>
                <Link href="/kvkk" className={styles.btn}>
                  KVKK Metni
                </Link>
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>{c} içinde diğer işlemler</div>
              <div className={styles.sideSub}>İç link (SEO + UX)</div>

              <div className={styles.sideLinks}>
                {otherServices.map((os) => (
                  <Link key={os} href={`/sehir/${citySlug}/${os}`} className={styles.sideLink}>
                    <span>{serviceLabel(os)}</span>
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className={styles.faq}>
          <h2 className={styles.faqTitle}>Sık sorulan sorular</h2>

          <div className={styles.faqGrid}>
            {faq.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <div className={styles.faqQ}>{f.question}</div>
                <div className={styles.faqA}>{f.answer}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <div className={styles.cta}>
          <div>
            <div className={styles.ctaTitle}>Teklif al</div>
            <div className={styles.ctaDesc}>
              {c} için {s} teklif formunu 30 saniyede doldur.
            </div>
          </div>

          <Link href={teklifHref} className={`${styles.btn} ${styles.btnPrimary}`}>
            Teklif Al
          </Link>
        </div>
      </div>
    </main>
  );
}
