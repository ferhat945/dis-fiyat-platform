import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cityLabel, isKnownCity, normalizeSlug } from "@/lib/seo-data";
import CityServicesClient from "./CityServicesClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const citySlug = normalizeSlug(city);
  const ok = isKnownCity(citySlug);

  const titleCity = ok ? cityLabel(citySlug) : "Şehir";

  return {
    title: `${titleCity} | Hizmetler | Diş Fiyat Platform`,
    description: `${titleCity} için hizmet seç, KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.`,
    alternates: { canonical: `/sehir/${citySlug}` },
    robots: ok ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function CityServicesPage({ params }: PageProps): Promise<JSX.Element> {
  const { city } = await params;
  const citySlug = normalizeSlug(city);

  if (!isKnownCity(citySlug)) return notFound();

  return <CityServicesClient citySlug={citySlug} />;
}
