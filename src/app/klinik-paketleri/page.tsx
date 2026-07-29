import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Klinik Paketleri ve Fiyatlandırma | DişFiyat360",
  description:
    "DişFiyat360 klinik kredi paketleri, Premium üyelik, fiyatlandırma, dijital hizmet teslimi ve kullanım koşulları.",
  alternates: {
    canonical: "/klinik-paketleri",
  },
};

type PackageCard = {
  title: string;
  price: string;
  description: string;
  badge: string;
  icon: string;
  features: string[];
  featured?: boolean;
};

const packages: PackageCard[] = [
  {
    title: "5 Kredi Paketi",
    price: "1.500 TL",
    description:
      "DişFiyat360 hizmetini kullanmaya başlamak isteyen klinikler için tek seferlik dijital kredi paketi.",
    badge: "Başlangıç",
    icon: "💎",
    features: [
      "5 potansiyel hasta talebinin iletişim bilgilerine erişim",
      "Tek seferlik satın alma",
      "Abonelik zorunluluğu yoktur",
      "Krediler hesaba tanımlandıktan sonra kullanılabilir",
      "Otomatik yenileme yapılmaz",
    ],
  },
  {
    title: "10 Kredi Paketi",
    price: "2.000 TL",
    description:
      "Düzenli talep görüntülemek isteyen klinikler için hazırlanmış tek seferlik kredi paketi.",
    badge: "En Popüler",
    icon: "⚡",
    featured: true,
    features: [
      "10 potansiyel hasta talebinin iletişim bilgilerine erişim",
      "5 kredi paketine göre daha avantajlı birim maliyet",
      "Tek seferlik satın alma",
      "Krediler hesaba tanımlandıktan sonra kullanılabilir",
      "Otomatik yenileme yapılmaz",
    ],
  },
  {
    title: "25 Kredi Paketi",
    price: "4.000 TL",
    description:
      "Daha yoğun talep erişimi ihtiyacı bulunan klinikler için yüksek bakiyeli kredi paketi.",
    badge: "En Avantajlı",
    icon: "🚀",
    features: [
      "25 potansiyel hasta talebinin iletişim bilgilerine erişim",
      "Paketler arasındaki en düşük birim maliyet",
      "Tek seferlik satın alma",
      "Krediler hesaba tanımlandıktan sonra kullanılabilir",
      "Otomatik yenileme yapılmaz",
    ],
  },
  {
    title: "Premium Üyelik",
    price: "2.500 TL / 30 gün",
    description:
      "30 günlük Premium üyelik, 10 kredi ve uygun talep dağıtımlarında öncelik sağlayan dijital hizmet paketi.",
    badge: "Premium",
    icon: "👑",
    features: [
      "Üyelik başlangıcında 10 kredi",
      "30 günlük Premium üyelik süresi",
      "Uygun talep dağıtımlarında standart kliniklere göre öncelik",
      "Belirli sayıda talep veya hasta garantisi verilmez",
      "Otomatik yenileme yapılmaz",
    ],
  },
];

export default function ClinicPackagesPage(): JSX.Element {
  return (
    <main className="packagesPage">
      <style>{`
        .packagesPage {
          min-height: 100vh;
          padding: 28px 16px 72px;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(99, 102, 241, 0.16),
              transparent 34%
            ),
            radial-gradient(
              circle at 100% 10%,
              rgba(14, 165, 233, 0.12),
              transparent 34%
            ),
            #f8fafc;
        }

        .packagesContainer {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .topBar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .backLink {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: rgba(255, 255, 255, 0.8);
          color: #0f172a;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .publicBadge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(34, 197, 94, 0.2);
          background: rgba(34, 197, 94, 0.08);
          color: #166534;
          font-size: 12px;
          font-weight: 900;
        }

        .hero {
          position: relative;
          overflow: hidden;
          padding: 42px;
          border-radius: 34px;
          color: white;
          background:
            radial-gradient(
              circle at 0% 0%,
              rgba(56, 189, 248, 0.3),
              transparent 36%
            ),
            radial-gradient(
              circle at 100% 10%,
              rgba(168, 85, 247, 0.32),
              transparent 38%
            ),
            linear-gradient(135deg, #0f172a, #312e81);
          box-shadow: 0 35px 100px rgba(30, 41, 59, 0.22);
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          right: -120px;
          bottom: -180px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          filter: blur(2px);
        }

        .heroInner {
          position: relative;
          z-index: 1;
          max-width: 900px;
        }

        .heroKicker {
          display: inline-flex;
          padding: 9px 13px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.1);
          font-size: 12px;
          font-weight: 900;
        }

        .heroTitle {
          margin: 20px 0 0;
          max-width: 850px;
          font-size: clamp(38px, 6vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.055em;
          font-weight: 1000;
        }

        .heroDesc {
          max-width: 830px;
          margin: 20px 0 0;
          font-size: 16px;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.84);
          font-weight: 700;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .primaryButton,
        .secondaryButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 12px 18px;
          border-radius: 16px;
          font-weight: 950;
          text-decoration: none;
        }

        .primaryButton {
          background: white;
          color: #1e1b4b;
        }

        .secondaryButton {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .section {
          margin-top: 26px;
        }

        .sectionHead {
          margin-bottom: 16px;
        }

        .sectionTitle {
          margin: 0;
          color: #0f172a;
          font-size: clamp(27px, 4vw, 40px);
          letter-spacing: -0.04em;
          font-weight: 1000;
        }

        .sectionDesc {
          max-width: 850px;
          margin-top: 8px;
          color: rgba(15, 23, 42, 0.66);
          font-size: 14px;
          line-height: 1.75;
          font-weight: 750;
        }

        .packageGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .packageCard {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 22px;
          border-radius: 28px;
          border: 1px solid rgba(15, 23, 42, 0.09);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 22px 65px rgba(15, 23, 42, 0.08);
        }

        .packageCard.featured {
          border-color: rgba(79, 70, 229, 0.3);
          box-shadow: 0 28px 75px rgba(79, 70, 229, 0.15);
          transform: translateY(-5px);
        }

        .packageTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .packageIcon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          background: rgba(79, 70, 229, 0.08);
          font-size: 28px;
        }

        .packageBadge {
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.08);
          color: #4338ca;
          font-size: 11px;
          font-weight: 1000;
        }

        .packageTitle {
          margin-top: 18px;
          color: #0f172a;
          font-size: 22px;
          letter-spacing: -0.025em;
          font-weight: 1000;
        }

        .packagePrice {
          margin-top: 8px;
          color: #4338ca;
          font-size: 26px;
          letter-spacing: -0.035em;
          font-weight: 1000;
        }

        .packageDesc {
          margin-top: 10px;
          min-height: 88px;
          color: rgba(15, 23, 42, 0.66);
          font-size: 13px;
          line-height: 1.65;
          font-weight: 750;
        }

        .featureList {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .featureItem {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: rgba(15, 23, 42, 0.8);
          font-size: 12px;
          line-height: 1.55;
          font-weight: 850;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .infoCard {
          padding: 24px;
          border-radius: 26px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.06);
        }

        .infoCardTitle {
          color: #0f172a;
          font-size: 20px;
          letter-spacing: -0.025em;
          font-weight: 1000;
        }

        .infoCardText {
          margin-top: 10px;
          color: rgba(15, 23, 42, 0.7);
          font-size: 13px;
          line-height: 1.8;
          font-weight: 750;
        }

        .importantBox {
          padding: 26px;
          border-radius: 28px;
          border: 1px solid rgba(245, 158, 11, 0.24);
          background: rgba(255, 251, 235, 0.92);
          color: #78350f;
          box-shadow: 0 20px 55px rgba(120, 53, 15, 0.06);
        }

        .importantTitle {
          font-size: 21px;
          letter-spacing: -0.025em;
          font-weight: 1000;
        }

        .importantText {
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.85;
          font-weight: 800;
        }

        .paymentBox {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 24px;
          align-items: center;
          padding: 26px;
          border-radius: 28px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: white;
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.07);
        }

        .paymentTitle {
          color: #0f172a;
          font-size: 22px;
          letter-spacing: -0.03em;
          font-weight: 1000;
        }

        .paymentText {
          margin-top: 10px;
          color: rgba(15, 23, 42, 0.68);
          font-size: 13px;
          line-height: 1.8;
          font-weight: 750;
        }

        .paymentLogoBox {
          padding: 16px;
          border-radius: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          text-align: center;
        }

        .paymentLogo {
          width: 100%;
          max-width: 280px;
          height: auto;
          object-fit: contain;
        }

        .legalGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .legalLink {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 12px;
          border-radius: 17px;
          border: 1px solid rgba(15, 23, 42, 0.09);
          background: rgba(255, 255, 255, 0.88);
          color: #0f172a;
          text-align: center;
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
        }

        .companyBox {
          padding: 24px;
          border-radius: 26px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.9);
          color: rgba(15, 23, 42, 0.78);
          font-size: 13px;
          line-height: 1.8;
          font-weight: 750;
        }

        .companyBox strong {
          color: #0f172a;
        }

        .bottomCta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          padding: 28px;
          border-radius: 28px;
          color: white;
          background: linear-gradient(135deg, #4338ca, #7c3aed);
          box-shadow: 0 25px 70px rgba(79, 70, 229, 0.22);
        }

        .bottomCtaTitle {
          font-size: 24px;
          letter-spacing: -0.03em;
          font-weight: 1000;
        }

        .bottomCtaText {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 13px;
          line-height: 1.65;
          font-weight: 750;
        }

        @media (max-width: 1000px) {
          .packageGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .legalGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .paymentBox {
            grid-template-columns: 1fr;
          }

          .paymentLogoBox {
            max-width: 380px;
          }
        }

        @media (max-width: 650px) {
          .packagesPage {
            padding-left: 12px;
            padding-right: 12px;
          }

          .hero {
            padding: 28px 20px;
            border-radius: 26px;
          }

          .packageGrid,
          .infoGrid,
          .legalGrid {
            grid-template-columns: 1fr;
          }

          .packageCard.featured {
            transform: none;
          }

          .packageDesc {
            min-height: auto;
          }
        }
      `}</style>

      <div className="packagesContainer">
        <div className="topBar">
          <Link href="/" className="backLink">
            ← Ana Sayfaya Dön
          </Link>

          <span className="publicBadge">
            🌐 Giriş yapmadan görüntülenebilir
          </span>
        </div>

        <section className="hero">
          <div className="heroInner">
            <div className="heroKicker">
              🏥 Kliniklere özel dijital platform hizmetleri
            </div>

            <h1 className="heroTitle">
              Klinik Paketleri ve Dijital Hizmet Koşulları
            </h1>

            <p className="heroDesc">
              DişFiyat360, diş kliniklerinin potansiyel hasta taleplerine
              erişebilmesini sağlayan dijital bir platformdur. Platform
              üzerinden hasta, randevu veya tedavi satışı yapılmaz. Klinikler,
              kendilerine yönlendirilen uygun taleplerin iletişim bilgilerini
              görüntülemek için kredi kullanır.
            </p>

            <div className="heroActions">
              <Link href="/klinik-basvuru" className="primaryButton">
                Klinik Başvurusu Yap →
              </Link>

              <Link href="/iletisim" className="secondaryButton">
                İletişime Geç
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <h2 className="sectionTitle">Paketler ve Güncel Fiyatlar</h2>

            <div className="sectionDesc">
              Aşağıdaki fiyatlar DişFiyat360 tarafından sunulan dijital
              platform hizmetlerine aittir. Kredi paketleri tek seferliktir.
              Premium üyelik 30 günlüktür ve otomatik olarak yenilenmez.
            </div>
          </div>

          <div className="packageGrid">
            {packages.map((item) => (
              <article
                className={`packageCard ${
                  item.featured ? "featured" : ""
                }`}
                key={item.title}
              >
                <div className="packageTop">
                  <div className="packageIcon">{item.icon}</div>
                  <div className="packageBadge">{item.badge}</div>
                </div>

                <div className="packageTitle">{item.title}</div>
                <div className="packagePrice">{item.price}</div>
                <div className="packageDesc">{item.description}</div>

                <div className="featureList">
                  {item.features.map((feature) => (
                    <div className="featureItem" key={feature}>
                      <span>✅</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="importantBox">
            <div className="importantTitle">
              Önemli: Kredi ne sağlar?
            </div>

            <div className="importantText">
              Bir kredi, kliniğe yönlendirilmiş bir potansiyel hasta talebinin
              iletişim bilgilerine erişim hakkı sağlar. Talep sahibinin
              telefonunu yanıtlaması, kliniğe dönüş yapması, randevu
              oluşturması, muayeneye gelmesi, tedaviye başlaması, kliniği
              tercih etmesi veya kliniğin gelir elde etmesi garanti edilmez.
              DişFiyat360 kesin hasta, randevu, tedavi, satış veya gelir
              garantisi sunmaz.
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <h2 className="sectionTitle">
              Hizmetin Kapsamı ve Teslimi
            </h2>
          </div>

          <div className="infoGrid">
            <article className="infoCard">
              <div className="infoCardTitle">
                Kredi paketlerinin teslimi
              </div>

              <div className="infoCardText">
                Kredi paketlerinde dijital hizmet, başarılı ödeme
                doğrulamasından sonra satın alınan kredi bakiyesinin klinik
                hesabına tanımlanması ve panelde kullanılabilir hâle
                gelmesiyle teslim edilmiş sayılır.
              </div>
            </article>

            <article className="infoCard">
              <div className="infoCardTitle">
                Premium üyeliğin başlangıcı
              </div>

              <div className="infoCardText">
                Premium üyelik, başarılı ödeme doğrulamasından sonra Premium
                statüsünün etkinleştirilmesi, 30 günlük sürenin başlatılması
                ve paket kapsamındaki 10 kredinin klinik hesabına
                tanımlanmasıyla başlar.
              </div>
            </article>

            <article className="infoCard">
              <div className="infoCardTitle">
                Kredilerin kullanılması
              </div>

              <div className="infoCardText">
                Hesaba tanımlanan kredilerin ne zaman ve hangi uygun talep
                için kullanılacağı klinik kullanıcısının tercihine bağlıdır.
                Kredilerin hemen kullanılmaması, dijital hizmetin teslim
                edilmediği anlamına gelmez.
              </div>
            </article>

            <article className="infoCard">
              <div className="infoCardTitle">
                Premium dağıtım önceliği
              </div>

              <div className="infoCardText">
                Premium üyelik, uygun talep dağıtımlarında standart
                kliniklere göre öncelik sağlar. Bu öncelik münhasır talep,
                belirli sayıda talep, kesin hasta, randevu, tedavi veya gelir
                garantisi değildir.
              </div>
            </article>

            <article className="infoCard">
              <div className="infoCardTitle">
                Otomatik yenileme yapılmaz
              </div>

              <div className="infoCardText">
                Kredi paketleri tek seferliktir. Premium üyelik 30 gün
                geçerlidir. Paketler ve Premium üyelik otomatik olarak
                yenilenmez; kullanıcı tarafından yeniden satın alınması
                gerekir.
              </div>
            </article>

            <article className="infoCard">
              <div className="infoCardTitle">
                Tıbbi hizmet sunulmaz
              </div>

              <div className="infoCardText">
                DişFiyat360 sağlık kuruluşu değildir; muayene, teşhis veya
                tedavi sunmaz. Tedavi süreci, ücretlendirme ve hasta ile
                kurulacak iletişim ilgili klinik ile kullanıcı arasındadır.
              </div>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="paymentBox">
            <div>
              <div className="paymentTitle">
                Güvenli ödeme altyapısı
              </div>

              <div className="paymentText">
                Online kart ödemelerinin iyzico güvenli ödeme altyapısı
                üzerinden gerçekleştirilmesi planlanmaktadır. iyzico başvuru
                ve entegrasyon süreci tamamlanana kadar internet sitesi
                üzerinden karttan tahsilat yapılmaz ve kullanıcı hesabına
                otomatik kredi veya Premium üyelik tanımlanmaz.
              </div>
            </div>

            <div className="paymentLogoBox">
              <Image
                src="/payment/iyzico-checkout.png"
                alt="iyzico güvenli ödeme altyapısı"
                width={720}
                height={214}
                className="paymentLogo"
                sizes="(max-width: 650px) 100vw, 280px"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <h2 className="sectionTitle">
              Sözleşmeler ve Yasal Bilgilendirmeler
            </h2>

            <div className="sectionDesc">
              Satın alma işleminden önce paket kapsamı, toplam fiyat,
              teslimat şartları ve ilgili sözleşmeler kullanıcıya sunulur.
            </div>
          </div>

          <div className="legalGrid">
            <Link
              href="/mesafeli-satis-sozlesmesi"
              className="legalLink"
            >
              Mesafeli Satış Sözleşmesi
            </Link>

            <Link href="/teslimat-iade" className="legalLink">
              Teslimat ve İade Şartları
            </Link>

            <Link href="/iptal-iade" className="legalLink">
              İptal ve İade Politikası
            </Link>

            <Link href="/kullanim-kosullari" className="legalLink">
              Kullanım Koşulları
            </Link>

            <Link href="/gizlilik" className="legalLink">
              Gizlilik Politikası
            </Link>

            <Link href="/kvkk" className="legalLink">
              KVKK Aydınlatma Metni
            </Link>

            <Link href="/hakkimizda" className="legalLink">
              Hakkımızda
            </Link>

            <Link href="/iletisim" className="legalLink">
              İletişim
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="companyBox">
            <strong>Hizmet sağlayıcı:</strong> Ferhat Menekşe
            <br />
            <strong>İşletme türü:</strong> Şahıs işletmesi
            <br />
            <strong>Vergi dairesi:</strong> 5 Ocak Vergi Dairesi
            <br />
            <strong>Vergi numarası:</strong> 6150625779
            <br />
            <strong>Adres:</strong> Dumlupınar Mahallesi, 38007 Sokak No:4,
            Seyhan / Adana
            <br />
            <strong>Telefon:</strong> 0531 917 17 39
            <br />
            <strong>E-posta:</strong> ferhatmenekse945@gmail.com
          </div>
        </section>

        <section className="section">
          <div className="bottomCta">
            <div>
              <div className="bottomCtaTitle">
                DişFiyat360’a klinik olarak katılın
              </div>

              <div className="bottomCtaText">
                Klinik hesabınızı oluşturun, hizmet bölgenizi belirleyin ve
                uygun talep erişimlerini panelinizden yönetin.
              </div>
            </div>

            <Link href="/klinik-basvuru" className="primaryButton">
              Klinik Başvurusu →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}