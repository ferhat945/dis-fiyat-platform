import { normalizeSlug, serviceLabel } from "@/lib/seo-data";

export type CityServiceSeoContent = {
  researchIntro: string;
  clinicQuestionsText: string;
  offerComparisonText: string;
};

type ServiceGuide = {
  researchFocus: string;
  clinicFocus: string;
  offerFocus: string;
};

const SERVICE_GUIDES: Record<string, ServiceGuide> = {
  implant: {
    researchFocus:
      "implant markası, üst yapı seçeneği, görüntüleme ihtiyacı ve tedavinin kaç aşamada tamamlanacağı",
    clinicFocus:
      "kullanılacak implant markasını, üst yapı seçeneğini, kemik desteği veya ek işlem gerekirse ücretin nasıl değişeceğini ve kontrol randevularının kapsama dahil olup olmadığını",
    offerFocus:
      "implant markası, üst yapı, olası ek cerrahi işlemler ve toplam tedavi kapsamı",
  },
  zirkonyum: {
    researchFocus:
      "uygulanacak diş sayısı, materyal, laboratuvar süreci, renk seçimi ve prova aşamaları",
    clinicFocus:
      "kaç dişe uygulama planlandığını, materyal ve laboratuvar sürecini, prova ile renk seçiminin nasıl ilerlediğini ve ek hazırlık gerekirse ücretin nasıl değişeceğini",
    offerFocus:
      "diş sayısı, materyal, laboratuvar süreci ve estetik planlama kapsamı",
  },
  lamina: {
    researchFocus:
      "uygulanacak diş sayısı, hazırlık ihtiyacı, ölçü, prova ve laboratuvar aşamaları",
    clinicFocus:
      "kaç diş için lamina planlandığını, dişlerde hazırlık gerekip gerekmediğini, prova sürecini ve laboratuvar hizmetlerinin teklife dahil olup olmadığını",
    offerFocus:
      "diş sayısı, hazırlık ihtiyacı, prova ve laboratuvar süreci",
  },
  "dis-beyazlatma": {
    researchFocus:
      "kullanılacak beyazlatma yöntemi, seans sayısı, işlem öncesi temizlik ihtiyacı ve takip planı",
    clinicFocus:
      "hangi beyazlatma yönteminin uygulanacağını, kaç seans planlandığını, öncesinde temizlik gerekip gerekmediğini ve hassasiyet durumunda nasıl bir takip yapılacağını",
    offerFocus:
      "beyazlatma yöntemi, seans sayısı, ek temizlik ihtiyacı ve takip kapsamı",
  },
  "kanal-tedavisi": {
    researchFocus:
      "tedavi edilecek dişin konumu, kanal sayısı, görüntüleme ihtiyacı, seans planı ve işlem sonrası restorasyon gereksinimi",
    clinicFocus:
      "tahmini seans sayısını, görüntüleme veya ek işlemlerin ücrete dahil olup olmadığını ve sonrasında dolgu ya da kaplama gerekip gerekmediğini",
    offerFocus:
      "dişin konumu, kanal sayısı, seans planı ve işlem sonrası restorasyon ihtiyacı",
  },
  "dis-tasi-temizligi": {
    researchFocus:
      "temizliğin kapsamı, parlatma işlemi, diş eti bakım ihtiyacı ve kontrol planı",
    clinicFocus:
      "parlatmanın fiyata dahil olup olmadığını, diş eti için ek bakım gerekip gerekmediğini, işlemin kaç seansta tamamlanacağını ve kontrol önerilerini",
    offerFocus:
      "temizlik kapsamı, parlatma, diş eti bakım ihtiyacı ve seans planı",
  },
  dolgu: {
    researchFocus:
      "dolgu yapılacak diş ve yüzey sayısı, kullanılacak materyal ve ek tedavi ihtiyacı",
    clinicFocus:
      "hangi dolgu materyalinin kullanılacağını, kaç yüzeye işlem yapılacağını, ek tedavi gerekirse ücretin nasıl değişeceğini ve kontrol gerekip gerekmediğini",
    offerFocus:
      "yüzey sayısı, dolgu materyali, mevcut madde kaybı ve ek işlem ihtiyacı",
  },
  kaplama: {
    researchFocus:
      "kaplama türü, uygulanacak diş sayısı, laboratuvar ve prova süreci ile olası ek hazırlık işlemleri",
    clinicFocus:
      "hangi kaplama türünün planlandığını, kaç dişe uygulama yapılacağını, ölçü ve prova aşamalarının fiyata dahil olup olmadığını ve ek hazırlık gerekirse ücretin nasıl değişeceğini",
    offerFocus:
      "kaplama türü, diş sayısı, laboratuvar süreci ve ek hazırlık ihtiyacı",
  },
  ortodonti: {
    researchFocus:
      "şeffaf plak veya tel seçeneği, tahmini tedavi süresi, kontrol sıklığı ve tedavi sonrası pekiştirme planı",
    clinicFocus:
      "hangi yöntemin değerlendirildiğini, tahmini tedavi süresini, kontrol randevularının ücrete dahil olup olmadığını ve pekiştirme sürecinin kapsamını",
    offerFocus:
      "tedavi yöntemi, tahmini süre, kontrol planı ve tedavi sonrası pekiştirme kapsamı",
  },
};

const FALLBACK_GUIDE: ServiceGuide = SERVICE_GUIDES.implant ?? {
  researchFocus: "tedavi kapsamı, kullanılan yöntem ve takip planı",
  clinicFocus: "tedavi kapsamını, kullanılan yöntemi ve takip planını",
  offerFocus: "tedavi kapsamı ve takip planı",
};

const RESEARCH_VARIANTS = [
  (city: string, service: string, focus: string) =>
    `${city} içinde ${service} araştırırken yalnızca toplam ücrete bakmak yerine ${focus} gibi ayrıntıları da değerlendirmek faydalıdır. Kliniklerden gelen tekliflerin aynı kapsamı içerip içermediğini kontrol etmek, fiyat farklarının nedenini daha iyi anlamaya yardımcı olur.`,
  (city: string, service: string, focus: string) =>
    `${city} için ${service} seçeneklerini karşılaştırırken kliniklerin sunduğu kapsam birbirinden farklı olabilir. Özellikle ${focus} başlıklarını netleştirmek, teklifleri aynı ölçütlerle değerlendirmenizi kolaylaştırır. Kesin planlama muayene sonrasında yapılır.`,
  (city: string, service: string, focus: string) =>
    `${city} bölgesinde ${service} için teklif toplarken fiyatın hangi hizmetleri kapsadığını ayrıca incelemek önemlidir. ${focus} gibi noktalar toplam maliyeti ve süreci etkileyebilir. Bu nedenle yalnızca en düşük rakama göre değil, teklif içeriğine göre de karşılaştırma yapılmalıdır.`,
];

const OFFER_VARIANTS = [
  (city: string, service: string, focus: string) =>
    `${city} için gelen ${service} tekliflerini değerlendirirken ${focus} başlıklarını yan yana kontrol edin. Aynı toplam fiyatla sunulan iki teklif farklı hizmetleri kapsayabilir; bu nedenle teklif içeriğinin açık ve anlaşılır olması önemlidir.`,
  (city: string, service: string, focus: string) =>
    `${service} için ${city} içindeki kliniklerden teklif aldığınızda ${focus} açısından karşılaştırma yapabilirsiniz. Ek işlemler, kontroller veya farklı materyal seçenekleri varsa bunların toplam ücrete dahil olup olmadığını klinikten netleştirin.`,
  (city: string, service: string, focus: string) =>
    `${city} ${service} teklifleri arasında karar verirken ${focus} gibi kalemleri tek tek incelemek daha sağlıklı bir karşılaştırma sağlar. Teklifte belirsiz kalan bir bölüm varsa randevu öncesinde klinikten açıklama istemek faydalıdır.`,
];

function stableIndex(value: string, length: number): number {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return length > 0 ? hash % length : 0;
}

export function getCityServiceSeoContent(
  cityName: string,
  citySlug: string,
  serviceSlug: string,
): CityServiceSeoContent {
  const safeServiceSlug = normalizeSlug(serviceSlug);
  const serviceName = serviceLabel(safeServiceSlug);
  const guide = SERVICE_GUIDES[safeServiceSlug] ?? FALLBACK_GUIDE;
  const seed = `${normalizeSlug(citySlug)}:${safeServiceSlug}`;

  const researchBuilder =
    RESEARCH_VARIANTS[stableIndex(seed, RESEARCH_VARIANTS.length)] ??
    RESEARCH_VARIANTS[0];

  const offerBuilder =
    OFFER_VARIANTS[stableIndex(`${seed}:offer`, OFFER_VARIANTS.length)] ??
    OFFER_VARIANTS[0];

  return {
    researchIntro: researchBuilder(
      cityName,
      serviceName,
      guide.researchFocus,
    ),
    clinicQuestionsText:
      `${cityName} içinde ${serviceName} için bir klinikle görüşürken ${guide.clinicFocus} sorabilirsiniz. Bu bilgiler, teklifin kapsamını anlamanızı ve farklı kliniklerin sunduğu seçenekleri daha tutarlı biçimde karşılaştırmanızı kolaylaştırır.`,
    offerComparisonText: offerBuilder(
      cityName,
      serviceName,
      guide.offerFocus,
    ),
  };
}
