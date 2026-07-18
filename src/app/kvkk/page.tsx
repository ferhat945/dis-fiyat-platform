import type { Metadata } from "next";
import Link from "next/link";
import { KVKK_TEXT_VERSION } from "@/lib/kvkk";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `KVKK Aydınlatma Metni (${KVKK_TEXT_VERSION}) | DişFiyat360`,
  description:
    "DişFiyat360 teklif formu, klinik hesabı ve platform kullanımı kapsamında işlenen kişisel verilere ilişkin KVKK aydınlatma metni.",
  alternates: {
    canonical: "/kvkk",
  },
};

type KvkkBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const KVKK_BLOCKS: KvkkBlock[] = [
  {
    title: "1) Veri Sorumlusu",
    paragraphs: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verileriniz veri sorumlusu sıfatıyla Ferhat Menekşe tarafından işlenebilir.",
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
    title: "2) Aydınlatma Metninin Kapsamı",
    paragraphs: [
      "Bu aydınlatma metni; DişFiyat360 internet sitesini ziyaret eden, teklif veya iletişim formu dolduran, klinik hesabı oluşturan, klinik panelini kullanan, kredi paketi veya Premium üyelik satın alan kişiler için hazırlanmıştır.",
      "İşlenen veriler, kullanılan hizmete ve gerçekleştirilen işleme göre değişiklik gösterebilir.",
    ],
  },
  {
    title: "3) İşlenebilecek Kişisel Veriler",
    items: [
      "Kimlik bilgileri: Ad ve soyad",
      "İletişim bilgileri: Telefon numarası, e-posta adresi ve iletişim tercihleri",
      "Talep bilgileri: Şehir, talep edilen diş hizmeti ve kullanıcı mesajı",
      "Klinik bilgileri: Klinik adı, yetkili bilgileri, telefon, e-posta, adres, internet sitesi ve sosyal medya bilgileri",
      "Hesap bilgileri: Kullanıcı hesabı, oturum bilgileri ve hesap hareketleri",
      "Hizmet kapsamı bilgileri: Kliniğin faaliyet gösterdiği şehirler ve sunduğu hizmetler",
      "İşlem bilgileri: Kredi bakiyesi, kredi kullanımları, lead işlemleri ve Premium üyelik bilgileri",
      "Finansal işlem bilgileri: Satın alınan paket, ödeme tutarı, işlem tarihi, ödeme sonucu ve işlem referansı",
      "Müşteri işlem bilgileri: Destek, iletişim, şikâyet ve talep geçmişi",
      "Teknik veriler: IP adresi, user-agent, cihaz, tarayıcı, tarih, saat, hata ve güvenlik kayıtları",
      "Hukuki işlem bilgileri: Aydınlatma, açık rıza, iletişim ve sözleşme onay kayıtları",
    ],
  },
  {
    title: "4) Sağlık Verileri Hakkında Bilgilendirme",
    paragraphs: [
      "DişFiyat360 bir sağlık hizmeti sağlayıcısı değildir ve platform üzerinden teşhis veya tedavi uygulanmaz.",
      "Teklif formunda yalnızca ilgilenilen diş hizmetinin seçilmesi amaçlanır.",
      "Kullanıcıların serbest mesaj alanına teşhis, hastalık geçmişi, ilaç bilgisi, tahlil sonucu, röntgen, fotoğraf veya başka bir özel nitelikli kişisel veri yazmaması önerilir.",
      "Kullanıcının kendi iradesiyle sağlık durumuna ilişkin bilgi paylaşması hâlinde bu bilgiler, yalnızca talebin değerlendirilmesi ve uygun klinikle iletişim kurulması amacıyla, uygulanabilir hukuki şartlar çerçevesinde işlenebilir.",
    ],
  },
  {
    title: "5) Kişisel Verilerin Toplanma Yöntemleri",
    paragraphs: [
      "Kişisel veriler; teklif formu, iletişim formu, klinik kayıt ve giriş işlemleri, klinik paneli, satın alma işlemleri, e-posta, telefon, destek talepleri, çerezler ve sunucu kayıtları aracılığıyla elektronik ortamda toplanabilir.",
      "Bazı veriler kullanıcı veya klinik tarafından doğrudan sağlanır. IP adresi, user-agent, tarih, saat ve güvenlik kayıtları gibi teknik veriler ise platform kullanımı sırasında otomatik yöntemlerle oluşturulabilir.",
    ],
  },
  {
    title: "6) Kişisel Verilerin İşlenme Amaçları",
    items: [
      "Teklif veya iletişim taleplerini almak ve yönetmek",
      "Talebin seçilen şehir ve hizmete uygun kliniklere yönlendirilmesini sağlamak",
      "Kullanıcı ile klinik arasında iletişim kurulmasını kolaylaştırmak",
      "Klinik üyelik ve hesap işlemlerini yürütmek",
      "Kimlik doğrulama ve oturum süreçlerini yönetmek",
      "Klinik profillerini, şehirleri ve hizmet kapsamlarını yönetmek",
      "Lead dağıtım ve yönlendirme süreçlerini yürütmek",
      "Kredi bakiyesi ve kredi kullanım işlemlerini yönetmek",
      "Premium üyelik ve abonelik süreçlerini yürütmek",
      "Sipariş ve ödeme işlemlerini yürütmek",
      "Muhasebe ve mali kayıt süreçlerini yerine getirmek",
      "Müşteri desteği, talep ve şikâyet süreçlerini yürütmek",
      "Sözleşmelerin kurulması ve ifasını sağlamak",
      "Sistem ve hesap güvenliğini sağlamak",
      "Spam, bot, sahte talep ve kötüye kullanımı önlemek",
      "Hata ve güvenlik kayıtlarını incelemek",
      "Yasal yükümlülükleri yerine getirmek",
      "Yetkili kurum taleplerini karşılamak",
      "Hukuki hakların tesisi, kullanılması ve korunmasını sağlamak",
      "Platformun performansını ve hizmet kalitesini geliştirmek",
    ],
  },
  {
    title: "7) Kişisel Verilerin İşlenmesinin Hukuki Sebepleri",
    paragraphs: [
      "Kişisel veriler, gerçekleştirilen işlemin niteliğine göre 6698 sayılı Kanun'da belirtilen hukuki sebeplerden bir veya birkaçına dayanılarak işlenebilir.",
    ],
    items: [
      "Kanunlarda açıkça öngörülmesi",
      "Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması",
      "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması",
      "Bir hakkın tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması",
      "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için veri işlemenin zorunlu olması",
      "Gerekli olduğu durumlarda ilgili kişinin açık rızasının bulunması",
    ],
  },
  {
    title: "8) Kullanıcı Taleplerinin Kliniklere Aktarılması",
    paragraphs: [
      "Kullanıcının teklif veya iletişim talebi, seçilen şehir, hizmet, kliniklerin kapsamları, aktiflik durumu ve platformun dağıtım kuralları dikkate alınarak uygun bir veya birden fazla klinikle paylaşılabilir.",
      "Paylaşılabilecek bilgiler; ad ve soyad, telefon numarası, varsa e-posta adresi, seçilen şehir, talep edilen hizmet ve kullanıcı mesajıyla sınırlı olabilir.",
      "Klinikler, kendilerine yönlendirilen kişisel verileri yalnızca ilgili kullanıcı talebine dönüş yapmak, bilgi vermek ve kullanıcının istemesi hâlinde randevu sürecini yürütmek amacıyla kullanmalıdır.",
    ],
  },
  {
    title: "9) Kişisel Verilerin Aktarılabileceği Taraflar",
    items: [
      "Talebin yönlendirileceği uygun diş klinikleri ve klinik yetkilileri",
      "Barındırma, veri tabanı ve sunucu hizmeti sağlayıcıları",
      "E-posta, güvenlik, yedekleme ve teknik altyapı hizmeti sağlayıcıları",
      "Banka, ödeme kuruluşu ve sanal POS hizmeti sağlayıcıları",
      "Muhasebe, mali müşavirlik, hukuk ve danışmanlık hizmeti sağlayıcıları",
      "Yetkili kamu kurumları, adli ve idari merciler",
      "Hukuki yükümlülüklerin yerine getirilmesi için aktarım yapılması gereken yetkili taraflar",
    ],
  },
  {
    title: "10) Ödeme İşlemleri",
    paragraphs: [
      "Kredi paketi veya Premium üyelik satın alma işlemleri sırasında ödeme bilgileri banka, sanal POS veya ödeme hizmeti sağlayıcısı tarafından işlenebilir.",
      "Kart numarası, son kullanma tarihi ve güvenlik kodu gibi kart bilgileri, kullanılan ödeme altyapısına bağlı olarak doğrudan banka veya ödeme hizmeti sağlayıcısının sistemlerinde işlenebilir.",
      "DişFiyat360 sistemlerinde ödeme sonucu, işlem tutarı, tarih ve işlem referansı gibi kayıtlar yasal ve operasyonel amaçlarla saklanabilir.",
    ],
  },
  {
    title: "11) Yurt Dışına Veri Aktarımı",
    paragraphs: [
      "Barındırma, e-posta, güvenlik, yedekleme veya diğer teknik hizmetlerde yurt dışında bulunan ya da verileri yurt dışında işleyen hizmet sağlayıcıların kullanılması hâlinde bazı kişisel veriler yurt dışına aktarılabilir.",
      "Yurt dışına kişisel veri aktarılması gereken durumlarda, yürürlükteki mevzuatta yer alan şartlar ve uygulanabilir güvence yöntemleri dikkate alınır.",
    ],
  },
  {
    title: "12) Kişisel Verilerin Saklanma Süresi",
    paragraphs: [
      "Kişisel veriler, işlendikleri amaç için gerekli olan süre ve ilgili mevzuatta öngörülen saklama süreleri boyunca muhafaza edilir.",
      "Saklama süresi belirlenirken işlem amacı, sözleşme ilişkisi, hesap durumu, mali yükümlülükler, olası uyuşmazlıklar ve zamanaşımı süreleri dikkate alınır.",
      "İşleme amacı ve hukuki sebep ortadan kalktığında kişisel veriler, uygulanabilir mevzuat doğrultusunda silinir, yok edilir veya anonim hâle getirilir.",
    ],
  },
  {
    title: "13) Kişisel Verilerin Güvenliği",
    paragraphs: [
      "DişFiyat360, kişisel verilerin hukuka aykırı işlenmesini ve yetkisiz erişimi önlemek amacıyla işin niteliğine uygun teknik ve idari tedbirleri uygulamaya çalışır.",
    ],
    items: [
      "Güvenli bağlantı ve iletişim yöntemleri",
      "Hesap ve oturum yetkilendirmesi",
      "Rol ve erişim kontrolleri",
      "Rate limit ve kötüye kullanım önleme kontrolleri",
      "Honeypot ve spam önleme mekanizmaları",
      "İşlem, hata ve güvenlik kayıtları",
      "Veri tabanı ve yönetim ekranı erişimlerinin sınırlandırılması",
      "Teknik güncelleme ve gerektiğinde yedekleme işlemleri",
    ],
  },
  {
    title: "14) Ticari Elektronik İletiler",
    paragraphs: [
      "Telefon veya e-posta bilgilerinin teklif talebine dönüş yapılması, destek sağlanması veya satın alınan hizmetin yürütülmesi amacıyla kullanılması tek başına pazarlama izni anlamına gelmez.",
      "Kampanya veya tanıtım amaçlı ticari elektronik ileti gönderilecekse, gerekli olduğu durumlarda ayrıca iletişim izni alınır.",
    ],
  },
  {
    title: "15) Otomatik İşlemler ve Lead Dağıtımı",
    paragraphs: [
      "Kullanıcı talepleri; şehir, talep edilen hizmet, klinik kapsamı, klinik aktifliği, üyelik veya kredi durumu ve sistemdeki dağıtım kuralları dikkate alınarak otomatik veya yarı otomatik şekilde uygun kliniklere yönlendirilebilir.",
      "Bu işlem, kullanıcı hakkında tıbbi teşhis veya tedavi kararı verilmesi anlamına gelmez.",
    ],
  },
  {
    title: "16) İlgili Kişinin Hakları",
    paragraphs: [
      "Kişisel verisi işlenen kişiler, 6698 sayılı Kanun kapsamında veri sorumlusuna başvurarak aşağıdaki haklarını kullanabilir:",
    ],
    items: [
      "Kişisel verilerinin işlenip işlenmediğini öğrenme",
      "Kişisel verileri işlenmişse buna ilişkin bilgi talep etme",
      "Kişisel verilerin işlenme amacını öğrenme",
      "Verilerin amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Kişisel verilerin yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
      "Eksik veya yanlış işlenen kişisel verilerin düzeltilmesini isteme",
      "Kanuni şartların oluşması hâlinde kişisel verilerin silinmesini veya yok edilmesini isteme",
      "Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
      "Otomatik sistemlerle analiz sonucunda kişinin aleyhine bir sonucun ortaya çıkmasına itiraz etme",
      "Kişisel verilerin hukuka aykırı işlenmesi nedeniyle oluşan zararın giderilmesini talep etme",
    ],
  },
  {
    title: "17) Başvuru Yöntemi",
    paragraphs: [
      "Kişisel verilerinize ilişkin başvurularınızı kimliğinizi, iletişim bilgilerinizi ve talebinizi açıkça belirterek aşağıdaki kanallardan iletebilirsiniz.",
    ],
    items: [
      "E-posta: ferhatmenekse945@gmail.com",
      "Posta veya elden başvuru: Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana",
      "Telefonla genel bilgi: 0531 917 17 39",
    ],
  },
  {
    title: "18) Çocuklara Ait Veriler",
    paragraphs: [
      "Platform esas olarak yetişkin kullanıcılar ile diş klinikleri arasında iletişim kurulmasına yöneliktir.",
      "18 yaşından küçük bir kişi adına talep oluşturulması gereken durumlarda işlemin veli veya yasal temsilci tarafından gerçekleştirilmesi önerilir.",
    ],
  },
  {
    title: "19) Aydınlatma Metnindeki Değişiklikler",
    paragraphs: [
      "Bu aydınlatma metni, mevzuat, teknik altyapı veya platform hizmetlerinde meydana gelen değişikliklere göre güncellenebilir.",
      "Güncel metin ve sürüm bilgisi internet sitesinde yayımlandığı tarihten itibaren geçerli olur.",
    ],
  },
];

export default function KvkkPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className="kicker">
                    🔒 KVKK Aydınlatma Metni{" "}
                    <span style={{ opacity: 0.7 }}>•</span>{" "}
                    {KVKK_TEXT_VERSION}
                  </div>

                  <h1
                    className="h1"
                    style={{
                      fontSize: 34,
                      marginTop: 10,
                    }}
                  >
                    KVKK <span className="grad">Bilgilendirme</span>
                  </h1>

                  <p
                    className="heroDesc"
                    style={{
                      marginTop: 8,
                      maxWidth: 760,
                    }}
                  >
                    Bu metin, teklif formu, klinik hesabı, ödeme işlemleri ve
                    platform kullanımı kapsamında kişisel verilerinizin nasıl
                    işlendiğini açıklar.
                  </p>

                  <div
                    className="miniRow"
                    style={{
                      marginTop: 10,
                    }}
                  >
                    <span className="miniItem">📄 Şeffaf bilgilendirme</span>
                    <span className="miniItem">🛡️ Güvenlik kontrolleri</span>
                    <span className="miniItem">🔒 Kontrollü paylaşım</span>
                  </div>
                </div>

                <div
                  className="ctaRow"
                  style={{
                    marginTop: 2,
                  }}
                >
                  <Link href="/teklif-al" className="btn btnPrimary">
                    Teklif Al →
                  </Link>

                  <Link href="/" className="btn btnGhost">
                    Ana Sayfa →
                  </Link>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid rgba(79,70,229,0.16)",
                  background:
                    "linear-gradient(135deg, rgba(238,242,255,0.92), rgba(255,255,255,0.84))",
                  color: "rgba(15,23,42,0.72)",
                  fontWeight: 750,
                  lineHeight: 1.7,
                }}
              >
                <strong
                  style={{
                    color: "rgba(15,23,42,0.92)",
                  }}
                >
                  Metin sürümü:
                </strong>{" "}
                {KVKK_TEXT_VERSION}
                <br />
                <strong
                  style={{
                    color: "rgba(15,23,42,0.92)",
                  }}
                >
                  Son güncelleme:
                </strong>{" "}
                17 Temmuz 2026
              </div>

              <div
                className="section"
                style={{
                  paddingTop: 16,
                  paddingBottom: 0,
                }}
              >
                <div
                  className="sectionBox"
                  style={{
                    display: "grid",
                    gap: 10,
                    background: "rgba(255,255,255,0.82)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 950,
                      fontSize: 17,
                    }}
                  >
                    Kısa Özet
                  </div>

                  <div
                    style={{
                      color: "rgba(15,23,42,0.70)",
                      fontWeight: 750,
                      lineHeight: 1.75,
                    }}
                  >
                    Teklif formunda paylaşılan iletişim ve talep bilgileriniz,
                    talebinize uygun kliniklerin sizinle iletişim kurabilmesi
                    amacıyla işlenebilir ve uygun kliniklerle paylaşılabilir.
                    DişFiyat360 sağlık hizmeti veya kesin tedavi fiyatı sunmaz.
                  </div>

                  <div
                    className="ctaRow"
                    style={{
                      marginTop: 4,
                    }}
                  >
                    <Link
                      href="/gizlilik-politikasi"
                      className="btn btnSoft"
                    >
                      Gizlilik Politikası
                    </Link>

                    <Link href="/teklif-al" className="btn btnPrimary">
                      Teklif Formu →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="sectionTitle">Ayrıntılı Bilgilendirme</h2>

                <div
                  className="sectionBox"
                  style={{
                    background: "rgba(255,255,255,0.78)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    {KVKK_BLOCKS.map((block) => (
                      <KvkkCard key={block.title} block={block} />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="section"
                style={{
                  paddingTop: 0,
                }}
              >
                <div
                  className="finalCta"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(124,58,237,0.06))",
                  }}
                >
                  <div>
                    <h2
                      className="finalTitle"
                      style={{
                        fontSize: 18,
                      }}
                    >
                      Sağlık Hizmeti Bilgilendirmesi
                    </h2>

                    <p className="finalDesc">
                      DişFiyat360 sağlık hizmeti sunmaz. Muayene, teşhis,
                      tedavi, kesin fiyatlandırma ve diğer sağlık hizmetleri
                      ilgili klinik tarafından yürütülür.
                    </p>
                  </div>

                  <Link href="/teklif-al" className="btn btnPrimary">
                    Teklif Al →
                  </Link>
                </div>

                <div
                  className="miniRow"
                  style={{
                    marginTop: 10,
                  }}
                >
                  <Link
                    href="/gizlilik-politikasi"
                    className="btn btnSoft"
                  >
                    Gizlilik Politikası →
                  </Link>

                  <Link
                    href="/cerez-politikasi"
                    className="btn btnSoft"
                  >
                    Çerez Politikası →
                  </Link>

                  <Link href="/iletisim" className="btn btnGhost">
                    İletişim →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function KvkkCard({
  block,
}: {
  block: KvkkBlock;
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