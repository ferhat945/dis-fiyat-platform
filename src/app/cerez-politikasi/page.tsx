import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çerez Politikası | DişFiyat360",
  description:
    "DişFiyat360 internet sitesinde kullanılan çerezler, çerez türleri, kullanım amaçları ve çerez tercihlerinin yönetilmesine ilişkin bilgilendirme.",
  alternates: {
    canonical: "/cerez-politikasi",
  },
};

type CookiePolicyBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type CookieType = {
  name: string;
  purpose: string;
  duration: string;
  legalBasis: string;
};

const COOKIE_TYPES: CookieType[] = [
  {
    name: "Zorunlu çerezler",
    purpose:
      "İnternet sitesinin temel işlevlerinin çalışması, güvenliğin sağlanması, oturumların yönetilmesi, form işlemlerinin tamamlanması ve kullanıcı tercihlerinin hatırlanması amacıyla kullanılabilir.",
    duration: "Oturum süresince veya teknik gereklilik kadar",
    legalBasis:
      "Hizmetin sunulması ve internet sitesinin güvenli şekilde çalıştırılması",
  },
  {
    name: "Oturum ve kimlik doğrulama çerezleri",
    purpose:
      "Kliniklerin hesaplarına güvenli şekilde giriş yapması, oturumun korunması ve yetkisiz erişimin önlenmesi amacıyla kullanılabilir.",
    duration: "Oturum süresince veya oturum güvenliği için gerekli süre kadar",
    legalBasis:
      "Sözleşmenin kurulması veya ifası ve güvenliğin sağlanması",
  },
  {
    name: "Tercih çerezleri",
    purpose:
      "Dil, görünüm, kullanıcı tercihi veya daha önce gerçekleştirilen seçimlerin hatırlanması amacıyla kullanılabilir.",
    duration: "Çerezin niteliğine göre oturumluk veya belirli süreli",
    legalBasis:
      "Kullanıcının talep ettiği işlevin sağlanması veya gerekli hâllerde kullanıcı tercihi",
  },
  {
    name: "Performans ve analiz çerezleri",
    purpose:
      "İnternet sitesinin kullanımının ölçülmesi, ziyaretçi hareketlerinin toplu şekilde değerlendirilmesi, hataların tespit edilmesi ve hizmet kalitesinin geliştirilmesi amacıyla kullanılabilir.",
    duration: "Kullanılan hizmete ve çereze göre değişebilir",
    legalBasis:
      "Gerekli olduğu durumlarda kullanıcının açık tercihi veya onayı",
  },
  {
    name: "Reklam ve pazarlama çerezleri",
    purpose:
      "Kullanıcıların ilgi alanlarına göre reklam gösterilmesi, reklam performansının ölçülmesi ve pazarlama faaliyetlerinin yürütülmesi amacıyla kullanılabilir.",
    duration: "Kullanılan hizmete ve çereze göre değişebilir",
    legalBasis:
      "Kullanıcının açık tercihi veya onayı",
  },
];

const POLICY_BLOCKS: CookiePolicyBlock[] = [
  {
    title: "1) Politikanın Amacı ve Kapsamı",
    paragraphs: [
      "Bu Çerez Politikası, DişFiyat360 internet sitesini ziyaret eden kullanıcıları çerezler ve benzeri teknolojiler hakkında bilgilendirmek amacıyla hazırlanmıştır.",
      "Politika; www.disfiyat360.com alan adı, bu alan adına bağlı sayfalar, teklif formları, klinik giriş ekranları, klinik paneli ve platform üzerinden sunulan diğer dijital hizmetlerde kullanılabilecek çerezleri kapsar.",
      "Bu politika, Gizlilik Politikası ve KVKK Aydınlatma Metni ile birlikte değerlendirilmelidir.",
    ],
  },
  {
    title: "2) Veri Sorumlusu",
    paragraphs: [
      "DişFiyat360 internet sitesi üzerinden çerezler aracılığıyla gerçekleştirilebilecek kişisel veri işleme faaliyetleri bakımından veri sorumlusu Ferhat Menekşe'dir.",
    ],
    items: [
      "İşletme sahibi: Ferhat Menekşe",
      "Vergi dairesi: 5 Ocak Vergi Dairesi",
      "Vergi numarası: 6150625779",
      "Adres: Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana",
      "Telefon: 0531 917 17 39",
      "E-posta: ferhatmenekse945@gmail.com",
      "İnternet adresi: www.disfiyat360.com",
    ],
  },
  {
    title: "3) Çerez Nedir?",
    paragraphs: [
      "Çerezler, bir internet sitesi ziyaret edildiğinde tarayıcı veya cihaz üzerinde saklanabilen küçük metin dosyalarıdır.",
      "Çerezler sayesinde internet sitesinin temel işlevleri çalıştırılabilir, güvenli oturum sağlanabilir, kullanıcı tercihleri hatırlanabilir ve internet sitesinin kullanımı hakkında teknik bilgiler elde edilebilir.",
      "Çerezlerin yanında yerel depolama, oturum depolama, piksel, etiket ve benzeri teknolojiler de kullanılabilir. Bu politikada kullanılan çerez ifadesi, uygun olduğu ölçüde bu tür benzeri teknolojileri de kapsar.",
    ],
  },
  {
    title: "4) Çerezler Hangi Yöntemle Toplanır?",
    paragraphs: [
      "Çerezler, internet sitesinin ziyaret edilmesi, sayfalar arasında gezinilmesi, form doldurulması, kullanıcı hesabına giriş yapılması veya platform özelliklerinin kullanılması sırasında elektronik ve otomatik yöntemlerle oluşturulabilir.",
      "Bazı çerezler doğrudan DişFiyat360 tarafından yerleştirilebilir. Bazı çerezler ise kullanılan teknik altyapı, güvenlik, analiz, ödeme veya diğer üçüncü taraf hizmet sağlayıcıları tarafından yerleştirilebilir.",
    ],
  },
  {
    title: "5) Çerezlerin Kullanım Amaçları",
    items: [
      "İnternet sitesinin temel işlevlerinin çalışmasını sağlamak",
      "Klinik hesaplarına giriş ve oturum işlemlerini yürütmek",
      "Kullanıcı kimlik doğrulama işlemlerini gerçekleştirmek",
      "Form gönderimlerinin güvenli ve düzenli şekilde tamamlanmasını sağlamak",
      "Spam, bot, sahte talep ve kötüye kullanım girişimlerini önlemek",
      "İnternet sitesinin ve kullanıcı hesaplarının güvenliğini sağlamak",
      "Kullanıcı tercihlerini ve önceki seçimlerini hatırlamak",
      "Teknik hata ve performans sorunlarını tespit etmek",
      "İnternet sitesinin kullanımını ve performansını ölçmek",
      "Hizmetlerin ve kullanıcı deneyiminin geliştirilmesini sağlamak",
      "Gerekli onayların alınması hâlinde analiz, reklam veya pazarlama faaliyetleri yürütmek",
      "Yasal yükümlülüklerin yerine getirilmesini sağlamak",
      "Hukuki hakların tesisi, kullanılması veya korunmasını sağlamak",
    ],
  },
  {
    title: "6) Birinci Taraf ve Üçüncü Taraf Çerezler",
    paragraphs: [
      "Birinci taraf çerezler, ziyaret edilen internet sitesi tarafından doğrudan yerleştirilen çerezlerdir. DişFiyat360 tarafından oturum, güvenlik, form işlemleri veya kullanıcı tercihleri amacıyla kullanılan çerezler bu kapsama girebilir.",
      "Üçüncü taraf çerezler ise barındırma, güvenlik, analiz, ödeme, reklam, video, harita veya benzeri hizmetleri sunan üçüncü taraflar tarafından yerleştirilebilen çerezlerdir.",
      "Üçüncü taraf hizmetlerin kullanılması hâlinde bu hizmet sağlayıcılarının kendi gizlilik ve çerez politikaları da geçerli olabilir.",
    ],
  },
  {
    title: "7) Zorunlu Çerezler",
    paragraphs: [
      "Zorunlu çerezler, internet sitesinin güvenli ve düzgün şekilde çalışması için gerekli olan çerezlerdir.",
      "Bu çerezlerin engellenmesi hâlinde giriş yapma, oturumu koruma, form gönderme, güvenlik kontrolü veya diğer temel site özellikleri düzgün çalışmayabilir.",
      "Zorunlu çerezler reklam veya kullanıcı profili oluşturma amacıyla kullanılmaz.",
    ],
    items: [
      "Oturum güvenliğinin sağlanması",
      "Kullanıcı giriş bilgilerinin doğrulanması",
      "Klinik paneli oturumunun korunması",
      "Güvenlik ve kötüye kullanım kontrollerinin yürütülmesi",
      "Formların ve site özelliklerinin çalıştırılması",
      "Çerez tercihlerinin hatırlanması",
    ],
  },
  {
    title: "8) Performans ve Analiz Çerezleri",
    paragraphs: [
      "Performans ve analiz çerezleri, ziyaretçilerin internet sitesini nasıl kullandığı hakkında toplu veya teknik bilgiler elde edilmesini sağlayabilir.",
      "Bu çerezler aracılığıyla ziyaret edilen sayfalar, sayfada geçirilen süre, bağlantı kaynağı, cihaz veya tarayıcı türü ve teknik hata bilgileri ölçülebilir.",
      "Zorunlu olmayan performans ve analiz çerezleri kullanılması hâlinde kullanıcı tercihleri dikkate alınır.",
      "DişFiyat360 üzerinde analiz hizmeti kullanılmıyorsa bu çerezler cihazınıza yerleştirilmez.",
    ],
  },
  {
    title: "9) Reklam ve Pazarlama Çerezleri",
    paragraphs: [
      "Reklam ve pazarlama çerezleri, reklamların ölçülmesi, kullanıcılara daha ilgili içeriklerin gösterilmesi veya pazarlama kampanyalarının performansının değerlendirilmesi amacıyla kullanılabilir.",
      "DişFiyat360 üzerinde reklam veya yeniden hedefleme hizmeti kullanılmıyorsa bu tür çerezler cihazınıza yerleştirilmez.",
      "Bu tür çerezlerin kullanılması hâlinde, gerekli durumlarda kullanıcıdan ayrıca tercih veya onay alınır.",
    ],
  },
  {
    title: "10) Oturum Çerezleri ve Kalıcı Çerezler",
    paragraphs: [
      "Oturum çerezleri, tarayıcı oturumu devam ettiği sürece saklanır ve genellikle tarayıcı kapatıldığında silinir.",
      "Kalıcı çerezler ise çerez için belirlenen saklama süresi boyunca veya kullanıcı tarafından silinene kadar cihaz üzerinde kalabilir.",
      "Çerezlerin saklama süresi, çerezin amacı, teknik niteliği ve kullanılan hizmet sağlayıcısına göre değişiklik gösterebilir.",
    ],
  },
  {
    title: "11) Çerezler Aracılığıyla İşlenebilecek Veriler",
    paragraphs: [
      "Kullanılan çerezin türüne göre aşağıdaki teknik bilgiler işlenebilir:",
    ],
    items: [
      "IP adresi",
      "Tarayıcı türü ve sürümü",
      "Cihaz türü",
      "İşletim sistemi",
      "Oturum ve kullanıcı tanımlayıcıları",
      "Ziyaret tarihi ve saati",
      "Ziyaret edilen sayfalar",
      "Sayfalar üzerinde gerçekleştirilen teknik işlemler",
      "Yönlendiren internet sitesi veya bağlantı kaynağı",
      "Hata, güvenlik ve performans kayıtları",
      "Çerez ve tercih tanımlayıcıları",
    ],
  },
  {
    title: "12) Çerezlerin Hukuki Sebepleri",
    paragraphs: [
      "Çerezler aracılığıyla gerçekleştirilen kişisel veri işleme faaliyetleri, çerezin amacı ve niteliğine göre ilgili mevzuatta yer alan hukuki sebeplere dayanılarak yürütülür.",
    ],
    items: [
      "Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması",
      "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması",
      "Bir hakkın tesisi, kullanılması veya korunması için zorunlu olması",
      "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için zorunlu olması",
      "İnternet sitesinin ve kullanıcı hesaplarının güvenliğinin sağlanması",
      "Gerekli durumlarda kullanıcının açık tercihi veya açık rızasının bulunması",
    ],
  },
  {
    title: "13) Çerez Tercihlerinin Yönetilmesi",
    paragraphs: [
      "Kullanıcılar, zorunlu olmayan çerezlere ilişkin tercihlerini varsa internet sitesindeki çerez tercih paneli üzerinden yönetebilir.",
      "Çerez tercih panelinin bulunmadığı durumlarda kullanıcılar, kullandıkları internet tarayıcısının ayarlarından çerezleri görüntüleyebilir, silebilir, engelleyebilir veya belirli internet siteleri için kısıtlayabilir.",
      "Tarayıcı ayarları değiştirildiğinde daha önce kaydedilen çerezlerin ayrıca silinmesi gerekebilir.",
      "Tarayıcı veya cihaz ayarlarının değiştirilmesi, internet sitesinin bazı özelliklerinin çalışmasını etkileyebilir.",
    ],
  },
  {
    title: "14) Tarayıcı Üzerinden Çerezlerin Yönetimi",
    paragraphs: [
      "Çerez yönetimi adımları kullanılan tarayıcıya göre değişebilir. Tarayıcıların ayarlar, gizlilik, güvenlik veya site verileri bölümleri üzerinden çerez tercihleri yönetilebilir.",
    ],
    items: [
      "Tüm çerezleri kabul etme veya engelleme",
      "Belirli internet sitelerine ait çerezleri silme",
      "Üçüncü taraf çerezlerini engelleme",
      "Tarayıcı kapatıldığında çerezleri otomatik silme",
      "Çerez kaydedilmeden önce bildirim gösterilmesini sağlama",
      "Kayıtlı site verilerini ve yerel depolama bilgilerini temizleme",
    ],
  },
  {
    title: "15) Çerez Tercihinin Geri Alınması",
    paragraphs: [
      "Kullanıcı, daha önce zorunlu olmayan çerezler için vermiş olduğu tercihi değiştirebilir veya geri alabilir.",
      "Tercihin değiştirilmesi, değişiklikten önce hukuka uygun şekilde gerçekleştirilen işlemleri etkilemez.",
      "Tercihin geri alınmasından sonra cihazda bulunan mevcut çerezlerin tarayıcı ayarları üzerinden ayrıca silinmesi gerekebilir.",
    ],
  },
  {
    title: "16) Üçüncü Taraf Hizmetler",
    paragraphs: [
      "DişFiyat360; barındırma, veri tabanı, e-posta, güvenlik, ödeme, analiz veya diğer teknik hizmetlerden yararlanabilir.",
      "Bu hizmetlerin bazıları kendi çerezlerini veya benzeri teknolojilerini kullanabilir.",
      "Üçüncü taraf hizmet sağlayıcıları tarafından gerçekleştirilen veri işleme faaliyetleri, ilgili hizmet sağlayıcısının gizlilik politikası, çerez politikası ve kullanım şartlarına tabi olabilir.",
      "DişFiyat360, kullandığı üçüncü taraf hizmet sağlayıcılarını teknik ve hukuki gereklilikler doğrultusunda değiştirebilir.",
    ],
  },
  {
    title: "17) Ödeme İşlemleri ve Çerezler",
    paragraphs: [
      "Kredi paketi veya Premium üyelik satın alma işlemleri sırasında banka, sanal POS veya ödeme hizmeti sağlayıcısının güvenli ödeme sayfasına yönlendirme yapılabilir.",
      "Ödeme hizmeti sağlayıcısı; işlem güvenliği, dolandırıcılığın önlenmesi, oturum yönetimi ve ödeme işleminin tamamlanması amacıyla kendi çerezlerini kullanabilir.",
      "Ödeme hizmeti sağlayıcısının kullandığı çerezler ve veri işleme faaliyetleri, ilgili banka veya ödeme hizmeti sağlayıcısının kendi politikalarına tabidir.",
    ],
  },
  {
    title: "18) Çerezler Aracılığıyla Toplanan Verilerin Aktarılması",
    paragraphs: [
      "Çerezler aracılığıyla elde edilen bilgiler, işleme amacıyla sınırlı ve ölçülü olmak kaydıyla aşağıdaki alıcı gruplarıyla paylaşılabilir:",
    ],
    items: [
      "Barındırma ve sunucu hizmeti sağlayıcıları",
      "Veri tabanı ve teknik altyapı sağlayıcıları",
      "Siber güvenlik ve kötüye kullanım önleme hizmeti sağlayıcıları",
      "Analiz hizmeti sağlayıcıları",
      "Banka, sanal POS ve ödeme hizmeti sağlayıcıları",
      "Yazılım geliştirme ve teknik destek hizmeti sağlayıcıları",
      "Hukuk, muhasebe ve danışmanlık hizmeti sağlayıcıları",
      "Yetkili kamu kurumları, adli ve idari merciler",
    ],
  },
  {
    title: "19) Yurt Dışına Veri Aktarımı",
    paragraphs: [
      "Barındırma, güvenlik, e-posta, analiz, yedekleme veya diğer teknik hizmetlerin yurt dışında bulunan veya yurt dışında veri işleyen hizmet sağlayıcılardan alınması hâlinde çerezler aracılığıyla toplanan bazı teknik veriler yurt dışına aktarılabilir.",
      "Yurt dışına kişisel veri aktarımı yapılması gereken durumlarda, yürürlükteki kişisel verilerin korunması mevzuatında öngörülen şartlar ve uygun güvence yöntemleri dikkate alınır.",
      "Kullanılan hizmet sağlayıcıları ve teknik veri akışları değiştikçe aktarım süreçleri yeniden değerlendirilebilir.",
    ],
  },
  {
    title: "20) Çerezlerin Saklanma Süresi",
    paragraphs: [
      "Çerezler, kullanım amaçları için gerekli olan süre boyunca saklanır.",
      "Oturum çerezleri genellikle tarayıcı oturumu sona erdiğinde silinir. Kalıcı çerezlerin süresi ise çerezin amacı ve kullanılan hizmete göre değişebilir.",
      "Çerez aracılığıyla elde edilen kişisel veriler, işleme amacı ve hukuki sebebi ortadan kalktığında ilgili mevzuata uygun şekilde silinir, yok edilir veya anonim hâle getirilir.",
    ],
  },
  {
    title: "21) Kişisel Verilerin Güvenliği",
    paragraphs: [
      "DişFiyat360, çerezler aracılığıyla işlenen kişisel verilerin hukuka aykırı şekilde erişilmesini, değiştirilmesini veya açıklanmasını önlemek amacıyla uygun teknik ve idari tedbirleri almaya çalışır.",
    ],
    items: [
      "Güvenli bağlantı yöntemlerinin kullanılması",
      "Oturum ve erişim kontrollerinin uygulanması",
      "Kullanıcı yetkilerinin sınırlandırılması",
      "Güvenlik ve hata kayıtlarının tutulması",
      "Kötüye kullanım ve bot kontrollerinin uygulanması",
      "Teknik altyapının güncel tutulması",
      "Yetkisiz erişimlerin sınırlandırılması",
    ],
  },
  {
    title: "22) İlgili Kişinin Hakları",
    paragraphs: [
      "Çerezler aracılığıyla kişisel verisi işlenen kişiler, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesi kapsamındaki haklarını kullanabilir.",
    ],
    items: [
      "Kişisel verilerinin işlenip işlenmediğini öğrenme",
      "Kişisel verileri işlenmişse buna ilişkin bilgi talep etme",
      "Kişisel verilerin işlenme amacını öğrenme",
      "Kişisel verilerin amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Kişisel verilerin aktarıldığı üçüncü kişileri bilme",
      "Eksik veya yanlış işlenen kişisel verilerin düzeltilmesini isteme",
      "Kanuni şartların oluşması hâlinde verilerin silinmesini veya yok edilmesini isteme",
      "Düzeltme, silme veya yok etme işlemlerinin üçüncü kişilere bildirilmesini isteme",
      "Otomatik sistemler sonucunda kişinin aleyhine ortaya çıkan sonuca itiraz etme",
      "Hukuka aykırı veri işleme nedeniyle oluşan zararın giderilmesini talep etme",
    ],
  },
  {
    title: "23) Başvuru Yöntemi",
    paragraphs: [
      "Çerezler ve kişisel verilerin işlenmesine ilişkin soru, talep veya başvurularınızı kimliğinizi ve talebinizi açıkça belirterek aşağıdaki iletişim kanalları üzerinden iletebilirsiniz.",
    ],
    items: [
      "E-posta: ferhatmenekse945@gmail.com",
      "Posta veya elden başvuru: Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana",
      "Telefonla genel bilgi: 0531 917 17 39",
    ],
  },
  {
    title: "24) Politika Değişiklikleri",
    paragraphs: [
      "Bu Çerez Politikası; mevzuat değişiklikleri, internet sitesinde kullanılan teknolojiler, üçüncü taraf hizmet sağlayıcıları veya DişFiyat360 hizmetlerinde yapılan değişikliklere göre güncellenebilir.",
      "Politikanın güncel hâli internet sitesi üzerinden yayımlandığı tarihten itibaren geçerli olur.",
      "Önemli değişikliklerin bulunması hâlinde internet sitesi veya uygun iletişim kanalları üzerinden ayrıca bilgilendirme yapılabilir.",
    ],
  },
];

export default function CookiePolicyPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">🍪 Çerez Politikası</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                Çerez <span className="grad">Politikası</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 800,
                }}
              >
                Bu politika, DişFiyat360 internet sitesinde kullanılabilecek
                çerezler ve benzeri teknolojiler, kullanım amaçları, saklama
                esasları ve çerez tercihlerinizi nasıl yönetebileceğiniz
                hakkında bilgi verir.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">🍪 Şeffaf çerez kullanımı</span>
                <span className="miniItem">⚙️ Tercih yönetimi</span>
                <span className="miniItem">🔒 Güvenli oturum</span>
              </div>

              <div style={updateBoxStyle}>
                <strong
                  style={{
                    color: "rgba(15,23,42,0.92)",
                  }}
                >
                  Son güncelleme:
                </strong>{" "}
                17 Temmuz 2026
              </div>

              <div className="section">
                <div
                  className="sectionBox"
                  style={{
                    background: "rgba(255,255,255,0.82)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <ImportantNotice />

                    {POLICY_BLOCKS.slice(0, 6).map((block) => (
                      <PolicyCard key={block.title} block={block} />
                    ))}

                    <CookieTypesTable />

                    {POLICY_BLOCKS.slice(6).map((block) => (
                      <PolicyCard key={block.title} block={block} />
                    ))}

                    <ContactCard />
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/gizlilik-politikasi" className="btn btnSoft">
                  Gizlilik Politikası →
                </Link>

                <Link href="/kvkk" className="btn btnGhost">
                  KVKK Aydınlatma Metni →
                </Link>

                <Link href="/" className="btn btnPrimary">
                  Ana Sayfa →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ImportantNotice(): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(245,158,11,0.28)",
        background:
          "linear-gradient(135deg, rgba(255,251,235,0.96), rgba(255,255,255,0.92))",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          lineHeight: 1.4,
          color: "rgba(120,53,15,0.94)",
        }}
      >
        Önemli Bilgilendirme
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "rgba(120,53,15,0.78)",
          fontWeight: 750,
          lineHeight: 1.78,
        }}
      >
        DişFiyat360 üzerinde zorunlu olmayan analiz, reklam veya pazarlama
        çerezlerinin kullanılması hâlinde kullanıcı tercihleri dikkate alınır.
        İnternet sitesinde belirli bir çerez türü veya üçüncü taraf hizmet
        kullanılmıyorsa, ilgili çerez cihazınıza yerleştirilmez.
      </p>
    </article>
  );
}

function PolicyCard({
  block,
}: {
  block: CookiePolicyBlock;
}): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.86)",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.94)",
        }}
      >
        {block.title}
      </h2>

      {block.paragraphs?.map((paragraph) => (
        <p
          key={paragraph}
          style={{
            margin: "9px 0 0",
            color: "rgba(15,23,42,0.72)",
            fontWeight: 750,
            lineHeight: 1.78,
          }}
        >
          {paragraph}
        </p>
      ))}

      {block.items ? (
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: 20,
          }}
        >
          {block.items.map((item) => (
            <li
              key={item}
              style={{
                marginTop: 7,
                color: "rgba(15,23,42,0.72)",
                fontWeight: 750,
                lineHeight: 1.75,
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function CookieTypesTable(): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(79,70,229,0.16)",
        background:
          "linear-gradient(135deg, rgba(238,242,255,0.94), rgba(255,255,255,0.90))",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.94)",
        }}
      >
        Kullanılabilecek Çerez Türleri
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.78,
        }}
      >
        DişFiyat360 üzerinde aşağıdaki çerez türleri, internet sitesinde
        kullanılan özelliklere ve hizmet sağlayıcılarına bağlı olarak
        kullanılabilir.
      </p>

      <div
        style={{
          display: "grid",
          gap: 10,
          marginTop: 14,
        }}
      >
        {COOKIE_TYPES.map((cookie) => (
          <div
            key={cookie.name}
            style={{
              border: "1px solid rgba(15,23,42,0.09)",
              background: "rgba(255,255,255,0.84)",
              borderRadius: 16,
              padding: 14,
            }}
          >
            <div
              style={{
                fontWeight: 950,
                fontSize: 15,
                color: "rgba(15,23,42,0.92)",
              }}
            >
              {cookie.name}
            </div>

            <CookieDetailRow label="Amaç" value={cookie.purpose} />

            <CookieDetailRow
              label="Saklama süresi"
              value={cookie.duration}
            />

            <CookieDetailRow
              label="İşleme dayanağı"
              value={cookie.legalBasis}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

function CookieDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div
      style={{
        marginTop: 8,
        color: "rgba(15,23,42,0.70)",
        fontWeight: 750,
        lineHeight: 1.7,
      }}
    >
      <strong
        style={{
          color: "rgba(15,23,42,0.86)",
          fontWeight: 900,
        }}
      >
        {label}:
      </strong>{" "}
      {value}
    </div>
  );
}

function ContactCard(): JSX.Element {
  return (
    <article
      style={{
        border: "1px solid rgba(79,70,229,0.18)",
        background:
          "linear-gradient(135deg, rgba(238,242,255,0.94), rgba(255,255,255,0.90))",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: 950,
          fontSize: 17,
          color: "rgba(15,23,42,0.94)",
        }}
      >
        Veri Sorumlusu İletişim Bilgileri
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.78,
        }}
      >
        Çerez kullanımı, çerez tercihleriniz veya kişisel verileriniz hakkında
        aşağıdaki iletişim kanallarından bizimle iletişime geçebilirsiniz.
      </p>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gap: 7,
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.7,
        }}
      >
        <ContactRow label="Veri sorumlusu" value="Ferhat Menekşe" />

        <ContactRow
          label="Vergi dairesi"
          value="5 Ocak Vergi Dairesi"
        />

        <ContactRow label="Vergi numarası" value="6150625779" />

        <ContactRow
          label="Adres"
          value="Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana"
        />

        <ContactRow
          label="E-posta"
          value={
            <a
              href="mailto:ferhatmenekse945@gmail.com"
              style={contactLinkStyle}
            >
              ferhatmenekse945@gmail.com
            </a>
          }
        />

        <ContactRow
          label="Telefon"
          value={
            <a href="tel:+905319171739" style={contactLinkStyle}>
              0531 917 17 39
            </a>
          }
        />

        <ContactRow
          label="İnternet adresi"
          value={
            <a
              href="https://www.disfiyat360.com"
              target="_blank"
              rel="noopener noreferrer"
              style={contactLinkStyle}
            >
              www.disfiyat360.com
            </a>
          }
        />
      </div>
    </article>
  );
}

function ContactRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): JSX.Element {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(130px, 170px) minmax(0, 1fr)",
        gap: 10,
        alignItems: "start",
      }}
    >
      <span
        style={{
          color: "rgba(15,23,42,0.58)",
          fontWeight: 850,
        }}
      >
        {label}:
      </span>

      <strong
        style={{
          color: "rgba(15,23,42,0.88)",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const updateBoxStyle: CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 18,
  border: "1px solid rgba(79,70,229,0.16)",
  background:
    "linear-gradient(135deg, rgba(238,242,255,0.92), rgba(255,255,255,0.84))",
  color: "rgba(15,23,42,0.72)",
  fontWeight: 750,
  lineHeight: 1.7,
};

const contactLinkStyle: CSSProperties = {
  color: "inherit",
  fontWeight: 900,
  textDecoration: "none",
  overflowWrap: "anywhere",
};