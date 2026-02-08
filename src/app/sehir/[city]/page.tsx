import Link from "next/link";
import type { Metadata } from "next";
import { CITIES, SERVICES, cityLabel, serviceLabel, normalizeSlug, isKnownCity } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const c = normalizeSlug(city);
  const cityName = cityLabel(c);

  return {
    title: `${cityName} Diş Tedavisi Fiyatları • Kliniklerden Teklif Al`,
    description: `${cityName} şehrinde diş tedavileri için kliniklerden teklif al. KVKK onaylı form ile hızlı iletişim.`,
    alternates: { canonical: `/sehir/${c}` },
  };
}

export default async function CityPage({ params }: PageProps): Promise<JSX.Element> {
  const { city } = await params;
  const c = normalizeSlug(city);
  const cityName = cityLabel(c);
  const known = isKnownCity(c);

  return (
    <main className="mx-auto max-w-[1100px] px-4">
      <section className="mt-8 card p-6 md:p-8">
        <div className="badge w-fit">{known ? "Şehir" : "Özel Şehir"} • {cityName}</div>
        <h1 className="mt-3 text-3xl font-black">{cityName} için Hizmet Seç</h1>
        <p className="mt-2 text-[rgb(var(--subtext))] font-semibold leading-relaxed">
          Hizmeti seç → KVKK onaylı formu doldur → uygun klinikler seninle iletişime geçsin.
        </p>

        {!known && (
          <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 font-extrabold text-red-700 leading-relaxed">
            Not: “{cityName}” listemizde yok ama sayfa çalışır. SEO için şehir listesini büyütmek istersen ekleriz.
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link key={s} href={`/sehir/${c}/${s}`} className="card p-5 hover:bg-[rgb(var(--muted))]">
              <div className="text-lg font-black">{serviceLabel(s)}</div>
              <div className="mt-1 text-sm text-[rgb(var(--subtext))] font-semibold">Teklif al →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 card-muted p-6">
        <div className="font-black">Popüler şehirler</div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {CITIES.filter((x) => x !== c).slice(0, 8).map((cc) => (
            <Link key={cc} href={`/sehir/${cc}`} className="badge hover:bg-white">
              {cityLabel(cc)}
            </Link>
          ))}
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}
