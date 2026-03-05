import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  CITIES,
  SERVICES,
  cityLabel,
  serviceLabel,
  normalizeSlug,
  titleTR,
  isKnownCity,
  isKnownService,
} from "@/lib/seo-data";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function first(sp: SP, k: string): string {
  const v = sp[k];
  if (!v) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

function pickCity(sp: SP): string {
  return normalizeSlug(first(sp, "city"));
}

function pickService(sp: SP): string {
  return normalizeSlug(first(sp, "service"));
}

function pickQ(sp: SP): string {
  return (first(sp, "q") ?? "").trim().slice(0, 60);
}

function niceLabelCity(slug: string): string {
  if (!slug) return "Tümü";
  return (CITIES as readonly string[]).includes(slug) ? cityLabel(slug) : titleTR(slug);
}

function niceLabelService(slug: string): string {
  if (!slug) return "Tümü";
  return (SERVICES as readonly string[]).includes(slug) ? serviceLabel(slug) : titleTR(slug);
}

function buildCanonical(city: string, service: string, q: string): string {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (service) params.set("service", service);
  // q canonical'a girsin ama index'i kapatacağız (arama sayfaları genelde noindex)
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/klinikler?${qs}` : "/klinikler";
}

function clinicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function cleanInstagramForLabel(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/^\/+|\/+$/g, "");
    return p ? `@${p}` : "Instagram";
  } catch {
    return "Instagram";
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const city = pickCity(sp);
  const service = pickService(sp);
  const q = pickQ(sp);

  const cityOk = !city || isKnownCity(city);
  const serviceOk = !service || isKnownService(service);

  const cityName = city ? niceLabelCity(city) : "Türkiye";
  const serviceName = service ? niceLabelService(service) : "Diş Tedavileri";

  const canonical = buildCanonical(city, service, q);

  const titleBase = city && service
    ? `${cityName} ${serviceName} Klinikleri`
    : city
      ? `${cityName} Diş Klinikleri`
      : service
        ? `${serviceName} Yapan Klinikler`
        : "Klinikler";

  const descBase =
    city && service
      ? `${cityName} içinde ${serviceName} için uygun klinikleri keşfet. KVKK onaylı form ile teklif al.`
      : city
        ? `${cityName} içindeki klinikleri keşfet. Hizmete göre filtreleyip KVKK onaylı form ile teklif al.`
        : service
          ? `${serviceName} için şehir seçip klinikleri keşfet. KVKK onaylı form ile teklif al.`
          : "Şehir ve hizmete göre klinikleri keşfet. Uygun kliniklere ulaş, teklif al.";

  // Arama (q) sayfaları çoğu projede noindex tercih edilir.
  const shouldIndex =
    cityOk &&
    serviceOk &&
    (Boolean(city) || Boolean(service)) &&
    !q;

  return {
    title: `${titleBase} | DişFiyat360`,
    description: descBase,
    alternates: { canonical },
    robots: shouldIndex ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function ClinicsIndexPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<JSX.Element> {
  const sp = await searchParams;

  const city = pickCity(sp);
  const service = pickService(sp);
  const q = pickQ(sp);

  const whereCoverage =
    city || service
      ? {
          coverages: {
            some: {
              isActive: true,
              ...(city ? { city } : {}),
              ...(service ? { service } : {}),
            },
          },
        }
      : { coverages: { some: { isActive: true } } };

  const whereName =
    q.length >= 2
      ? { name: { contains: q, mode: "insensitive" as const } }
      : {};

  const clinics = await prisma.clinic.findMany({
    where: {
      isActive: true,
      ...whereCoverage,
      ...whereName,
    },
    orderBy: [{ name: "asc" }],
    take: 120,
    select: {
      id: true,
      name: true,
      phone: true,
      instagramUrl: true,
      updatedAt: true,
      coverages: {
        where: {
          isActive: true,
          ...(city ? { city } : {}),
          ...(service ? { service } : {}),
        },
        select: { city: true, service: true },
        orderBy: [{ city: "asc" }, { service: "asc" }],
        take: 24,
      },
    },
  });

  const activeCityLabel = niceLabelCity(city);
  const activeServiceLabel = niceLabelService(service);

  const canonical = buildCanonical(city, service, q);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: "/" },
          { "@type": "ListItem", position: 2, name: "Klinikler", item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Klinikler",
        description: "Şehir ve hizmete göre klinikleri keşfet. Uygun kliniklere ulaş, teklif al.",
        url: canonical,
      },
    ],
  };

  return (
    <main className={styles.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <div className={styles.topRow}>
          <h1 className={styles.title}>Klinikler</h1>
          <Link href="/" className={styles.backLink}>
            Ana sayfa →
          </Link>
        </div>

        <p className={styles.desc}>
          Şehir ve hizmete göre filtrele. İstersen klinik adına göre arama yap.
        </p>

        <form action="/klinikler" method="GET" className={styles.form}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              <span className={styles.labelText}>Şehir</span>
              <select name="city" defaultValue={city} className={styles.input}>
                <option value="">Tümü</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {cityLabel(c)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Hizmet</span>
              <select name="service" defaultValue={service} className={styles.input}>
                <option value="">Tümü</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {serviceLabel(s)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Arama</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Klinik adı..."
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              Filtrele
            </button>

            <Link href="/klinikler" className={styles.btn}>
              Sıfırla
            </Link>

            <div className={styles.filterText}>
              Filtre: <strong>{activeCityLabel}</strong> /{" "}
              <strong>{activeServiceLabel}</strong>
              {q ? (
                <>
                  {" "}
                  / Arama: <strong>{q}</strong>
                </>
              ) : null}
            </div>
          </div>
        </form>

        <section>
          <div className={styles.sectionHead}>
            <div className={styles.resultCount}>
              Sonuç: <span style={{ opacity: 0.75 }}>{clinics.length}</span>
            </div>

            <Link href="/teklif-al" className={styles.backLink}>
              Teklif Al →
            </Link>
          </div>

          {clinics.length === 0 ? (
            <div className={styles.warn}>
              Klinik bulunamadı. Filtreyi genişletmeyi deneyin.
            </div>
          ) : (
            <div className={styles.grid}>
              {clinics.map((c) => {
                const slug = clinicSlug(c.name, c.id);

                const uniq = new Map<string, { city: string; service: string }>();
                for (const cv of c.coverages) uniq.set(`${cv.city}__${cv.service}`, cv);
                const tags = Array.from(uniq.values()).slice(0, 8);

                return (
                  <Link key={c.id} href={`/klinikler/${slug}`} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardTitle}>{c.name}</div>
                      <div className={styles.cardMeta}>
                        {new Date(c.updatedAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>

                    <div className={styles.infoRow}>
                      {c.phone ? `📞 ${c.phone}` : "📞 Telefon bilgisi yok"}
                    </div>

                    <div className={styles.infoRow}>
                      {c.instagramUrl
                        ? `📸 ${cleanInstagramForLabel(c.instagramUrl)}`
                        : "📸 Instagram eklenmemiş"}
                    </div>

                    <div className={styles.tags}>
                      {tags.map((t) => (
                        <span key={`${t.city}-${t.service}`} className={styles.tag}>
                          {cityLabel(t.city)} • {serviceLabel(t.service)}
                        </span>
                      ))}
                      {uniq.size > tags.length && (
                        <span className={styles.moreTag}>+{uniq.size - tags.length}</span>
                      )}
                    </div>

                    <div className={styles.cardCta}>Detay →</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
