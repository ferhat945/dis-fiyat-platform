// src/lib/seo-faq.ts
import { cityLabel, serviceLabel } from "@/lib/seo-data";

export type FaqItem = {
  question: string;
  answer: string;
};

export function cityServiceFaq(
  city: string,
  service: string,
): FaqItem[] {
  const c = cityLabel(city);
  const s = serviceLabel(service);

  return [
    {
      question: `${c} ${s} fiyatları neden klinikten kliniğe değişebilir?`,
      answer:
        `${c} içinde ${s} için verilen teklifler; kullanılan materyal veya yöntem, işlemin kapsamı, muayene bulguları, görüntüleme ihtiyacı ve ek işlem gereksinimine göre değişebilir. Teklifleri karşılaştırırken yalnızca toplam rakama değil, fiyata hangi hizmetlerin dahil olduğuna da bakmak gerekir. Kesin ücret muayene sonrası belirlenir.`,
    },
    {
      question: `${c} içinde ${s} için teklif alırken nelere dikkat etmeliyim?`,
      answer:
        `Klinikten gelen teklifte işlem kapsamının, kullanılacak yöntem veya materyalin, varsa ek işlemlerin ve kontrol sürecinin açıkça belirtilmesine dikkat edebilirsiniz. Aynı fiyat farklı hizmet kapsamlarını içerebileceği için ayrıntıları yazılı olarak karşılaştırmak faydalıdır.`,
    },
    {
      question: `${c} ${s} için klinikler ne kadar sürede dönüş yapar?`,
      answer:
        `DişFiyat360 üzerinden ${c} ve ${s} seçimiyle form gönderildiğinde uygun klinikler yoğunluklarına göre iletişime geçebilir. Dönüş süresi kliniklerin çalışma saatlerine ve mevcut talep yoğunluğuna göre değişebilir.`,
    },
    {
      question: `${c} içinde ${s} için kesin fiyat nasıl belirlenir?`,
      answer:
        `${s} için kesin ücret; klinik muayenesi, gerekli görülürse görüntüleme ve kişiye özel tedavi planı sonrasında netleşir. İnternette yer alan fiyat bilgileri ve DişFiyat360 üzerindeki içerikler ön bilgilendirme amacı taşır.`,
    },
    {
      question: `${c} içinde ${s} için nasıl ücretsiz teklif alabilirim?`,
      answer:
        `${c} ve ${s} seçimiyle teklif formunu doldurabilirsiniz. Form yalnızca gerekli KVKK onayı verildikten sonra gönderilir. Uygun klinikler talebi gördükten sonra sizinle iletişime geçebilir.`,
    },
  ];
}
