import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  CITIES,
  cityLabel,
  isKnownCity,
  normalizeSlug,
} from "@/lib/seo-data";

import CityServicesClient from "./CityServicesClient";

export function generateStaticParams(): Array<{
  city: string;
}> {
  return CITIES.map((city) => ({
    city,
  }));
}

type PageProps = {
  params: Promise<{
    city: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city } = await params;

  const citySlug =
    normalizeSlug(city);

  if (!isKnownCity(citySlug)) {
    return {
      title:
        "Şehir bulunamadı | DişFiyat360",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const cityName =
    cityLabel(citySlug);

  return {
    title:
      `${cityName} Diş Tedavileri ve Klinikleri | DişFiyat360`,

    description:
      `${cityName} için diş tedavisi hizmetini seç, fiyat ve tedavi bilgilerini incele, KVKK onaylı form ile uygun kliniklerden ücretsiz teklif al. Kesin fiyat muayene sonrası netleşir.`,

    alternates: {
      canonical:
        `/sehir/${citySlug}`,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CityServicesPage({
  params,
}: PageProps): Promise<JSX.Element> {
  const { city } = await params;

  const citySlug =
    normalizeSlug(city);

  if (!isKnownCity(citySlug)) {
    return notFound();
  }

  return (
    <CityServicesClient
      citySlug={citySlug}
    />
  );
}