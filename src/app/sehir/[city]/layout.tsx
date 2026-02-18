import type { Metadata } from "next";
import { cityLabel, isKnownCity, normalizeSlug } from "@/lib/seo-data";

type LayoutProps = {
  params: Promise<{ city: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { city } = await params;
  const citySlug = normalizeSlug(city);
  const titleCity = cityLabel(citySlug);

  return {
    title: `${titleCity} | Hizmetler | Diş Fiyat Platform`,
    description: `${titleCity} için hizmet seç, KVKK onaylı form ile kliniklerden teklif al. Kesin fiyat muayene sonrası netleşir.`,
    alternates: { canonical: `/sehir/${citySlug}` },
    robots: isKnownCity(citySlug) ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}
