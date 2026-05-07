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
import { getServiceSeoContent } from "@/lib/seo-service-content";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ city: string; service: string }>;
};

function webPageJsonLd(opts: {
  urlPath: string;
  name: string;
  description: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.urlPath,
    inLanguage: "tr-TR",
  };
}

function howToJsonLd(opts: {
  name: string;
  description: string;
  urlPath: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: opts.urlPath,
    inLanguage: "tr-TR",
    step: [
      {
        "@type": "HowToStep",
        name: "Şehir ve işlemi seç",
        text: "Şehir ve işlem seçimini yaparak uygun kliniklerle eşleş.",
      },
      {
        "@type": "HowToStep",
        name: "KVKK onaylı formu doldur",
        text: "İletişim bilgilerini gir ve KVKK onayı ver.",
      },
      {
        "@type": "HowToStep",
        name: "Klinikler dönüş yapsın",
        text: "Uygun klinikler sırayla seninle iletişime geçer.",
      },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, service } = await params;

  const citySlug = normalizeSlug(city);
  const serviceSlug = normalizeSlug(service);

  const ok = isKnownCity(citySlug) && isKnownService(serviceSlug);
  if (!ok) {
    return {
      title: "Sayfa bulunamadı | DişFiyat360",
      robots: { index: false, follow: false },
    };
  }

  const c = cityLabel(citySlug);
  const s = serviceLabel(serviceSlug);

  return {
    title: `${c} ${s} Fiyatları | Teklif Al | DişFiyat360`,
    description: `${c} ${s} fiyatları, tedavi süreci, fiyatı etkileyen faktörler ve KVKK onaylı teklif alma bilgileri. Kesin fiyat muayene sonrası netleşir.`,
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
  const urlPath = `/sehir/${citySlug}/${serviceSlug}`;

  const teklifHref = `/teklif-al?city=${encodeURIComponent(citySlug)}&service=${encodeURIComponent(
    serviceSlug
  )}`;

  const serviceContent = getServiceSeoContent(c, serviceSlug);
  const baseFaq = cityServiceFaq(citySlug, serviceSlug);
  const faq = [...serviceContent.faqs, ...baseFaq].slice(0, 6);

  const breadcrumbs = breadcrumbsJsonLd([
    { name: "Anasayfa", path: "/" },
    { name: "Şehirler", path: "/sehir" },
    { name: c, path: `/sehir/${citySlug}` },
    { name: s, path: urlPath },
  ]);

  const faqLd = faqJsonLd(faq);

  const pageLd = webPageJsonLd({
    urlPath,
    name: `${c} ${s} fiyatları`,
    description: `${c} içinde ${s} hakkında detaylı bilgi al ve KVKK onaylı form ile kliniklerden teklif iste.`,
  });

  const howToLd = howToJsonLd({
    urlPath,
    name: `${c} için ${s} teklifi nasıl alınır?`,
    description: "3 adımda KVKK onaylı form ile kliniklerden teklif al.",
  });

  const otherServices = SERVICES.filter((x) => x !== serviceSlug).slice(0, 6);

  return (
    <main className={styles.wrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />

      <div className={styles.container}>
        <div className={styles.topGrid}>
          <section className={styles.hero}>
            <div className={styles.kickers}>
              <span className={styles.kicker}>📍 {c}</span>
              <span className={styles.kicker}>🦷 {s}</span>
              <span className={styles.kicker}>KVKK Onaylı</span>
              <span className={styles.kicker}>Ücretsiz</span>
            </div>

            <h1 className={styles.title}>
              {c} {s} fiyatları ve teklif alma rehberi
            </h1>

            <p className={styles.desc}>
              {serviceContent.intro} <strong>Kesin fiyat muayene sonrası netleşir.</strong>
            </p>

            <div className={styles.actions}>
              <Link href={teklifHref} className={`${styles.btn} ${styles.btnPrimary}`}>
                Ücretsiz Teklif Al →
              </Link>
              <Link href={`/sehir/${citySlug}`} className={styles.btn}>
                {c} Hizmetleri
              </Link>
              <Link href="/hizmetler" className={styles.btn}>
                Tüm Hizmetler
              </Link>
            </div>

            <div className={styles.trustRow}>
              <span>✅ 30 saniyede form</span>
              <span>🔒 KVKK onaylı</span>
              <span>📞 Uygun klinikler dönüş yapar</span>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.sideTitle}>Nasıl çalışır?</div>
              <div className={styles.sideSub}>3 adımda teklif al</div>

              <div className={styles.steps}>
                <div><strong>1</strong><span>Şehir ve hizmet seç</span></div>
                <div><strong>2</strong><span>KVKK onaylı formu doldur</span></div>
                <div><strong>3</strong><span>Uygun klinikler iletişime geçsin</span></div>
              </div>

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
              <div className={styles.sideSub}>Benzer hizmet sayfalarını incele</div>

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

        <section className={styles.contentSection}>
          <div className={styles.contentCard}>
            <div className={styles.sectionEyebrow}>Bilgilendirme</div>
            <h2>{c} {s} hakkında</h2>
            <p>{serviceContent.whatIs}</p>
            <p>
              {c} içinde {s} araştırırken yalnızca fiyatı değil; hekimin değerlendirmesi,
              kullanılacak materyal, tedavi planı ve varsa ek işlem ihtiyacını da dikkate almak gerekir.
              Bu nedenle DişFiyat360 üzerinde verilen bilgiler ön bilgilendirme niteliğindedir.
            </p>
          </div>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <div className={styles.sectionEyebrow}>Süreç</div>
              <h2>{s} nasıl uygulanır?</h2>
              <p>{serviceContent.howItWorks}</p>
            </div>

            <div className={styles.contentCard}>
              <div className={styles.sectionEyebrow}>Uygunluk</div>
              <h2>Kimler için uygundur?</h2>
              <p>{serviceContent.suitableFor}</p>
            </div>
          </div>

          <div className={styles.contentCard}>
            <div className={styles.sectionEyebrow}>Fiyat</div>
            <h2>{c} {s} fiyatlarını etkileyen faktörler</h2>
            <p>
              {s} fiyatları sabit değildir. Aynı şehirdeki klinikler arasında bile kullanılan yöntem,
              vaka durumu ve tedavi kapsamı değişebileceği için ücret farklılaşabilir.
            </p>

            <ul className={styles.factorList}>
              {serviceContent.priceFactors.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          <div className={styles.noticeCard}>
            <div className={styles.noticeTitle}>Önemli not</div>
            <div className={styles.noticeText}>
              Bu sayfa bilgilendirme amaçlıdır; tıbbi teşhis veya tedavi tavsiyesi yerine geçmez.
              Kesin fiyat, muayene ve gerekli görülürse görüntüleme sonrası ilgili klinik tarafından belirlenir.
            </div>
          </div>
        </section>

        <section className={styles.faq}>
          <h2 className={styles.faqTitle}>{c} {s} hakkında sık sorulan sorular</h2>

          <div className={styles.faqGrid}>
            {faq.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <div className={styles.faqQ}>{f.question}</div>
                <div className={styles.faqA}>{f.answer}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.cta}>
          <div>
            <div className={styles.ctaTitle}>{c} için {s} teklifi al</div>
            <div className={styles.ctaDesc}>
              KVKK onaylı formu doldur, uygun klinikler seninle iletişime geçsin.
            </div>
          </div>

          <Link href={teklifHref} className={`${styles.btn} ${styles.btnPrimary}`}>
            Ücretsiz Teklif Al →
          </Link>
        </div>
      </div>
    </main>
  );
}