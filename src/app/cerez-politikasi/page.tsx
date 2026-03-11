import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Çerez Politikası | DişFiyat360",
  description: "DişFiyat360 çerez politikası.",
  alternates: { canonical: "/cerez-politikasi" },
};

export default function CookiePolicyPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">🍪 Çerez Politikası</div>

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                Çerez <span className="grad">Politikası</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 700 }}>
                Bu sayfa, DişFiyat360 platformunda kullanılan çerezler ve benzeri teknolojiler hakkında
                bilgilendirme içerir.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {[
                      {
                        title: "1) Çerez Nedir?",
                        text:
                          "Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar sayesinde site tercihleri hatırlanabilir ve bazı işlevler daha sağlıklı çalışabilir.",
                      },
                      {
                        title: "2) Hangi Amaçlarla Kullanılır?",
                        items: [
                          "Site performansını ve güvenliğini sağlamak",
                          "Form süreçlerinin düzgün çalışmasını desteklemek",
                          "Spam ve kötüye kullanımı azaltmak",
                          "Kullanıcı deneyimini geliştirmek",
                        ],
                      },
                      {
                        title: "3) Kullanılabilecek Çerez Türleri",
                        items: [
                          "Zorunlu çerezler",
                          "Performans ve analiz amaçlı çerezler",
                          "Güvenlik ve oturum yönetimi için kullanılan teknik çerezler",
                        ],
                      },
                      {
                        title: "4) Çerezlerin Yönetimi",
                        text:
                          "Tarayıcı ayarlarınız üzerinden çerezleri silebilir, engelleyebilir veya kısıtlayabilirsiniz. Ancak bazı çerezlerin devre dışı bırakılması sitenin bazı bölümlerinin düzgün çalışmamasına neden olabilir.",
                      },
                      {
                        title: "5) Üçüncü Taraf Hizmetler",
                        text:
                          "Site üzerinde üçüncü taraf servisler veya bağlantılar bulunabilir. Bu servislerin kendi çerez politikaları olabilir. İlgili üçüncü tarafların uygulamalarından DişFiyat360 sorumlu değildir.",
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
                <Link href="/gizlilik-politikasi" className="btn btnSoft">
                  Gizlilik →
                </Link>
                <Link href="/kvkk" className="btn btnGhost">
                  KVKK →
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