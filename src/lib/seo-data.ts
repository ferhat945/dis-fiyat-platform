// src/lib/seo-data.ts

export const CITIES = [
  "istanbul",
  "ankara",
  "izmir",
  "bursa",
  "antalya",
] as const;

export const SERVICES = [
  "implant",
  "zirkonyum",
  "lamina",
  "dis-beyazlatma",
  "kanal-tedavisi",
  "dis-tasi-temizligi",
  "dolgu",
  "kaplama",
  "ortodonti",
] as const;

export type CitySlug = (typeof CITIES)[number];
export type ServiceSlug = (typeof SERVICES)[number];

export const SERVICE_LABELS: Record<string, string> = {
  implant: "İmplant",
  zirkonyum: "Zirkonyum Kaplama",
  lamina: "Lamina (Yaprak Porselen)",
  "dis-beyazlatma": "Diş Beyazlatma",
  "kanal-tedavisi": "Kanal Tedavisi",
  "dis-tasi-temizligi": "Diş Taşı Temizliği",
  dolgu: "Dolgu",
  kaplama: "Kaplama",
  ortodonti: "Ortodonti (Tel Tedavisi)",
};

export const CITY_LABELS: Record<string, string> = {
  istanbul: "İstanbul",
  ankara: "Ankara",
  izmir: "İzmir",
  bursa: "Bursa",
  antalya: "Antalya",
};

export function normalizeSlug(v: string): string {
  return (v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    // Türkçe karakterleri koru (unicode letters/numbers)
    .replace(/[^\p{L}\p{N}\-]+/gu, "");
}

export function titleTR(slug: string): string {
  const s = normalizeSlug(slug).replace(/-/g, " ");
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
    .join(" ");
}

export function cityLabel(citySlug: string): string {
  const s = normalizeSlug(citySlug);
  return CITY_LABELS[s] ?? titleTR(s);
}

export function serviceLabel(serviceSlug: string): string {
  const s = normalizeSlug(serviceSlug);
  return SERVICE_LABELS[s] ?? titleTR(s);
}

export function isKnownCity(citySlug: string): boolean {
  const s = normalizeSlug(citySlug);
  return (CITIES as readonly string[]).includes(s);
}

export function isKnownService(serviceSlug: string): boolean {
  const s = normalizeSlug(serviceSlug);
  return (SERVICES as readonly string[]).includes(s);
}
