import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şehirler | DişFiyat360",
  description:
    "Şehrini seç, işlem seçerek KVKK onaylı form ile kliniklerden teklif al.",
  alternates: {
    canonical: "/sehir",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CitiesLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <>{children}</>;
}