import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = {
  title: "Hizmetler | DişFiyat360",
  description:
    "Diş tedavisi ve estetik diş hekimliği hizmetlerini incele. İşlemini ve şehrini seçerek KVKK onaylı form ile kliniklerden ücretsiz teklif al.",
  alternates: {
    canonical: "/hizmetler",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesPage(): JSX.Element {
  return <ServicesClient />;
}