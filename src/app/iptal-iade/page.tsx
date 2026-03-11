import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası | DişFiyat360",
  description: "DişFiyat360 dijital abonelik hizmetleri için iptal ve iade politikası.",
  alternates: { canonical: "/iptal-iade" },
};

export default function RefundPolicyPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">↩️ İptal ve İade Politikası</div>

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                İptal ve <span className="grad">İade Politikası</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 740 }}>
                Bu politika, DişFiyat360 üzerinden sunulan dijital abonelik ve yazılım hizmetlerine ilişkin iptal
                ve iade esaslarını açıklar.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {[
                      {
                        title: "1) Hizmetin Niteliği",
                        text:
                          "DişFiyat360 üzerinden sunulan ücretli hizmetler dijital abonelik, panel erişimi, görünürlük, yönetim araçları ve benzeri çevrim içi hizmetlerdir. Fiziksel ürün satışı yapılmamaktadır.",
                      },
                      {
                        title: "2) Hizmet Başlamadan Önce",
                        text:
                          "Ödeme alınmış ancak hizmet henüz aktive edilmemişse, kullanıcı talebi incelemeye alınabilir ve uygun görülmesi halinde iptal veya iade değerlendirmesi yapılabilir.",
                      },
                      {
                        title: "3) Hizmet Başladıktan Sonra",
                        text:
                          "Dijital abonelik, panel erişimi veya benzeri çevrim içi hizmet aktif hale geldikten ve kullanıma sunulduktan sonra, hizmetten yararlanılmaya başlanmış sayılır. Bu durumda iade talepleri kural olarak kabul edilmez; ancak teknik bir hata, mükerrer tahsilat veya açık bir sistemsel problem varsa özel inceleme yapılabilir.",
                      },
                      {
                        title: "4) Abonelik Süresi",
                        text:
                          "Satın alınan abonelik, ödeme sırasında belirtilen süre boyunca geçerlidir. Kullanıcı, aktif abonelik süresi boyunca hizmetten yararlanabilir. Kullanılmayan süreler için otomatik geri ödeme yapılmaz.",
                      },
                      {
                        title: "5) İstisnai Durumlar",
                        text:
                          "Mükerrer ödeme, yanlış tahsilat veya satıcı kaynaklı ciddi teknik engel gibi durumlarda kullanıcı talebi ayrıca değerlendirilir. Gerekli görülürse kısmi veya tam iade yapılabilir.",
                      },
                      {
                        title: "6) Başvuru",
                        text:
                          "İptal veya iade taleplerinizi, ödeme bilgileri ve açıklamanız ile birlikte ferhatmenekse945@gmail.com adresine iletebilirsiniz. Talepler makul süre içinde incelenir.",
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
                <Link href="/mesafeli-satis-sozlesmesi" className="btn btnSoft">
                  Mesafeli Satış →
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