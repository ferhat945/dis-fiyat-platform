import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şehirler | Diş Fiyat Platform",
  description: "Şehrini seç, işlem seçerek KVKK onaylı form ile kliniklerden teklif al.",
  alternates: { canonical: "/sehir" },
};

export default function CitiesLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <>{children}</>;
}
