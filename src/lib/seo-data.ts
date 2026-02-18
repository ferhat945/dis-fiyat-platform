// src/lib/seo-data.ts

export const CITIES = [
  "adana",
  "adiyaman",
  "afyonkarahisar",
  "agri",
  "amasya",
  "ankara",
  "antalya",
  "artvin",
  "aydin",
  "balikesir",
  "bilecik",
  "bingol",
  "bitlis",
  "bolu",
  "burdur",
  "bursa",
  "canakkale",
  "cankiri",
  "corum",
  "denizli",
  "diyarbakir",
  "edirne",
  "elazig",
  "erzincan",
  "erzurum",
  "eskisehir",
  "gaziantep",
  "giresun",
  "gumushane",
  "hakkari",
  "hatay",
  "isparta",
  "mersin",
  "istanbul",
  "izmir",
  "kars",
  "kastamonu",
  "kayseri",
  "kirklareli",
  "kirsehir",
  "kocaeli",
  "konya",
  "kutahya",
  "malatya",
  "manisa",
  "kahramanmaras",
  "mardin",
  "mugla",
  "mus",
  "nevsehir",
  "nigde",
  "ordu",
  "rize",
  "sakarya",
  "samsun",
  "siirt",
  "sinop",
  "sivas",
  "tekirdag",
  "tokat",
  "trabzon",
  "tunceli",
  "sanliurfa",
  "usak",
  "van",
  "yozgat",
  "zonguldak",
  "aksaray",
  "bayburt",
  "karaman",
  "kirikkale",
  "batman",
  "sirnak",
  "bartin",
  "ardahan",
  "igdir",
  "yalova",
  "karabuk",
  "kilis",
  "osmaniye",
  "duzce",
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
  ortodonti: "Ortodonti / Şeffaf Plak",
};

export const CITY_LABELS: Record<string, string> = {
  adana: "Adana",
  adiyaman: "Adıyaman",
  afyonkarahisar: "Afyonkarahisar",
  agri: "Ağrı",
  amasya: "Amasya",
  ankara: "Ankara",
  antalya: "Antalya",
  artvin: "Artvin",
  aydin: "Aydın",
  balikesir: "Balıkesir",
  bilecik: "Bilecik",
  bingol: "Bingöl",
  bitlis: "Bitlis",
  bolu: "Bolu",
  burdur: "Burdur",
  bursa: "Bursa",
  canakkale: "Çanakkale",
  cankiri: "Çankırı",
  corum: "Çorum",
  denizli: "Denizli",
  diyarbakir: "Diyarbakır",
  edirne: "Edirne",
  elazig: "Elazığ",
  erzincan: "Erzincan",
  erzurum: "Erzurum",
  eskisehir: "Eskişehir",
  gaziantep: "Gaziantep",
  giresun: "Giresun",
  gumushane: "Gümüşhane",
  hakkari: "Hakkâri",
  hatay: "Hatay",
  isparta: "Isparta",
  mersin: "Mersin",
  istanbul: "İstanbul",
  izmir: "İzmir",
  kars: "Kars",
  kastamonu: "Kastamonu",
  kayseri: "Kayseri",
  kirklareli: "Kırklareli",
  kirsehir: "Kırşehir",
  kocaeli: "Kocaeli",
  konya: "Konya",
  kutahya: "Kütahya",
  malatya: "Malatya",
  manisa: "Manisa",
  kahramanmaras: "Kahramanmaraş",
  mardin: "Mardin",
  mugla: "Muğla",
  mus: "Muş",
  nevsehir: "Nevşehir",
  nigde: "Niğde",
  ordu: "Ordu",
  rize: "Rize",
  sakarya: "Sakarya",
  samsun: "Samsun",
  siirt: "Siirt",
  sinop: "Sinop",
  sivas: "Sivas",
  tekirdag: "Tekirdağ",
  tokat: "Tokat",
  trabzon: "Trabzon",
  tunceli: "Tunceli",
  sanliurfa: "Şanlıurfa",
  usak: "Uşak",
  van: "Van",
  yozgat: "Yozgat",
  zonguldak: "Zonguldak",
  aksaray: "Aksaray",
  bayburt: "Bayburt",
  karaman: "Karaman",
  kirikkale: "Kırıkkale",
  batman: "Batman",
  sirnak: "Şırnak",
  bartin: "Bartın",
  ardahan: "Ardahan",
  igdir: "Iğdır",
  yalova: "Yalova",
  karabuk: "Karabük",
  kilis: "Kilis",
  osmaniye: "Osmaniye",
  duzce: "Düzce",
};

// ✅ TR karakterleri ASCII slug’a çevir (kritik)
function latinizeTR(input: string): string {
  return (input ?? "")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "c");
}

export function normalizeSlug(v: string): string {
  const raw = (v ?? "").trim();

  // 1) boşlukları önce dash yap (şehir adı gibi girişlerde)
  const dashed = raw.replace(/\s+/g, "-");

  // 2) TR harfleri ASCII'ye çevir
  const ascii = latinizeTR(dashed);

  // 3) sadece [a-z0-9-] kalsın
  return ascii.replace(/[^a-z0-9-]/g, "");
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
