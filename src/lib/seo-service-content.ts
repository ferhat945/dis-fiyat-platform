import { normalizeSlug, serviceLabel } from "@/lib/seo-data";

export type ServiceSeoContent = {
  intro: string;
  whatIs: string;
  howItWorks: string;
  suitableFor: string;
  priceFactors: string[];
  faqs: { question: string; answer: string }[];
};

const CONTENT: Record<
  string,
  Omit<ServiceSeoContent, "intro"> & { introTemplate: string }
> = {
  implant: {
    introTemplate:
      "{city} içinde {service} araştıran kişiler genellikle işlem süresi, kalıcılık, estetik görünüm ve fiyat farklarını merak eder. Tedavi planı kişiye göre değiştiği için kesin ücret muayene sonrası netleşir.",
    whatIs:
      "İmplant, eksik dişlerin yerine yerleştirilen yapay diş kökü çözümüdür. Doğal görünüme yakın sonuç vermesi ve uzun ömürlü kullanım sunabilmesi nedeniyle sık tercih edilir.",
    howItWorks:
      "Tedavi genellikle muayene, görüntüleme, planlama, implant yerleştirme ve üst yapı aşamalarından oluşur. Bazı vakalarda kemik durumuna göre ek işlemler gerekebilir.",
    suitableFor:
      "Eksik dişi bulunan ve genel ağız yapısı uygun olan kişiler için değerlendirilebilir. Kesin uygunluk klinik muayene ve gerekiyorsa görüntüleme sonrası belirlenir.",
    priceFactors: [
      "Kullanılan implant markası",
      "Kemik yapısı ve ek cerrahi ihtiyacı",
      "Tek diş veya çoklu uygulama planı",
      "Üst yapı ve protez tercihi",
    ],
    faqs: [
      {
        question: "İmplant tedavisi acıtır mı?",
        answer:
          "İşlem sırasında lokal anestezi uygulandığı için ağrı hissi genellikle minimum seviyededir. Sonrasında kısa süreli hassasiyet olabilir.",
      },
      {
        question: "İmplant tedavisi ne kadar sürer?",
        answer:
          "Süre; kemik yapısı, planlama ve ek işlem ihtiyacına göre değişebilir. Bazı durumlarda süreç birkaç aşamada tamamlanır.",
      },
      {
        question: "İmplant fiyatı neden değişir?",
        answer:
          "Marka, kemik desteği ihtiyacı, uygulanacak diş sayısı ve protez planı fiyat üzerinde etkili olabilir.",
      },
    ],
  },

  zirkonyum: {
    introTemplate:
      "{city} içinde {service} düşünen kişiler çoğunlukla estetik görünüm, renk uyumu ve dayanıklılığı araştırır. Uygulama kapsamı arttıkça fiyat planı da değişebilir.",
    whatIs:
      "Zirkonyum kaplama, estetik ve dayanıklılığı bir arada sunan kaplama çözümlerinden biridir. Özellikle doğal diş görünümüne yakın sonuç hedefleyen kişilerde öne çıkar.",
    howItWorks:
      "Muayene sonrası dişlerin durumu değerlendirilir, gerekli hazırlık yapılır, ölçü alınır ve laboratuvar sürecinden sonra kaplamalar uygulanır.",
    suitableFor:
      "Renk, form veya estetik iyileştirme ihtiyacı olan kişiler için değerlendirilebilir. Hangi dişlere uygulanacağı muayene sonrası netleşir.",
    priceFactors: [
      "Kaplama yapılacak diş sayısı",
      "Malzeme ve laboratuvar kalitesi",
      "Ek hazırlık işlemleri",
      "Estetik beklenti seviyesi",
    ],
    faqs: [
      {
        question: "Zirkonyum kaplama doğal görünür mü?",
        answer:
          "Doğru planlama ile doğal diş görünümüne oldukça yakın estetik sonuçlar verebilir.",
      },
      {
        question: "Zirkonyum kaç seansta tamamlanır?",
        answer:
          "Tedavi planına göre değişmekle birlikte genellikle birkaç randevuda tamamlanabilir.",
      },
      {
        question: "Zirkonyum fiyatları neden farklıdır?",
        answer:
          "Diş sayısı, malzeme kalitesi ve laboratuvar süreci ücretlendirmeyi etkileyebilir.",
      },
    ],
  },

  lamina: {
    introTemplate:
      "{city} içinde {service} işlemi özellikle ön diş estetiğini iyileştirmek isteyen kişiler tarafından araştırılır. Fiyatlar; uygulanacak diş sayısı ve hazırlık ihtiyacına göre değişebilir.",
    whatIs:
      "Lamina, dişlerin ön yüzeyine uygulanan ince yaprak porselenlerle estetik görünümü iyileştirmeyi amaçlayan bir tedavidir.",
    howItWorks:
      "Muayene sonrası planlama yapılır, gerekli hazırlık uygulanır, ölçü alınır ve laboratuvar süreci sonrasında laminalar prova edilerek yerleştirilir.",
    suitableFor:
      "Ön diş görünümünde renk, şekil veya form düzenlemesi isteyen kişiler için değerlendirilebilir.",
    priceFactors: [
      "Uygulanacak diş sayısı",
      "Hazırlık gereksinimi",
      "Malzeme kalitesi",
      "Estetik planlama düzeyi",
    ],
    faqs: [
      {
        question: "Lamina estetik için uygun mudur?",
        answer:
          "Özellikle ön diş estetiğinde doğal ve düzenli görünüm isteyen hastalarda sık tercih edilir.",
      },
      {
        question: "Lamina dişe zarar verir mi?",
        answer:
          "Uygun vaka seçimi ve doğru planlama ile kontrollü şekilde uygulanır. Kesin yaklaşım muayene sırasında belirlenir.",
      },
      {
        question: "Lamina fiyatı neden değişir?",
        answer:
          "Diş sayısı, laboratuvar kalitesi ve kişiye özel estetik planlama fiyatı etkileyebilir.",
      },
    ],
  },

  "dis-beyazlatma": {
    introTemplate:
      "{city} içinde {service} işlemi daha beyaz ve temiz bir gülüş isteyen kişiler tarafından sık araştırılır. Fiyatlar kullanılacak yönteme ve seans ihtiyacına göre değişebilir.",
    whatIs:
      "Diş beyazlatma, diş rengini birkaç ton açmayı hedefleyen estetik uygulamalardan biridir.",
    howItWorks:
      "Muayene sonrası uygun beyazlatma yöntemi belirlenir. Klinik tipi, ev tipi destek veya kombine planlama uygulanabilir.",
    suitableFor:
      "Diş renginden memnun olmayan ve muayene sonrası uygun bulunan kişiler için değerlendirilebilir.",
    priceFactors: [
      "Uygulanacak beyazlatma yöntemi",
      "Seans ihtiyacı",
      "Renklenme seviyesi",
      "Ek temizlik gereksinimi",
    ],
    faqs: [
      {
        question: "Diş beyazlatma kalıcı mı?",
        answer:
          "Kalıcılık ağız bakımına ve beslenme alışkanlıklarına göre değişebilir. Zaman içinde tekrar uygulama gerekebilir.",
      },
      {
        question: "Diş beyazlatma hassasiyet yapar mı?",
        answer:
          "Bazı kişilerde geçici hassasiyet olabilir. Uygun planlama ile bu durum genellikle yönetilebilir.",
      },
      {
        question: "Diş beyazlatma fiyatı neden değişir?",
        answer:
          "Kullanılan yöntem, seans sayısı ve mevcut renklenme düzeyi fiyatı etkileyebilir.",
      },
    ],
  },

  "kanal-tedavisi": {
    introTemplate:
      "{city} içinde {service} araştırılırken ağrı, seans sayısı ve dişin durumu en çok merak edilen başlıklar arasında yer alır. Kesin ücret dişin yapısına göre değişebilir.",
    whatIs:
      "Kanal tedavisi, dişin iç kısmındaki sorunlu dokunun temizlenip uygun şekilde doldurulmasını amaçlayan koruyucu tedavilerdendir.",
    howItWorks:
      "Muayene ve gerekirse görüntüleme sonrası kanal temizliği, şekillendirme ve dolum aşamaları uygulanır.",
    suitableFor:
      "İleri çürük, enfeksiyon veya sinir dokusunun etkilendiği durumlarda hekim değerlendirmesiyle planlanabilir.",
    priceFactors: [
      "Tedavi yapılacak dişin konumu",
      "Kanal sayısı",
      "Enfeksiyon seviyesi",
      "Tekrar kanal tedavisi ihtiyacı",
    ],
    faqs: [
      {
        question: "Kanal tedavisi ağrılı mıdır?",
        answer:
          "Lokal anestezi ile işlem sırasında ağrı hissi genellikle azaltılır. Sonrasında kısa süreli hassasiyet olabilir.",
      },
      {
        question: "Kanal tedavisi kaç seansta biter?",
        answer:
          "Dişin durumuna göre tek seansta ya da birkaç seansta tamamlanabilir.",
      },
      {
        question: "Kanal tedavisi fiyatı neden değişir?",
        answer:
          "Kanal sayısı, dişin konumu ve mevcut hasar seviyesi fiyat üzerinde etkili olabilir.",
      },
    ],
  },

  "dis-tasi-temizligi": {
    introTemplate:
      "{city} içinde {service} işlemi düzenli ağız bakımı yaptırmak isteyen kişiler tarafından sık tercih edilir. İşlem kapsamına göre ücret farklılaşabilir.",
    whatIs:
      "Diş taşı temizliği, diş yüzeyinde biriken sertleşmiş plak ve taşların temizlenmesine yönelik koruyucu bakım uygulamasıdır.",
    howItWorks:
      "Muayene sonrası uygun cihazlarla diş yüzeyi temizlenir. Gerekirse parlatma ve ek bakım adımları uygulanabilir.",
    suitableFor:
      "Diş taşı, plak birikimi veya diş eti bakım ihtiyacı olan kişiler için değerlendirilebilir.",
    priceFactors: [
      "Birikim yoğunluğu",
      "Ek parlatma ihtiyacı",
      "Diş eti durumu",
      "Ek bakım gereksinimi",
    ],
    faqs: [
      {
        question: "Diş taşı temizliği zararlı mı?",
        answer:
          "Uygun şekilde uygulandığında ağız bakımının bir parçası olarak değerlendirilir.",
      },
      {
        question: "Diş taşı temizliği ne kadar sürer?",
        answer:
          "İşlem süresi birikim seviyesine göre değişse de genellikle kısa sürede tamamlanabilir.",
      },
      {
        question: "Diş taşı temizliği fiyatı neden değişir?",
        answer:
          "Birikim yoğunluğu ve ek bakım ihtiyacı fiyat farkı oluşturabilir.",
      },
    ],
  },

  dolgu: {
    introTemplate:
      "{city} içinde {service} fiyatları araştırılırken dolgunun boyutu, uygulanacak alan ve kullanılacak materyal öne çıkar. Kesin planlama muayene sonrası netleşir.",
    whatIs:
      "Dolgu tedavisi, çürük veya madde kaybı bulunan dişin uygun materyalle yeniden şekillendirilmesini amaçlar.",
    howItWorks:
      "Sorunlu doku temizlenir, bölge hazırlanır ve uygun dolgu materyali ile dişin formu yeniden oluşturulur.",
    suitableFor:
      "Çürük, kırık veya küçük madde kaybı olan dişlerde hekim değerlendirmesiyle planlanabilir.",
    priceFactors: [
      "Dolgu yapılacak yüzey sayısı",
      "Kullanılan materyal",
      "Dişin konumu",
      "Ek çürük temizliği gereksinimi",
    ],
    faqs: [
      {
        question: "Dolgu işlemi ne kadar sürer?",
        answer:
          "İşlem süresi çürüğün boyutuna ve dolgu yapılacak alana göre değişebilir.",
      },
      {
        question: "Dolgu sonrası hassasiyet olur mu?",
        answer:
          "Bazı hastalarda kısa süreli hassasiyet görülebilir. Bu durum çoğu zaman geçicidir.",
      },
      {
        question: "Dolgu fiyatı neden değişir?",
        answer:
          "Dişin durumu, yüzey sayısı ve kullanılacak materyal fiyatı etkileyebilir.",
      },
    ],
  },

  kaplama: {
    introTemplate:
      "{city} içinde {service} fiyatları incelenirken kaplama türü, diş sayısı ve estetik beklenti belirleyici olur. Kesin fiyat planlaması muayene sonrası netleşir.",
    whatIs:
      "Kaplama, hasarlı veya estetik olarak iyileştirilmek istenen dişin dış yüzeyini özel materyallerle kaplama işlemidir.",
    howItWorks:
      "Muayene sonrası dişler hazırlanır, ölçü alınır ve laboratuvarda üretilen kaplamalar prova edilerek uygulanır.",
    suitableFor:
      "Aşınmış, kırılmış veya estetik düzenleme ihtiyacı olan dişlerde değerlendirilebilir.",
    priceFactors: [
      "Kaplama türü",
      "Diş sayısı",
      "Laboratuvar süreci",
      "Ek hazırlık ihtiyacı",
    ],
    faqs: [
      {
        question: "Kaplama doğal görünür mü?",
        answer:
          "Doğru materyal ve planlama ile doğal dişe yakın estetik sonuçlar elde edilebilir.",
      },
      {
        question: "Kaplama kaç randevuda tamamlanır?",
        answer:
          "Tedavi planına göre değişmekle birlikte genellikle birkaç randevu gerekir.",
      },
      {
        question: "Kaplama fiyatı neden değişir?",
        answer:
          "Kaplama türü, diş sayısı ve laboratuvar kalitesi fiyatı etkileyebilir.",
      },
    ],
  },

  ortodonti: {
    introTemplate:
      "{city} içinde {service} araştıran kişiler tedavi süresi, plak veya tel seçimi ve ücretlendirme detaylarını merak eder. Planlama kişisel muayeneye göre şekillenir.",
    whatIs:
      "Ortodonti tedavisi, diş ve çene kapanışındaki düzensizlikleri düzeltmeyi amaçlayan tedavi grubudur. Şeffaf plak veya farklı yöntemlerle planlanabilir.",
    howItWorks:
      "Muayene ve ölçüm sonrası diş dizilimi değerlendirilir, uygun tedavi yöntemi belirlenir ve düzenli kontrollerle süreç yönetilir.",
    suitableFor:
      "Diş dizilim bozukluğu, çapraşıklık veya kapanış problemi yaşayan kişiler için değerlendirilebilir.",
    priceFactors: [
      "Şeffaf plak veya tel tercihi",
      "Vakanın zorluk seviyesi",
      "Tedavi süresi",
      "Kontrol sıklığı",
    ],
    faqs: [
      {
        question: "Ortodonti tedavisi ne kadar sürer?",
        answer:
          "Tedavi süresi vakaya göre değişebilir ve çoğu zaman düzenli takip gerektirir.",
      },
      {
        question: "Şeffaf plak herkes için uygun mu?",
        answer:
          "Uygunluk kişinin diş yapısı ve tedavi ihtiyacına göre muayene sonrası değerlendirilir.",
      },
      {
        question: "Ortodonti fiyatı neden değişir?",
        answer:
          "Vakanın zorluk düzeyi, tedavi yöntemi ve toplam takip süresi fiyatı etkileyebilir.",
      },
    ],
  },
};

const FALLBACK = CONTENT.implant;

export function getServiceSeoContent(
  cityName: string,
  serviceSlug: string
): ServiceSeoContent {
  const safeSlug = normalizeSlug(serviceSlug);
  const item = CONTENT[safeSlug] ?? FALLBACK;
  const serviceName = serviceLabel(safeSlug);

  return {
    intro: item.introTemplate
      .replaceAll("{city}", cityName)
      .replaceAll("{service}", serviceName),
    whatIs: item.whatIs,
    howItWorks: item.howItWorks,
    suitableFor: item.suitableFor,
    priceFactors: item.priceFactors,
    faqs: item.faqs,
  };
}