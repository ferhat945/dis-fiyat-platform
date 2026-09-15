import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teslimat ve İade Şartları | DişFiyat360",
  description:
    "DişFiyat360 dijital kredi paketleri ve dijital hizmetlerin teslimat, aktivasyon, iptal ve iade şartları.",
  alternates: {
    canonical: "/teslimat-iade",
  },
};

type PolicySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: "1) Kapsam",
    paragraphs: [
      "Bu Teslimat ve İade Şartları, DişFiyat360 üzerinden kliniklere sunulan kredi paketleri, klinik paneli, dijital görünürlük ve diğer elektronik hizmetlerin teslimat, aktivasyon, iptal ve iade süreçlerini açıklar.",
      "DişFiyat360 üzerinden fiziksel ürün, kargo ile gönderilen ürün veya doğrudan sağlık hizmeti satışı yapılmaz.",
    ],
  },
  {
    title: "2) Platform ve İletişim",
    paragraphs: [
      "DişFiyat360 üzerinden sunulan dijital hizmetlere ilişkin genel iletişim bilgileri aşağıdadır.",
    ],
    items: [
      "E-posta: disfiyat360@gmail.com",
      "Konum: Beşiktaş / İstanbul",
      "İnternet adresi: www.disfiyat360.com",
    ],
  },
  {
    title: "3) Satılan Hizmetlerin Niteliği",
    paragraphs: [
      "DişFiyat360 üzerinden satılan ürünler, fiziksel ürün değil elektronik ortamda sunulan dijital hizmetlerdir.",
      "Satışa sunulan hizmetler; lead iletişim bilgilerini görüntülemeye yarayan kredi paketleri, süreli dijital hizmet, klinik paneli özellikleri, dijital görünürlük ve platform kullanım haklarından oluşabilir.",
      "DişFiyat360 üzerinden diş tedavisi, muayene, teşhis, reçete veya başka bir sağlık hizmeti satılmaz.",
    ],
  },
  {
    title: "4) Dijital Teslimat Yöntemi",
    paragraphs: [
      "Satın alınan hizmet fiziksel olarak kargolanmaz. Teslimat; başarılı ödeme doğrulamasından sonra kredi bakiyesinin klinik hesabına yüklenmesi,  üyeliğin aktif edilmesi veya satın alınan dijital özelliğin kullanıma açılması yoluyla elektronik ortamda gerçekleştirilir.",
      "Kredi paketi, satın alınan kredi miktarının klinik hesabında görünmesiyle teslim edilmiş sayılır.",
      "dijital hizmet, dijital hizmetin ve pakete dâhil hakların klinik hesabına tanımlanmasıyla teslim edilmiş sayılır.",
    ],
  },
  {
    title: "5) Teslimat Süresi",
    paragraphs: [
      "Dijital hizmetler, ödeme kuruluşundan başarılı ödeme bildirimi alınmasının ardından kural olarak otomatik şekilde aktive edilir.",
      "Teknik, güvenlik, kimlik veya ödeme doğrulama kontrolü gereken durumlarda teslimat makul süre içinde tamamlanır.",
      "Ödeme başarılı olduğu hâlde hizmetin hesaba tanımlanmaması durumunda klinik, destek kanallarından inceleme talep edebilir.",
    ],
  },
  {
    title: "6) Teslimat İçin Gerekli Koşullar",
    items: [
      "Aktif ve doğrulanabilir bir klinik hesabının bulunması",
      "Satın alma sırasında doğru hesap ve iletişim bilgilerinin verilmesi",
      "Ödemenin banka veya ödeme kuruluşu tarafından başarılı olarak onaylanması",
      "Gerekli sözleşme ve dijital hizmet onaylarının verilmesi",
      "İşlemin güvenlik ve mevzuat kontrollerinden geçmesi",
    ],
  },
  {
    title: "7) Hizmetin Başlangıcı",
    paragraphs: [
      "Kredilerin hesaba yüklenmesi,  üyeliğin aktive edilmesi veya dijital hizmetin erişime açılmasıyla hizmetin ifasına başlanır.",
      "Alıcının hesabına daha sonra giriş yapması veya hizmeti daha sonra kullanması, elektronik teslimatın gerçekleşmediği anlamına gelmez.",
    ],
  },
  {
    title: "8) Kredi Paketlerinin Teslimatı",
    paragraphs: [
      "Kredi paketi satın alındığında, sipariş ekranında belirtilen miktarda kredi klinik hesabına tanımlanır.",
      "Bir kredi, kliniğe yönlendirilmiş uygun bir lead kaydının iletişim bilgilerini görüntüleme hakkı sağlar.",
      "Krediler nakit para değildir, nakde çevrilemez ve aksi açıkça belirtilmedikçe başka bir hesaba devredilemez.",
    ],
  },
  {
    title: "9) Teslimat Sorunları",
    paragraphs: [
      "Ödeme başarılı olduğu hâlde hizmet hesabınıza tanımlanmadıysa ödeme tarihi, paket adı, hesap e-postası ve varsa işlem referansıyla destek birimine başvurabilirsiniz.",
      "İnceleme sonucunda ödeme doğrulanırsa hizmet aktive edilir.",
      "Hizmetin teknik veya hukuki nedenle sunulmasının mümkün olmaması hâlinde düzeltme, alternatif teslimat veya iade işlemi değerlendirilir.",
    ],
  },
  {
    title: "10) Aktivasyon Öncesi İptal",
    paragraphs: [
      "Ödeme tamamlanmış ancak satın alınan hizmet henüz klinik hesabına tanımlanmamışsa iptal talebi incelenebilir.",
      "Hizmet aktive edilmeden yapılan taleplerde ödemenin doğrulanması, işlemin başka bir hesaba tanımlanmamış olması ve teknik süreçlerin uygunluğu dikkate alınarak tam iade yapılabilir.",
    ],
  },
  {
    title: "11) Kredi Paketlerinde İade",
    paragraphs: [
      "Kredi paketi hesaba tanımlandıktan sonra hiçbir kredi kullanılmamışsa iade talebi işlemin şartlarına göre ayrıca değerlendirilebilir.",
      "Herhangi bir lead iletişim bilgisinin görüntülenmesi hâlinde ilgili kredi kullanılmış sayılır.",
      "Kullanılmış krediler ve görüntülenmiş lead iletişim bilgileri için iade yapılmaz.",
      "Kısmen kullanılan kredi paketlerinde otomatik veya zorunlu kısmi iade yapılacağı garanti edilmez.",
    ],
  },
  {
    title: "12) Lead Hizmetine İlişkin Özel Şart",
    paragraphs: [
      "Lead, bir kullanıcının belirli bir şehir ve diş hizmeti için platform üzerinden oluşturduğu iletişim veya teklif talebidir.",
      "Bir kredi, kliniğe yönlendirilmiş lead kaydının iletişim bilgilerini görüntüleme hakkı sağlar.",
      "Kullanıcının telefona cevap vermemesi, randevu oluşturmaması, farklı bir kliniği tercih etmesi, fikrini değiştirmesi veya tedavi satın almaması tek başına iade sebebi değildir.",
      "Lead; kesin hasta, kesin randevu, tedavi, satış, ciro veya gelir garantisi değildir.",
    ],
  },
  {
    title: "13) Mükerrer veya Hatalı Tahsilat",
    paragraphs: [
      "Aynı sipariş için birden fazla tahsilat yapılması, sipariş tutarından farklı bir bedel tahsil edilmesi veya ödemenin başarılı olmasına rağmen hizmetin hiç tanımlanmaması durumunda klinik destek birimine başvurabilir.",
      "Ödeme kayıtları incelendikten sonra mükerrer veya hatalı olduğu doğrulanan tutar için düzeltme ya da iade işlemi başlatılır.",
    ],
  },
  {
    title: "14) Teknik Sorunlar",
    paragraphs: [
      "Hizmet sağlayıcı kaynaklı teknik bir sorun nedeniyle satın alınan hizmetin makul süre içinde sunulamaması hâlinde öncelikle sorunun giderilmesi veya hizmet süresinin telafi edilmesi amaçlanır.",
      "Sorunun giderilememesi ve hizmetin sunulamaması hâlinde kullanılmayan hizmet bedeli için kısmi veya tam iade değerlendirilebilir.",
      "Kullanıcının cihazı, internet bağlantısı, tarayıcısı, yanlış hesap bilgileri veya üçüncü taraf hizmetlerinden kaynaklanan sorunlar hizmet sağlayıcı kaynaklı teknik hata sayılmaz.",
    ],
  },
  {
    title: "15) İade Başvurusu İçin Gereken Bilgiler",
    items: [
      "Klinik veya işletme adı",
      "Klinik hesabında kullanılan e-posta adresi",
      "Satın alınan paket veya üyeliğin adı",
      "Ödeme tarihi",
      "Ödenen tutar",
      "Varsa sipariş veya ödeme işlem referansı",
      "İptal veya iade talebinin gerekçesi",
    ],
  },
  {
    title: "16) İade Yöntemi",
    paragraphs: [
      "Kabul edilen iadeler, teknik olarak mümkün olduğu ölçüde ödemenin yapıldığı ödeme aracına gerçekleştirilir.",
      "İadenin karta veya hesaba yansıma süresi, ödeme kuruluşunun ve bankanın işlem sürelerine göre değişebilir.",
      "İade tamamlandığında ilgili kredi, üyelik süresi veya dijital kullanım hakkı klinik hesabından geri alınabilir.",
    ],
  },
  {
    title: "17) Emredici Mevzuat",
    paragraphs: [
      "Bu şartlar, tarafların statüsüne ve işlemin niteliğine göre uygulanması zorunlu olan emredici mevzuat hükümlerini ortadan kaldırmaz.",
      "Kanunen vazgeçilemeyen bir hakkın bulunması hâlinde ilgili mevzuat hükümleri öncelikle uygulanır.",
    ],
  },
];

export default function DeliveryReturnPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">📦 Teslimat ve İade Şartları</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                Dijital Teslimat ve{" "}
                <span className="grad">İade Şartları</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 820,
                }}
              >
                Kredi paketleri ve dijital hizmet fiziksel olarak
                gönderilmez. Başarılı ödeme doğrulamasından sonra klinik
                hesabına elektronik ortamda tanımlanır.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">⚡ Elektronik teslimat</span>
                <span className="miniItem">💳 Güvenli ödeme</span>
                <span className="miniItem">↩️ Şeffaf iade süreci</span>
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

                    {POLICY_SECTIONS.map((section) => (
                      <PolicyCard
                        key={section.title}
                        section={section}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link
                  href="/iptal-iade"
                  className="btn btnSoft"
                >
                  Ayrıntılı İptal ve İade Politikası →
                </Link>

                <Link
                  href="/mesafeli-satis-sozlesmesi"
                  className="btn btnGhost"
                >
                  Mesafeli Satış Sözleşmesi →
                </Link>

                <Link
                  href="/iletisim"
                  className="btn btnPrimary"
                >
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
        border: "1px solid rgba(79,70,229,0.20)",
        background:
          "linear-gradient(135deg, rgba(238,242,255,0.96), rgba(255,255,255,0.92))",
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
        Dijital Teslimat Bilgilendirmesi
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.78,
        }}
      >
        DişFiyat360 fiziksel ürün göndermez. Satın alınan kredi veya 
        üyelik hakkı, başarılı ödeme doğrulamasından sonra klinik hesabına
        elektronik ortamda tanımlanır.
      </p>
    </article>
  );
}

function PolicyCard({
  section,
}: {
  section: PolicySection;
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
        {section.title}
      </h2>

      {section.paragraphs?.map((paragraph) => (
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

      {section.items ? (
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: 20,
          }}
        >
          {section.items.map((item) => (
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