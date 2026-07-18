import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | DişFiyat360",
  description:
    "DişFiyat360 ziyaretçileri, klinik kullanıcıları, kredi paketleri ve Premium üyelik için geçerli kullanım koşulları.",
  alternates: {
    canonical: "/kullanim-kosullari",
  },
};

type TermsBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const TERMS_BLOCKS: TermsBlock[] = [
  {
    title: "1) Taraflar ve Kapsam",
    paragraphs: [
      "Bu Kullanım Koşulları, DişFiyat360 internet sitesini ziyaret eden kullanıcılar, teklif veya iletişim talebi oluşturan kişiler, platforma kayıt olan klinikler ve klinik yetkilileri için geçerlidir.",
      "Platformu ziyaret eden, form gönderen, hesap oluşturan veya ücretli bir hizmet satın alan kişiler bu koşulların ilgili bölümlerine tabi olur.",
    ],
  },
  {
    title: "2) Platform Hizmet Sağlayıcısı",
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
    title: "3) Hizmetin Konusu",
    paragraphs: [
      "DişFiyat360, diş kliniklerine yönelik dijital görünürlük, klinik profili, panel erişimi, hizmet ve şehir kapsamı yönetimi, lead yönlendirme, kredi paketi ve Premium üyelik altyapısı sunan bir B2B dijital platformdur.",
      "Ziyaretçiler, ilgilendikleri şehir ve diş hizmeti için teklif veya iletişim talebi oluşturabilir.",
    ],
  },
  {
    title: "4) Platformun Rolü",
    paragraphs: [
      "DişFiyat360 bir diş kliniği, hastane, sağlık kuruluşu veya sağlık hizmeti sağlayıcısı değildir.",
      "Platform üzerinden muayene, tıbbi teşhis, tedavi, reçete, sağlık danışmanlığı veya kesin tedavi fiyatı sunulmaz.",
      "Platform, kullanıcı taleplerinin uygun kliniklere iletilmesini ve kliniklerin dijital hizmetlerden yararlanmasını sağlayan teknolojik aracılık altyapısı sunar.",
    ],
  },
  {
    title: "5) Kliniklerin Bağımsızlığı",
    paragraphs: [
      "Platformda yer alan klinikler DişFiyat360'dan bağımsız sağlık hizmeti sağlayıcılarıdır.",
      "Kliniklerin çalışanları, hekimleri, ruhsatları, yetkileri, fiyatlandırmaları, tıbbi değerlendirmeleri, randevuları, tedavi kararları ve sağlık hizmetlerinden ilgili klinik sorumludur.",
      "Platformda yer almak, DişFiyat360 tarafından tıbbi kalite veya sonuç garantisi verildiği anlamına gelmez.",
    ],
  },
  {
    title: "6) Kullanıcı Teklif ve İletişim Talepleri",
    paragraphs: [
      "Kullanıcılar, şehir, hizmet, ad, soyad, telefon, isteğe bağlı e-posta ve mesaj bilgilerini girerek teklif veya iletişim talebi oluşturabilir.",
      "Talep, platformun dağıtım kurallarına göre bir veya birden fazla uygun klinikle paylaşılabilir.",
      "Talep oluşturulması, kullanıcının belirli bir klinikten kesin teklif alacağı, randevu oluşturacağı veya sağlık hizmeti satın alacağı anlamına gelmez.",
    ],
  },
  {
    title: "7) Klinik Hesabı",
    paragraphs: [
      "Klinik kullanıcıları, hesap oluştururken ve profil bilgilerini düzenlerken doğru, güncel ve kendilerine ait bilgileri sunmalıdır.",
      "Klinik hesabının kullanımından, hesap üzerinden gerçekleştirilen işlemlerden ve giriş bilgilerinin güvenliğinden ilgili klinik sorumludur.",
      "Yetkisiz kullanım şüphesi hâlinde DişFiyat360 ile gecikmeden iletişime geçilmelidir.",
    ],
  },
  {
    title: "8) Klinik Profil Bilgileri",
    items: [
      "Klinik adı ve iletişim bilgilerinin doğru tutulması",
      "Adres, telefon ve internet sitesi bilgilerinin güncel olması",
      "Hizmet ve şehir kapsamlarının gerçeğe uygun seçilmesi",
      "Yetkisiz veya yanıltıcı sağlık beyanlarının yayımlanmaması",
      "Üçüncü kişilere ait içeriklerin izinsiz kullanılmaması",
      "Mevzuata aykırı reklam ve tanıtım ifadelerinden kaçınılması",
    ],
  },
  {
    title: "9) Kredi Paketleri",
    paragraphs: [
      "Kredi paketleri, klinik hesabına tanımlanan dijital kullanım haklarıdır.",
      "Bir kredi, kliniğe yönlendirilmiş uygun bir leadin iletişim bilgilerini görüntüleme hakkı sağlar.",
      "Krediler nakit para değildir, nakit karşılığı kullanılamaz, başka hesaplara devredilemez ve aksi açıkça belirtilmedikçe süresiz bir mali değer oluşturmaz.",
    ],
  },
  {
    title: "10) Premium Üyelik",
    paragraphs: [
      "Premium üyelik, satın alma sırasında belirtilen süre boyunca uygun lead dağıtımlarında standart kliniklere göre öncelik ve açıklanan diğer dijital avantajları sağlar.",
      "Premium üyelik belirli sayıda lead, yalnızca tek kliniğe yönlendirilen lead, kesin hasta, kesin randevu veya gelir garantisi sağlamaz.",
      "Premium üyeliğin kapsamı, süresi ve ücreti satın alma ekranında gösterilen bilgilere göre belirlenir.",
    ],
  },
  {
    title: "11) Leadlerin Niteliği",
    paragraphs: [
      "Lead, platform üzerinden iletişim veya teklif talebi oluşturan bir kullanıcı kaydıdır.",
      "Kullanıcının telefonunun kapalı olması, çağrıya yanıt vermemesi, yanlış veya eksik bilgi sunması, fikrini değiştirmesi ya da farklı bir kliniği tercih etmesi mümkündür.",
      "Lead yönlendirilmesi, kliniğin hasta kazanacağı veya gelir elde edeceği anlamına gelmez.",
    ],
  },
  {
    title: "12) Kliniklerin Lead Verilerini Kullanması",
    items: [
      "Lead bilgileri yalnızca ilgili kullanıcının talebine dönüş yapmak için kullanılmalıdır.",
      "Kullanıcıya talep etmediği hizmetler için sürekli veya rahatsız edici iletişim kurulamaz.",
      "Lead bilgileri yetkisiz üçüncü kişilerle paylaşılamaz.",
      "Kişisel veriler platform dışı veri tabanlarına hukuka aykırı şekilde aktarılamaz.",
      "Kullanıcının iletişim tercihleri ve kişisel verilerin korunması kurallarına uyulmalıdır.",
      "Klinik, kendi gerçekleştirdiği kişisel veri işleme faaliyetlerinden sorumludur.",
    ],
  },
  {
    title: "13) Fiyat Bilgilendirmeleri",
    paragraphs: [
      "Platformda yayımlanan fiyat aralıkları, açıklamalar ve içerikler genel bilgilendirme amacı taşır.",
      "Kesin fiyat; muayene, tedavi planı, hastanın durumu, kullanılan malzeme, ek işlemler ve ilgili kliniğin fiyat politikasına göre değişebilir.",
      "Kesin tedavi bedeli ve ödeme koşulları kullanıcı ile ilgili klinik arasında belirlenir.",
    ],
  },
  {
    title: "14) Ödemeler",
    paragraphs: [
      "Kredi paketi veya Premium üyelik ödemeleri, banka, sanal POS veya ödeme hizmeti sağlayıcısı üzerinden gerçekleştirilebilir.",
      "Kullanıcı, ödeme öncesinde paket kapsamını ve toplam bedeli kontrol etmekle sorumludur.",
      "Kart bilgileri, kullanılan ödeme altyapısına bağlı olarak banka veya ödeme hizmeti sağlayıcısının güvenli sistemlerinde işlenebilir.",
    ],
  },
  {
    title: "15) Yasaklı Kullanımlar",
    items: [
      "Yanlış, sahte veya başkasına ait bilgilerle hesap oluşturmak",
      "Sahte veya kötü niyetli teklif talebi göndermek",
      "Platform güvenliğini ihlal etmeye çalışmak",
      "Yetkisiz erişim, veri çekme veya otomatik sorgulama yapmak",
      "Bot, zararlı yazılım veya saldırı araçları kullanmak",
      "Lead bilgilerini satmak veya izinsiz aktarmak",
      "Kullanıcıları yanıltıcı veya hukuka aykırı biçimde yönlendirmek",
      "Platformu mevzuata veya üçüncü kişi haklarına aykırı kullanmak",
      "DişFiyat360 markasını izinsiz veya yanıltıcı şekilde kullanmak",
    ],
  },
  {
    title: "16) Hesabın Askıya Alınması",
    paragraphs: [
      "Kullanım koşullarının ihlal edilmesi, güvenlik riski oluşması, yanıltıcı bilgi verilmesi, kişisel verilerin amacı dışında kullanılması veya hukuka aykırı faaliyet şüphesi bulunması hâlinde hesap geçici olarak askıya alınabilir.",
      "Ciddi veya tekrarlanan ihlallerde hesap kapatılabilir ve platform erişimi sınırlandırılabilir.",
      "Gerekli durumlarda kullanıcıdan veya klinikten ek bilgi ve doğrulama talep edilebilir.",
    ],
  },
  {
    title: "17) Hizmetin Kullanılabilirliği",
    paragraphs: [
      "DişFiyat360, hizmetin güvenli ve düzenli şekilde çalışması için makul çaba gösterir.",
      "Bakım, güncelleme, güvenlik müdahalesi, internet kesintisi, veri merkezi sorunu veya üçüncü taraf hizmet kesintisi nedeniyle platform geçici olarak kullanılamayabilir.",
      "Platformun her zaman kesintisiz, hatasız veya tüm cihazlarla uyumlu çalışacağı garanti edilmez.",
    ],
  },
  {
    title: "18) Üçüncü Taraf Hizmetler ve Bağlantılar",
    paragraphs: [
      "Platformda klinik internet sitelerine, sosyal medya hesaplarına, banka veya ödeme sayfalarına ve diğer üçüncü taraf hizmetlere bağlantılar bulunabilir.",
      "Üçüncü tarafların içerikleri, hizmetleri, güvenlik uygulamaları veya kişisel veri işleme faaliyetleri ilgili üçüncü tarafın sorumluluğundadır.",
    ],
  },
  {
    title: "19) Fikri Mülkiyet Hakları",
    paragraphs: [
      "DişFiyat360 adı, logosu, tasarımı, yazılımı, veri tabanı yapısı, metinleri ve özgün içerikleri üzerindeki haklar, aksi açıkça belirtilmedikçe hak sahibine aittir.",
      "İçerikler yazılı izin olmadan kopyalanamaz, çoğaltılamaz, yeniden yayımlanamaz, satılamaz veya ticari bir hizmette kullanılamaz.",
    ],
  },
  {
    title: "20) Kullanıcı İçerikleri",
    paragraphs: [
      "Kullanıcı veya klinik tarafından platforma eklenen profil, açıklama, bağlantı, görsel ve diğer içeriklerin hukuka uygunluğundan içeriği sağlayan kişi sorumludur.",
      "Üçüncü kişilerin fikri mülkiyet, kişilik veya gizlilik haklarını ihlal eden içerikler kaldırılabilir.",
    ],
  },
  {
    title: "21) Kişisel Veriler",
    paragraphs: [
      "Kişisel veriler, KVKK Aydınlatma Metni, Gizlilik Politikası ve Çerez Politikası kapsamında işlenir.",
      "Kliniklerin kendilerine yönlendirilen kullanıcı verileri üzerinde gerçekleştirdiği bağımsız işlemler bakımından ilgili kliniğin ayrıca hukuki sorumluluğu bulunabilir.",
    ],
  },
  {
    title: "22) Sorumluluğun Sınırı",
    paragraphs: [
      "DişFiyat360, kliniklerin sunduğu sağlık hizmetlerinin sonucu, kalitesi, fiyatı, randevu süreci, çalışanları veya kullanıcıyla kurduğu ilişkiden sorumlu değildir.",
      "Platform, kullanıcı veya klinik tarafından sağlanan bilgilerin her durumda doğru ve güncel olduğunu garanti etmez.",
      "Emredici mevzuattan doğan sorumluluklar saklı olmak üzere, dolaylı zararlar, gelir kaybı, beklenen kazanç veya ticari fırsat kaybı bakımından sorumluluk kabul edilmez.",
    ],
  },
  {
    title: "23) Değişiklikler",
    paragraphs: [
      "DişFiyat360, hizmetlerini ve bu Kullanım Koşullarını mevzuat, iş modeli veya teknik gereklilikler doğrultusunda güncelleyebilir.",
      "Güncel koşullar internet sitesinde yayımlandığı tarihten itibaren geçerli olur.",
    ],
  },
  {
    title: "24) İletişim",
    paragraphs: [
      "Bu Kullanım Koşulları hakkında soru veya taleplerinizi ferhatmenekse945@gmail.com adresine iletebilir veya 0531 917 17 39 numaralı telefondan iletişime geçebilirsiniz.",
    ],
  },
];

export default function TermsPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">📘 Kullanım Koşulları</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                Kullanım <span className="grad">Koşulları</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 780,
                }}
              >
                Bu koşullar, DişFiyat360 platformunu kullanan ziyaretçiler,
                teklif talebi oluşturan kullanıcılar ve klinik hesapları için
                geçerli temel kuralları açıklar.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">📄 Şeffaf kullanım şartları</span>
                <span className="miniItem">🏢 B2B dijital hizmet</span>
                <span className="miniItem">🔒 Güvenli platform</span>
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

                    {TERMS_BLOCKS.map((block) => (
                      <TermsCard key={block.title} block={block} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/hakkimizda" className="btn btnSoft">
                  Hakkımızda →
                </Link>

                <Link href="/iptal-iade" className="btn btnGhost">
                  İptal ve İade →
                </Link>

                <Link
                  href="/mesafeli-satis-sozlesmesi"
                  className="btn btnPrimary"
                >
                  Mesafeli Satış →
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
        DişFiyat360 sağlık hizmeti sunmaz. Platform üzerinden yönlendirilen
        kullanıcı talepleri kesin hasta, randevu, tedavi veya gelir garantisi
        oluşturmaz.
      </p>
    </article>
  );
}

function TermsCard({
  block,
}: {
  block: TermsBlock;
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