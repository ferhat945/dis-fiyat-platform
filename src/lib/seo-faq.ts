// src/lib/seo-faq.ts
import { cityLabel, serviceLabel } from "@/lib/seo-data";

export type FaqItem = { question: string; answer: string };

export function cityServiceFaq(city: string, service: string): FaqItem[] {
  const c = cityLabel(city);
  const s = serviceLabel(service);

  return [
    {
      question: "Fiyatlar neden değişiyor?",
      answer:
        "Malzeme, klinik planı, görüntüleme ihtiyacı ve uygulama kapsamı kişiye göre değişebilir. Kesin fiyat muayene sonrası netleşir.",
    },
    {
      question: "Ne kadar sürede dönüş olur?",
      answer:
        "Formu doldurduktan sonra uygun klinikler kısa sürede iletişime geçer (yoğunluğa göre değişebilir).",
    },
    {
      question: "Kesin fiyat nasıl belirlenir?",
      answer:
        "Muayene ve gerekli görülürse görüntüleme sonrası netleşir. Bu sayfa bilgilendirme amaçlıdır.",
    },
    {
      question: `${c} içinde ${s} için nasıl teklif alabilirim?`,
      answer:
        "Şehir ve hizmet seçimiyle teklif formunu doldurursunuz. KVKK onayı olmadan form gönderilemez.",
    },
  ];
}
