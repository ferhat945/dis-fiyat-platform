import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası | DişFiyat360",
  description:
    "DişFiyat360 kredi paketleri, Premium üyelik ve diğer dijital hizmetlere ilişkin iptal ve iade esasları.",
  alternates: {
    canonical: "/iptal-iade",
  },
};

type PolicyBlock = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const POLICY_BLOCKS: PolicyBlock[] = [
  {
    title: "1) Politikanın Kapsamı",
    paragraphs: [
      "Bu İptal ve İade Politikası, DişFiyat360 üzerinden kliniklere sunulan kredi paketleri, Premium üyelik, panel erişimi, dijital görünürlük ve diğer çevrim içi hizmetlere ilişkin iptal, inceleme ve iade esaslarını açıklar.",
      "DişFiyat360 üzerinden fiziksel ürün veya doğrudan sağlık hizmeti satışı yapılmaz.",
    ],
  },
  {
    title: "2) Satıcı ve Hizmet Sağlayıcı Bilgileri",
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
    title: "3) Hizmetlerin Niteliği",
    paragraphs: [
      "Kredi paketleri, klinik panelinde kliniğe yönlendirilmiş uygun kullanıcı taleplerinin iletişim bilgilerini görüntülemek için kullanılabilen dijital kullanım haklarıdır.",
      "Premium üyelik, satın alma sırasında belirtilen üyelik süresi boyunca uygun lead dağıtımlarında standart kliniklere göre öncelik ve ilan edilen diğer dijital avantajları sağlar.",
      "Satın alınan hizmetler kesin hasta, randevu, tedavi, satış, ciro veya gelir garantisi içermez.",
    ],
  },
  {
    title: "4) Sipariş Öncesi Bilgilendirme",
    paragraphs: [
      "Klinik, ödeme işlemini tamamlamadan önce satın aldığı paketin adı, kapsamı, kredi miktarı, üyelik süresi, toplam bedeli, aktivasyon şekli ve yenileme koşulları hakkında bilgilendirilir.",
      "Ödeme işleminin tamamlanması, sipariş sırasında gösterilen paket bilgilerinin ve uygulanabilir sözleşme metinlerinin kabul edildiği anlamına gelir.",
    ],
  },
  {
    title: "5) İptal ve Cayma Koşulları",
    paragraphs: [
      "Satın alınan kredi paketi veya Premium üyelik henüz klinik hesabına tanımlanmamış ve hizmet kullanıma sunulmamışsa, klinik satın alma tarihinden itibaren 14 gün içinde yazılı olarak iptal ve iade talebinde bulunabilir.",
      "Kredi paketinin veya Premium üyeliğin klinik hesabına tanımlanarak hizmetin kullanıma sunulması ve kliniğin hizmetten yararlanmaya başlaması hâlinde cayma hakkı sona erer. Kullanılmış krediler, görüntülenmiş leadler ve kullanılmış dijital hizmet hakları için iptal veya iade yapılmaz.",
      "İptal ve iade talepleri ferhatmenekse945@gmail.com adresine yazılı olarak iletilmelidir.",
    ],
  },
  {
    title: "6) Kredi Paketinin Aktive Edilmesi",
    paragraphs: [
      "Satın alınan kredi paketi klinik hesabına tanımlandığında dijital hizmet kullanıma sunulmuş sayılır.",
      "Kredi bakiyesinden herhangi bir lead iletişim bilgisinin görüntülenmesi veya kredi kullanılmasını gerektiren başka bir işlemin yapılması hâlinde hizmetten yararlanılmış kabul edilir.",
      "Kullanılmış krediler, görüntülenmiş leadler veya kullanılmış dijital haklar için iade yapılmaz.",
    ],
  },
  {
    title: "7) Kullanılmamış Kredi Bakiyesi",
    paragraphs: [
      "Kredi paketi hesaba tanımlandıktan sonra hiç kredi kullanılmamışsa, iade talebi işlemin özel koşullarına göre ayrıca değerlendirilebilir.",
      "Teknik aktivasyonun gerçekleşmiş olması, kampanya avantajı kullanılması, pakete bağlı ek hizmetlerin sunulması veya satın alma sırasında hizmetin derhâl başlatılmasının onaylanması değerlendirmede dikkate alınabilir.",
      "Kısmen kullanılmış paketlerde kullanılan haklar düşülerek otomatik veya zorunlu kısmi iade yapılacağı garanti edilmez.",
    ],
  },
  {
    title: "8) Premium Üyeliğin Aktive Edilmesi",
    paragraphs: [
      "Premium üyelik, klinik hesabında Premium statüsünün aktif hâle getirilmesiyle başlar.",
      "Premium üyeliğin aktif edildiği ve kliniğin Premium avantajlarından yararlanmaya başladığı durumlarda hizmet kullanıma sunulmuş sayılır.",
      "Üyelik süresinin bir bölümünün kullanılmamış olması tek başına orantılı veya otomatik iade hakkı oluşturmaz.",
    ],
  },
  {
    title: "9) Otomatik Yenileme",
    paragraphs: [
      "DişFiyat360 üzerinde aksi açıkça belirtilmedikçe kredi paketleri ve Premium üyelikler otomatik olarak yenilenmez.",
      "Yeni dönem veya ek kredi paketi için klinik tarafından yeni bir satın alma işlemi gerçekleştirilmesi gerekir.",
      "İleride otomatik yenileme özelliği sunulması hâlinde yenileme, iptal ve ödeme koşulları satın alma öncesinde ayrıca açıklanır.",
    ],
  },
  {
    title: "10) Lead Hizmetlerine İlişkin Esaslar",
    paragraphs: [
      "Lead, bir kullanıcının belirli bir şehir ve diş hizmeti için iletişim veya teklif talebi oluşturmasıdır.",
      "Bir kredinin kullanılması, kliniğe yönlendirilmiş leadin iletişim bilgilerinin görüntülenmesi hakkını sağlar.",
      "Kullanıcının telefona cevap vermemesi, randevu oluşturmaması, tedavi satın almaması, farklı bir kliniği tercih etmesi veya iletişim talebinden vazgeçmesi tek başına iade sebebi değildir.",
      "Açıkça hatalı, sistem tarafından mükerrer oluşturulmuş veya teknik sorun nedeniyle kullanılamaz olduğu doğrulanan kayıtlar ayrıca incelenebilir.",
    ],
  },
  {
    title: "11) Teknik Sorunlar",
    paragraphs: [
      "Satıcı kaynaklı teknik bir sorun nedeniyle satın alınan hizmetin makul süre içinde kullanıma sunulamaması hâlinde, öncelikle sorunun giderilmesi veya hizmet süresinin telafi edilmesi amaçlanır.",
      "Sorunun giderilememesi ve hizmetin sunulamaması hâlinde, kullanılmayan hizmet bedeli için kısmi veya tam iade değerlendirilebilir.",
      "Kullanıcının cihazı, internet bağlantısı, tarayıcı ayarları, yanlış hesap bilgileri veya üçüncü taraf hizmetlerinden kaynaklanan sorunlar satıcı kaynaklı teknik hata olarak değerlendirilmez.",
    ],
  },
  {
    title: "12) Mükerrer veya Hatalı Tahsilat",
    paragraphs: [
      "Aynı sipariş için birden fazla tahsilat yapılması, sipariş tutarından farklı bir bedel alınması veya ödemenin başarılı olmasına rağmen hizmetin hiç tanımlanmaması durumunda kullanıcı destek birimine başvurabilir.",
      "Ödeme kayıtları incelendikten sonra fazla veya hatalı tahsil edildiği doğrulanan tutar için düzeltme veya iade işlemi başlatılır.",
    ],
  },
  {
    title: "13) Kampanyalı ve İndirimli Satışlar",
    paragraphs: [
      "Kampanya, kupon, indirim veya özel fiyatla satın alınan hizmetlerde iade değerlendirmesi, fiilen ödenen tutar üzerinden yapılır.",
      "Kampanya kapsamında ücretsiz verilen krediler, ek süreler veya promosyon hakları nakde çevrilemez ve bunlar için ayrıca iade yapılmaz.",
    ],
  },
  {
    title: "14) Hesabın Askıya Alınması veya Kapatılması",
    paragraphs: [
      "Klinik hesabının yanıltıcı bilgi, hukuka aykırı kullanım, kişisel verilerin amacı dışında kullanılması, platform güvenliğinin ihlali, yetkisiz erişim girişimi veya kullanım koşullarının ciddi şekilde ihlal edilmesi nedeniyle askıya alınması ya da kapatılması hâlinde kullanılmayan hizmetler için iade yapılmayabilir.",
      "Yanlışlıkla uygulandığı düşünülen hesap işlemleri için klinik, destek kanalları üzerinden inceleme talep edebilir.",
    ],
  },
  {
    title: "15) İade Başvurusu",
    paragraphs: [
      "İptal veya iade talebinin incelenebilmesi için talebin yazılı olarak iletilmesi önerilir.",
    ],
    items: [
      "Klinik veya hesap adı",
      "Satın alma işleminde kullanılan e-posta adresi",
      "Ödeme tarihi",
      "Satın alınan paket veya üyelik",
      "Ödenen tutar",
      "Varsa sipariş veya ödeme referansı",
      "İptal veya iade talebinin gerekçesi",
    ],
  },
  {
    title: "16) Başvuru Kanalları",
    items: [
      "E-posta: ferhatmenekse945@gmail.com",
      "Telefon: 0531 917 17 39",
      "Adres: Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana",
    ],
  },
  {
    title: "17) İade Yöntemi",
    paragraphs: [
      "İade talebinin kabul edilmesi hâlinde iade işlemi, talebin onaylanmasından itibaren en geç 14 gün içinde başlatılır ve teknik olarak mümkün olduğu ölçüde ödemenin gerçekleştirildiği ödeme yöntemine yapılır.",
      "Bankaların, kart kuruluşlarının veya ödeme altyapılarının işlem süreleri nedeniyle iade tutarının karta veya hesaba yansıması ayrıca zaman alabilir.",
      "İade işlemi tamamlandığında, iade edilen işleme ilişkin kullanılmamış kredi bakiyesi, Premium üyelik süresi veya diğer ilgili dijital kullanım hakları klinik hesabından geri alınabilir.",
    ],
  },
  {
    title: "18) Emredici Mevzuat",
    paragraphs: [
      "Bu politika, tarafların statüsüne ve işlemin niteliğine göre uygulanması zorunlu olan emredici mevzuat hükümlerini ortadan kaldırmaz.",
      "Kanunen vazgeçilemeyen bir hakkın bulunması hâlinde ilgili mevzuat hükümleri öncelikle uygulanır.",
    ],
  },
  {
    title: "19) Politika Değişiklikleri",
    paragraphs: [
      "Bu politika, hizmet modelinde, ödeme altyapısında veya ilgili süreçlerde meydana gelen değişikliklere göre güncellenebilir.",
      "Güncel politika internet sitesinde yayımlandığı tarihten itibaren geçerli olur.",
    ],
  },
];

export default function RefundPolicyPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">↩️ İptal ve İade Politikası</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                İptal ve <span className="grad">İade Politikası</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 780,
                }}
              >
                Bu politika, DişFiyat360 üzerinden sunulan kredi paketleri,
                Premium üyelik, panel erişimi ve diğer dijital hizmetlere
                ilişkin iptal ve iade süreçlerini açıklar.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">💳 Güvenli ödeme süreci</span>
                <span className="miniItem">📄 Şeffaf koşullar</span>
                <span className="miniItem">🔍 Talep incelemesi</span>
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

                    {POLICY_BLOCKS.map((block) => (
                      <PolicyCard key={block.title} block={block} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/teslimat-iade" className="btn btnSoft">
                  Teslimat ve İade Şartları →
                </Link>

                <Link 
                  href="/mesafeli-satis-sozlesmesi"
                  className="btn btnGhost"
                >
                  Mesafeli Satış Sözleşmesi →
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
        Lead, kesin hasta veya randevu anlamına gelmez. Bir kredi, kliniğe
        yönlendirilmiş kullanıcı talebinin iletişim bilgilerini görüntüleme
        hakkı sağlar. Kullanıcının kliniği tercih etmesi veya sağlık hizmeti
        satın alması garanti edilmez.
      </p>
    </article>
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