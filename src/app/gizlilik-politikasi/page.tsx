import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | DişFiyat360",
  description:
    "DişFiyat360 gizlilik politikası, kişisel verilerin toplanması, kullanılması, paylaşılması, korunması ve saklanmasına ilişkin esasları açıklar.",
  alternates: {
    canonical: "/gizlilik-politikasi",
  },
};

type PolicyBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const POLICY_BLOCKS: PolicyBlock[] = [
  {
    title: "1) Politikanın Amacı ve Kapsamı",
    paragraphs: [
      "Bu Gizlilik Politikası; DişFiyat360 internet sitesini ziyaret eden kullanıcıların, teklif veya iletişim formu dolduran kişilerin, platforma kayıt olan kliniklerin ve klinik yetkililerinin kişisel verilerinin hangi kapsamda toplandığını, kullanıldığını, paylaşıldığını, saklandığını ve korunduğunu açıklamak amacıyla hazırlanmıştır.",
      "Bu politika; www.disfiyat360.com alan adı, kullanıcı teklif formları, klinik kayıt ve giriş işlemleri, klinik paneli, iletişim kanalları, destek süreçleri ve platform üzerinden sunulan diğer dijital hizmetleri kapsar.",
    ],
  },
  {
    title: "2) Veri Sorumlusu ve İletişim",
    paragraphs: [
      "DişFiyat360 kapsamında kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat doğrultusunda işlenir.",
    ],
    items: [
      "E-posta: disfiyat360@gmail.com",
      "Konum: Beşiktaş / İstanbul",
      "İnternet adresi: www.disfiyat360.com",
    ],
  },
  {
    title: "3) Toplanabilecek Kişisel Veriler",
    paragraphs: [
      "Platformun kullanılan bölümüne ve gerçekleştirilen işleme göre aşağıdaki kişisel veri kategorileri işlenebilir:",
    ],
    items: [
      "Kimlik bilgileri: Ad ve soyad",
      "İletişim bilgileri: Telefon numarası, e-posta adresi ve iletişim tercihleri",
      "Talep bilgileri: Seçilen şehir, diş hizmeti, kullanıcı mesajı, teklif veya iletişim talebinin içeriği",
      "Klinik bilgileri: Klinik adı, yetkili bilgileri, telefon, e-posta, adres, internet sitesi, sosyal medya hesabı, hizmet ve şehir kapsamları",
      "Hesap bilgileri: Kullanıcı veya klinik hesabı, oturum bilgileri ve hesap hareketleri",
      "İşlem bilgileri: Kredi bakiyesi, kullanılan krediler, Premium üyelik bilgileri, paket ve işlem kayıtları",
      "Müşteri işlem bilgileri: Talep, destek, şikâyet, iletişim ve işlem geçmişi",
      "Finansal işlem bilgileri: Satın alınan paket, sipariş tutarı, ödeme sonucu ve işlem referansları",
      "Teknik veriler: IP adresi, tarayıcı ve cihaz bilgileri, user-agent, tarih ve saat bilgileri, hata ve güvenlik kayıtları",
      "Hukuki işlem bilgileri: Açık rıza, aydınlatma, sözleşme ve işlem onay kayıtları",
    ],
  },
  {
    title: "4) Sağlık Verileri Hakkında Önemli Bilgilendirme",
    paragraphs: [
      "DişFiyat360 üzerinden tıbbi teşhis konulmaz, tedavi uygulanmaz ve sağlık danışmanlığı verilmez. Teklif veya iletişim formunda yalnızca ilgili diş hizmetinin seçilmesi amaçlanır.",
      "Kullanıcıların form mesajı alanına teşhis, hastalık geçmişi, ilaç bilgisi, tahlil sonucu, röntgen, fotoğraf veya başka bir özel nitelikli kişisel veri yazmaması önerilir.",
      "Kullanıcının kendi iradesiyle sağlık durumuna ilişkin bilgi paylaşması hâlinde bu bilgiler yalnızca talebin değerlendirilmesi ve ilgili klinikle iletişim kurulması amacıyla, uygulanabilir mevzuat ve gerekli hukuki şartlar kapsamında ele alınır.",
    ],
  },
  {
    title: "5) Kişisel Verilerin Toplanma Yöntemleri",
    paragraphs: [
      "Kişisel veriler; internet sitesindeki teklif, iletişim, kayıt ve giriş formları, klinik paneli, e-posta, telefon, destek talepleri, çerezler, sunucu kayıtları ve platform üzerinde gerçekleştirilen işlemler aracılığıyla elektronik ortamda toplanabilir.",
      "Veriler, kullanıcı tarafından doğrudan sağlanabileceği gibi platformun güvenli şekilde çalıştırılması sırasında otomatik yöntemlerle de oluşturulabilir.",
    ],
  },
  {
    title: "6) Kişisel Verilerin İşlenme Amaçları",
    items: [
      "Kullanıcı tarafından oluşturulan teklif veya iletişim talebini almak ve yönetmek",
      "Kullanıcının seçtiği şehir ve hizmete göre uygun klinikleri belirlemek",
      "Kullanıcı talebini uygun klinik veya kliniklerle paylaşmak",
      "Kullanıcı ile klinik arasında iletişim kurulmasını sağlamak",
      "Klinik üyeliği, hesap kaydı, kimlik doğrulama ve oturum süreçlerini yürütmek",
      "Klinik profillerini, hizmet kapsamlarını ve şehir tercihlerini yönetmek",
      "Lead yönlendirme ve dağıtım süreçlerini yürütmek",
      "Kredi paketi, Premium üyelik ve abonelik işlemlerini yürütmek",
      "Sipariş, ödeme, muhasebe ve finansal kayıt süreçlerini yönetmek",
      "Müşteri desteği, soru, talep, şikâyet ve uyuşmazlık süreçlerini yürütmek",
      "Sözleşmelerin kurulması ve ifası için gerekli işlemleri gerçekleştirmek",
      "Sistem güvenliğini sağlamak, yetkisiz erişimi ve kötüye kullanımı önlemek",
      "Hata, performans ve güvenlik kayıtlarını incelemek",
      "Yasal yükümlülükleri yerine getirmek ve yetkili kurum taleplerini karşılamak",
      "Hukuki hakların tesisi, kullanılması veya korunmasını sağlamak",
      "Hizmet kalitesini ve platform işleyişini geliştirmek",
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
      "Gerekli durumlarda ilgili kişinin açık rızasının bulunması",
    ],
  },
  {
    title: "8) Kullanıcı Taleplerinin Kliniklerle Paylaşılması",
    paragraphs: [
      "Kullanıcının oluşturduğu teklif veya iletişim talebi; seçilen şehir, hizmet türü, klinik kapsamları, kliniklerin aktiflik durumu, üyelik veya kredi durumu ve platformun dağıtım kuralları dikkate alınarak uygun klinik veya kliniklerle paylaşılabilir.",
      "Paylaşılabilecek bilgiler; ad ve soyad, telefon numarası, varsa e-posta adresi, seçilen şehir, talep edilen hizmet ve kullanıcı tarafından yazılan mesajla sınırlı olabilir.",
      "Klinikler, kendilerine iletilen kişisel verileri yalnızca ilgili kullanıcı talebine dönüş yapmak, bilgi vermek ve kullanıcı tarafından talep edilmesi hâlinde randevu sürecini yürütmek amacıyla kullanmalıdır.",
      "DişFiyat360, bir talebin belirli bir klinikle paylaşılacağını, klinikten kesin teklif alınacağını veya iletişimin sağlık hizmeti alımıyla sonuçlanacağını garanti etmez.",
    ],
  },
  {
    title: "9) Kişisel Verilerin Aktarılabileceği Taraflar",
    paragraphs: [
      "Kişisel veriler, işleme amacıyla sınırlı ve ölçülü olmak kaydıyla aşağıdaki alıcı gruplarına aktarılabilir:",
    ],
    items: [
      "Kullanıcı talebinin iletileceği uygun diş klinikleri ve klinik yetkilileri",
      "Barındırma, veri tabanı, e-posta, güvenlik, yazılım, yedekleme ve teknik altyapı hizmeti sağlayıcıları",
      "Ödeme kuruluşları, bankalar ve sanal POS hizmeti sağlayıcıları",
      "Muhasebe, mali müşavirlik, hukuk ve danışmanlık hizmeti sağlayıcıları",
      "Yetkili kamu kurumları, adli ve idari merciler",
      "Hukuki yükümlülüklerin yerine getirilmesi için paylaşım yapılması gereken diğer yetkili taraflar",
    ],
  },
  {
    title: "10) Ödeme ve Kart Bilgileri",
    paragraphs: [
      "Kredi paketi veya Premium üyelik satın alınması sırasında ödeme işlemleri banka, ödeme kuruluşu veya sanal POS hizmeti sağlayıcısı üzerinden gerçekleştirilebilir.",
      "Kart numarası, son kullanma tarihi ve güvenlik kodu gibi ödeme kartı bilgileri, kullanılan ödeme altyapısına bağlı olarak doğrudan banka veya ödeme hizmeti sağlayıcısının güvenli ekranlarında işlenebilir.",
      "DişFiyat360, kart bilgilerinin kendi sistemlerinde saklanmadığı bir ödeme altyapısı kullanmayı amaçlar. Ödeme sonucu, sipariş tutarı, işlem tarihi ve işlem referansı gibi finansal işlem kayıtları ise yasal ve operasyonel amaçlarla saklanabilir.",
    ],
  },
  {
    title: "11) Kişisel Verilerin Saklanma Süresi",
    paragraphs: [
      "Kişisel veriler, işlendikleri amaç için gerekli olan süre ve ilgili mevzuatta öngörülen yasal saklama süreleri boyunca muhafaza edilir.",
      "Saklama süresi belirlenirken işlemin amacı, sözleşme ilişkisi, kullanıcı veya klinik hesabının durumu, olası uyuşmazlıklar, zamanaşımı süreleri, mali yükümlülükler ve yetkili kurum talepleri dikkate alınır.",
      "İşleme amacının ve hukuki sebebin ortadan kalkması hâlinde kişisel veriler, uygulanabilir mevzuat doğrultusunda silinir, yok edilir veya anonim hâle getirilir.",
    ],
  },
  {
    title: "11) Kişisel Verilerin Güvenliği",
    paragraphs: [
      "DişFiyat360, kişisel verilerin hukuka aykırı olarak işlenmesini ve erişilmesini önlemek, verilerin güvenli şekilde muhafaza edilmesini sağlamak amacıyla işin niteliğine uygun teknik ve idari tedbirler almaya çalışır.",
    ],
    items: [
      "Hesap ve oturum yetkilendirmesi",
      "Erişim kontrolü ve kullanıcı yetkilerinin sınırlandırılması",
      "Güvenli bağlantı ve iletişim yöntemleri",
      "İşlem, hata ve güvenlik kayıtlarının tutulması",
      "Spam, bot ve kötüye kullanım önleme kontrolleri",
      "Veri tabanı ve uygulama erişimlerinin sınırlandırılması",
      "Gerekli durumlarda yedekleme ve güncelleme işlemleri",
    ],
  },
  {
    title: "11) Çerezler ve Benzeri Teknolojiler",
    paragraphs: [
      "Platformun çalışması, oturumların yönetilmesi, tercihlerin hatırlanması, güvenliğin sağlanması ve kullanım performansının ölçülmesi amacıyla çerezler veya benzeri teknolojiler kullanılabilir.",
      "Zorunlu olmayan çerezlerin kullanılması hâlinde, uygulanabilir mevzuat doğrultusunda kullanıcı tercihleri dikkate alınır. Çerezler hakkında ayrıntılı bilgiye Çerez Politikası sayfasından ulaşabilirsiniz.",
    ],
  },
  {
    title: "11) Ticari Elektronik İletiler",
    paragraphs: [
      "Telefon veya e-posta bilgilerinin teklif talebine dönüş yapılması, destek sağlanması veya hizmetin yürütülmesi amacıyla kullanılması ticari ileti izni anlamına gelmez.",
      "Kampanya, tanıtım veya pazarlama amaçlı ticari elektronik ileti gönderilecekse, gerekli olduğu durumlarda ayrıca iletişim izni alınır ve kullanıcıya ileti tercihlerini yönetme imkânı sunulur.",
    ],
  },
  {
    title: "11) İlgili Kişinin Hakları",
    paragraphs: [
      "Kişisel verisi işlenen kişiler, 6698 sayılı Kanun'un 11. maddesi kapsamında veri sorumlusuna başvurarak aşağıdaki haklarını kullanabilir:",
    ],
    items: [
      "Kişisel verilerinin işlenip işlenmediğini öğrenme",
      "Kişisel verileri işlenmişse buna ilişkin bilgi talep etme",
      "Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Kişisel verilerin aktarıldığı üçüncü kişileri bilme",
      "Eksik veya yanlış işlenen kişisel verilerin düzeltilmesini isteme",
      "Kanuni şartların oluşması hâlinde kişisel verilerin silinmesini veya yok edilmesini isteme",
      "Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
      "İşlenen verilerin yalnızca otomatik sistemler aracılığıyla analiz edilmesi sonucunda kişinin aleyhine bir sonucun ortaya çıkmasına itiraz etme",
      "Kişisel verilerin hukuka aykırı işlenmesi nedeniyle zarara uğranması hâlinde zararın giderilmesini talep etme",
    ],
  },
  {
    title: "11) Başvuru Yöntemi",
    paragraphs: [
      "Kişisel verilerinize ilişkin talep ve başvurularınızı, kimliğinizi ve talebinizi açıkça belirterek aşağıdaki iletişim kanallarından iletebilirsiniz.",
    ],
    items: [
      "E-posta: disfiyat360@gmail.com",
      "Konum: Beşiktaş / İstanbul",
    ],
  },
  {
    title: "11) Çocuklara Ait Veriler",
    paragraphs: [
      "Platform, esas olarak yetişkin kullanıcılar ile diş klinikleri arasında iletişim kurulmasına yönelik olarak faaliyet gösterir.",
      "18 yaşından küçük bir kişi adına talep oluşturulması gereken durumlarda işlemin veli veya yasal temsilci tarafından gerçekleştirilmesi önerilir.",
    ],
  },
  {
    title: "11) Üçüncü Taraf Bağlantılar",
    paragraphs: [
      "Platform üzerinde klinik internet sitelerine, sosyal medya hesaplarına veya başka üçüncü taraf hizmetlere yönlendiren bağlantılar bulunabilir.",
      "Üçüncü tarafların kendi internet sitelerinde gerçekleştirdiği veri işleme faaliyetleri, çerez uygulamaları ve gizlilik politikaları ilgili üçüncü tarafların sorumluluğundadır.",
    ],
  },
  {
    title: "11) Politika Değişiklikleri",
    paragraphs: [
      "Bu Gizlilik Politikası; mevzuat, platform özellikleri, hizmet sağlayıcıları veya kişisel veri işleme süreçlerinde meydana gelen değişikliklere göre güncellenebilir.",
      "Güncel politika internet sitesi üzerinden yayımlandığı tarihten itibaren geçerli olur. Önemli değişikliklerin bulunması hâlinde platform üzerinde ayrıca bilgilendirme yapılabilir.",
    ],
  },
];

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">🔐 Gizlilik Politikası</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                Gizlilik <span className="grad">Politikası</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 780,
                }}
              >
                Bu politika, DişFiyat360 hizmetlerini kullanırken
                paylaştığınız kişisel verilerin hangi amaçlarla işlendiğini,
                kimlerle paylaşılabileceğini, nasıl korunduğunu ve haklarınızı
                açıklar.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">🔒 Veri güvenliği</span>
                <span className="miniItem">📄 Şeffaf bilgilendirme</span>
                <span className="miniItem">🛡️ Kontrollü erişim</span>
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
                    {POLICY_BLOCKS.map((block) => (
                      <PolicyCard key={block.title} block={block} />
                    ))}

                    <ContactCard />
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/kvkk" className="btn btnSoft">
                  KVKK Aydınlatma Metni →
                </Link>

                <Link href="/cerez-politikasi" className="btn btnGhost">
                  Çerez Politikası →
                </Link>

                <Link href="/iletisim" className="btn btnPrimary">
                  İletişim →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PolicyCard({
  block,
}: {
  block: PolicyBlock;
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
        İletişim Bilgileri
      </h2>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gap: 7,
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.7,
        }}
      >
        <ContactRow
          label="E-posta"
          value={
            <a
              href="mailto:disfiyat360@gmail.com"
              style={contactLinkStyle}
            >
              disfiyat360@gmail.com
            </a>
          }
        />

        <ContactRow label="Konum" value="Beşiktaş / İstanbul" />

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

const contactLinkStyle: CSSProperties = {
  color: "inherit",
  fontWeight: 900,
  textDecoration: "none",
  overflowWrap: "anywhere",
};