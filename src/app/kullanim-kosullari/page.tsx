import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | DişFiyat360",
  description: "DişFiyat360 kullanım koşulları.",
  alternates: { canonical: "/kullanim-kosullari" },
};

export default function TermsPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">📘 Kullanım Koşulları</div>

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                Kullanım <span className="grad">Koşulları</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 720 }}>
                Bu sayfa, DişFiyat360 platformunu kullanan ziyaretçiler ve klinik
                kullanıcıları için geçerli temel kullanım şartlarını açıklar.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {BLOCKS.map((b) => (
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

                        {"text" in b ? (
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
                        ) : null}

                        {"items" in b ? (
                          <ul style={{ margin: "10px 0 0 0", paddingLeft: 18 }}>
                            {b.items?.map((item) => (
                              <li
                                key={item}
                                style={{
                                  marginTop: 6,
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/hakkimizda" className="btn btnSoft">
                  Hakkımızda →
                </Link>
                <Link href="/iletisim" className="btn btnGhost">
                  İletişim →
                </Link>
                <Link href="/mesafeli-satis-sozlesmesi" className="btn btnPrimary">
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

const BLOCKS = [
  {
    title: "1) Hizmetin Konusu",
    text:
      "DişFiyat360, diş kliniklerine yönelik dijital görünürlük, panel erişimi, lead yönlendirme ve abonelik altyapısı sağlayan bir B2B platformdur.",
  },
  {
    title: "2) Platformun Rolü",
    text:
      "Platform sağlık hizmeti sağlayıcısı değildir. Platform yalnızca dijital yönlendirme, panel erişimi ve abonelik hizmeti sunar. Tıbbi teşhis, tedavi veya sağlık hizmetleri ilgili klinikler tarafından sağlanır.",
  },
  {
    title: "3) Klinik Kullanıcı Hizmetleri",
    text:
      "Klinikler, panel üzerinden şehir/hizmet kapsamlarını, profil bilgilerini, fiyat aralıklarını, lead taleplerini ve abonelik/kota süreçlerini yönetebilir. Ücretli hizmetler dijital abonelik ve panel erişimi kapsamındadır.",
  },
  {
    title: "4) Fiyat Bilgilendirmesi",
    text:
      "Platformda yer alan açıklamalar ve ön bilgiler bilgilendirme amaçlıdır. Kesin fiyat, tedavi planı, kullanılacak malzeme, ek işlem gereksinimi ve muayene bulgularına göre ilgili klinik tarafından belirlenir.",
  },
  {
    title: "5) Kullanıcı Yükümlülüğü",
    items: [
      "Forma girilen bilgilerin doğru ve güncel olması gerekir.",
      "Yanıltıcı, hukuka aykırı veya üçüncü kişilerin haklarını ihlal eden içerik girilmemelidir.",
      "Platform güvenliğini zedeleyecek kullanım girişimlerinden kaçınılmalıdır.",
      "Klinik kullanıcıları, panelde yer alan bilgilerin doğruluğundan sorumludur.",
    ],
  },
  {
    title: "6) Kliniklerle İlişki",
    text:
      "Ziyaretçi ile klinik arasında kurulacak iletişim, muayene, teklif, tedavi ve benzeri süreçler ilgili tarafların kendi sorumluluğundadır. Platform bu süreçlerde sağlık hizmeti sağlayıcısı olarak taraf değildir.",
  },
  {
    title: "7) Erişim ve Süreklilik",
    text:
      "Platform, teknik bakım, güvenlik gereklilikleri veya altyapı çalışmaları nedeniyle geçici olarak erişilemeyebilir. Hizmetin kesintisiz ve hatasız çalışacağı garanti edilmez.",
  },
  {
    title: "8) Fikri Haklar",
    text:
      "Site tasarımı, metinler, marka unsurları, yazılım bileşenleri ve içerikler aksi belirtilmedikçe hak sahibine aittir. İzinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.",
  },
  {
    title: "9) Sorumluluğun Sınırı",
    text:
      "Platform, kliniklerin sunduğu sağlık hizmetlerinin niteliği, tedavi sonuçları, fiyatları veya kullanıcı ile klinik arasındaki ilişkilerden doğan uyuşmazlıklardan sorumlu değildir.",
  },
];