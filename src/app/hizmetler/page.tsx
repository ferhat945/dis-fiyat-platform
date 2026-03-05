import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hizmetler | DişFiyat360",
  description: "İşlemini seç, sonra şehir seçerek KVKK onaylı form ile kliniklerden teklif al.",
  alternates: { canonical: "/hizmetler" },
};

export default function ServicesPage(): JSX.Element {
  return <ServicesClient />;
}
