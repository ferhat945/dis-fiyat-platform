import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | DişFiyat360",
  description: "DişFiyat360 klinik abonelik ve dijital hizmet sözleşmesi.",
  alternates: { canonical: "/mesafeli-satis-sozlesmesi" },
};

export default function DistanceSalesPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">🧾 Mesafeli Satış Sözleşmesi</div>

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                Mesafeli Satış <span className="grad">Sözleşmesi</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 760 }}>
                Bu sözleşme, DişFiyat360 platformu üzerinden sunulan dijital abonelik ve platform hizmetlerine
                ilişkin koşulları düzenler.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {[
                      {
                        title: "1) Taraflar",
                        text:
                          "Satıcı/Hizmet Sağlayıcı: Ferhat Menekşe – Vergi No: 6150625779 – Adres: Dumlupınar Mahallesi 38007 Sokak No:4 – Telefon: 0531 917 17 39 – E-posta: ferhatmenekse945@gmail.com. Alıcı: Platform üzerinden dijital abonelik veya platform hizmeti satın alan gerçek veya tüzel kişi klinik/işletmedir.",
                      },
                      {
                        title: "2) Sözleşmenin Konusu",
                        text:
                          "İşbu sözleşmenin konusu, alıcının elektronik ortamda sipariş verdiği DişFiyat360 platformu kapsamındaki dijital üyelik, abonelik, görünürlük, panel erişimi, lead yönetimi veya benzeri dijital hizmetlerin satış ve kullanım şartlarının belirlenmesidir.",
                      },
                      {
                        title: "3) Hizmetin Niteliği",
                        text:
                          "Satın alınan hizmet, fiziksel bir ürün değil; dijital platform erişimi, abonelik ve yazılım hizmetidir. Platform, kliniklerin panel kullanımı, lead görüntüleme, kapsam tanımlama ve benzeri dijital imkanlardan yararlanmasını sağlayabilir.",
                      },
                      {
                        title: "4) Süre",
                        text:
                          "Abonelik veya paket süresi, ödeme ekranında belirtilen dönem boyunca geçerlidir. Aksi açıkça belirtilmedikçe hizmet süresi 1 aylık kullanım dönemi esasına göre değerlendirilir.",
                      },
                      {
                        title: "5) Ücret ve Ödeme",
                        text:
                          "Hizmet bedeli, ödeme aşamasında kullanıcıya gösterilen tutardır. Ödeme, anlaşmalı ödeme altyapısı üzerinden güvenli şekilde tahsil edilir. Satıcı, fiyatlarda değişiklik yapma hakkını saklı tutar; ancak değişiklikler mevcut satın alma işlemini geriye dönük etkilemez.",
                      },
                      {
                        title: "6) Hizmetin İfası",
                        text:
                          "Dijital hizmet, ödemenin onaylanmasının ardından makul süre içinde aktif hale getirilir veya ilgili hesap/panel erişimi kullanım durumuna getirilir. Hizmetin aktif hale gelmesiyle birlikte ifa başlamış sayılır.",
                      },
                      {
                        title: "7) Cayma ve İade Bilgilendirmesi",
                        text:
                          "Elektronik ortamda anında ifa edilen veya ifasına başlanan dijital hizmetlerde, ilgili mevzuat kapsamında cayma hakkı istisnaları uygulanabilir. Hizmetin aktive edilmesi, panel erişiminin açılması veya kullanımın başlaması durumunda iade talepleri sınırlı şekilde değerlendirilebilir. Ayrıntılar İptal ve İade Politikası sayfasında yer alır.",
                      },
                      {
                        title: "8) Sorumluluğun Sınırı",
                        text:
                          "Platform, dijital hizmet ve panel erişimi sunar. Platform üzerinden doğrudan sağlık hizmeti verilmez. Kullanıcı ile üçüncü kişiler arasındaki ticari veya operasyonel ilişkilerden doğan sonuçlar ilgili tarafların sorumluluğundadır.",
                      },
                    ].map((b) => (
                      <div
                        key={b.title}
                        style={{
                          border: "1px solid rgba(15,23,42,0.10)",
                          background: "rgba(255,255,255,0.86)",
                          borderRadius: 20,
                          padding: 14,
                        }}
                      >
                        <div style={{ fontWeight: 950, fontSize: 16 }}>{b.title}</div>
                        <div
                          style={{
                            marginTop: 8,
                            color: "rgba(15,23,42,0.72)",
                            fontWeight: 750,
                            lineHeight: 1.75,
                          }}
                        >
                          {b.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/iptal-iade" className="btn btnSoft">
                  İptal ve İade →
                </Link>
                <Link href="/iletisim" className="btn btnGhost">
                  İletişim →
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