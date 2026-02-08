import Link from "next/link";
import type { Metadata } from "next";
import { CITIES, SERVICES, cityLabel, serviceLabel, normalizeSlug, isKnownService } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ service: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { service } = await params;
  const s = normalizeSlug(service);
  const serviceName = serviceLabel(s);

  return {
    title: `${serviceName} Fiyatları • Şehrinde Teklif Al`,
    description: `${serviceName} için bulunduğun şehirde kliniklerden teklif al. KVKK onaylı form, hızlı iletişim.`,
    alternates: { canonical: `/hizmet/${s}` },
  };
}

export default async function ServicePage({ params }: PageProps): Promise<JSX.Element> {
  const { service } = await params;
  const s = normalizeSlug(service);
  const serviceName = serviceLabel(s);
  const known = isKnownService(s);

  return (
    <main className="mx-auto max-w-[1100px] px-4">
      <section className="mt-8 card p-6 md:p-8">
        <div className="badge w-fit">{known ? "Hizmet" : "Özel Hizmet"} • {serviceName}</div>
        <h1 className="mt-3 text-3xl font-black">{serviceName} için Şehir Seç</h1>
        <p className="mt-2 text-[rgb(var(--subtext))] font-semibold leading-relaxed">
          Şehri seç → KVKK onaylı formu doldur → uygun klinikler seninle iletişime geçsin.
        </p>

        {!known && (
          <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 font-extrabold text-red-700 leading-relaxed">
            Not: “{serviceName}” listemizde yok ama sayfa çalışır. SEO için hizmet listesini büyütmek istersen ekleriz.
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((c) => (
            <Link key={c} href={`/sehir/${c}/${s}`} className="card p-5 hover:bg-[rgb(var(--muted))]">
              <div className="text-lg font-black">{cityLabel(c)}</div>
              <div className="mt-1 text-sm text-[rgb(var(--subtext))] font-semibold">
                {serviceName} teklif al →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 card-muted p-6">
        <div className="font-black">Diğer hizmetler</div>
        <div className="mt-3 flex gap-2 flex-wrap">
          {SERVICES.filter((x) => x !== s).slice(0, 10).map((ss) => (
            <Link key={ss} href={`/hizmet/${ss}`} className="badge hover:bg-white">
              {serviceLabel(ss)}
            </Link>
          ))}
        </div>
      </section>

      <div className="h-10" />
    </main>
  );
}
