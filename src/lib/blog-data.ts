// src/lib/blog-data.ts

export type BlogFaqItem = { q: string; a: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  createdAt: string; // YYYY-MM-DD
  // Basit HTML içerik (Markdown değil) -> güvenli, stabil
  html: string;
  faq?: BlogFaqItem[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "implant-fiyatini-ne-belirler",
    title: "İmplant Fiyatını Ne Belirler?",
    description:
      "İmplant fiyatlarını etkileyen faktörler: marka, kemik yapısı, ek işlemler ve klinik seçimi.",
    createdAt: "2026-01-01",
    html: `
      <p>İmplant fiyatları tek bir rakam değildir; vaka ve planlamaya göre değişir.</p>

      <h2>1) İmplant markası ve parça kalitesi</h2>
      <p>Yerli/ithal markalar ve parça kalitesi fiyatı etkiler.</p>

      <h2>2) Kemik yapısı ve ek işlemler</h2>
      <p>Greft, sinüs lift gibi ek işlemler gerekiyorsa maliyet artabilir.</p>

      <h2>3) Görüntüleme ve planlama</h2>
      <p>Panoramik/CBCT gibi görüntüleme süreçleri planlamayı etkiler.</p>

      <h2>4) Klinik lokasyonu ve hekim deneyimi</h2>
      <p>Şehir, bölge ve hekimin deneyimi fiyat üzerinde etkili olabilir.</p>

      <p><strong>Kesin fiyat muayene sonrası netleşir.</strong></p>
    `,
    faq: [
      {
        q: "İmplant fiyatı neden değişir?",
        a: "Kemik durumu, ek işlemler, implant markası ve tedavi planı fiyatı etkiler.",
      },
      {
        q: "Kesin fiyat ne zaman belli olur?",
        a: "Muayene, görüntüleme ve tedavi planı sonrası netleşir.",
      },
    ],
  },
];
