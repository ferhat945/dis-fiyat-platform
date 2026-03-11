import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | DişFiyat360",
  description: "DişFiyat360 gizlilik politikası ve kişisel verilerin kullanım esasları.",
  alternates: { canonical: "/gizlilik-politikasi" },
};

const BLOCKS = [
  {
    title: "1) Genel Bilgilendirme",
    text:
      "Bu gizlilik politikası, DişFiyat360 platformunu ziyaret eden ve teklif formunu kullanan kullanıcıların bilgilerinin nasıl toplandığını, işlendiğini ve korunduğunu açıklamak amacıyla hazırlanmıştır.",
  },
  {
    title: "2) Toplanan Bilgiler",
    items: [
      "Ad ve soyad",
      "Telefon numarası",
      "Opsiyonel e-posta adresi",
      "Hizmet ve şehir bilgisi",
      "Kullanıcı mesajı ve form içeriği",
      "IP adresi, user-agent ve teknik log kayıtları",
    ],
  },
  {
    title: "3) Bilgilerin Kullanım Amaçları",
    items: [
      "Kullanıcı talebine uygun kliniklerle iletişimi sağlamak",
      "Teklif ve yönlendirme sürecini yürütmek",
      "Kullanıcı destek taleplerine cevap vermek",
      "Sistem güvenliğini sağlamak ve kötüye kullanımı önlemek",
      "Hizmet kalitesini artırmak ve operasyonel süreçleri geliştirmek",
    ],
  },
  {
    title: "4) Bilgilerin Paylaşılması",
    text:
      "Kullanıcı bilgileri, teklif talebinin karşılanabilmesi amacıyla uygun kliniklerle paylaşılabilir. Ayrıca hosting, altyapı, güvenlik ve benzeri hizmet sağlayıcılarla teknik gereklilik ölçüsünde paylaşım yapılabilir. Yasal zorunluluk halinde yetkili kurumlarla paylaşım yapılabilir. Veriler üçüncü kişilere pazarlama amacıyla satılmaz.",
  },
  {
    title: "5) Güvenlik",
    text:
      "DişFiyat360, kişisel verilerin güvenliği için teknik ve idari tedbirler uygular. SSL, loglama, erişim yetkilendirmesi, spam önleme ve benzeri yöntemler kullanılabilir. Buna rağmen internet üzerinden yapılan hiçbir veri aktarımının tamamen risksiz olduğu garanti edilemez.",
  },
  {
    title: "6) Dış Bağlantılar",
    text:
      "Platform üzerinde üçüncü taraf kliniklere, sosyal medya hesaplarına veya harici hizmetlere yönlendiren bağlantılar bulunabilir. Bu bağlantılar üzerinden erişilen üçüncü taraf sitelerin gizlilik uygulamalarından DişFiyat360 sorumlu değildir.",
  },
  {
    title: "7) Saklama Süresi",
    text:
      "Kullanıcı bilgileri, hizmet süreçlerinin yürütülmesi, kayıt düzeninin sağlanması, olası uyuşmazlıkların çözümü ve yasal yükümlülüklerin yerine getirilmesi amacıyla gerekli süre boyunca saklanabilir.",
  },
  {
    title: "8) İletişim",
    text:
      "Gizlilik politikası ile ilgili sorularınız için ferhatmenekse945@gmail.com adresine e-posta gönderebilir veya 0531 917 17 39 numaralı telefondan iletişime geçebilirsiniz.",
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

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                Gizlilik <span className="grad">Politikası</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 700 }}>
                Bu politika, platformu kullanırken paylaştığınız bilgilerin hangi çerçevede işlendiğini ve
                korunduğunu açıklar.
              </p>

              <div className="miniRow" style={{ marginTop: 10 }}>
                <span className="miniItem">🔒 Veri güvenliği</span>
                <span className="miniItem">📄 Şeffaf bilgilendirme</span>
                <span className="miniItem">🛡️ Güvenli altyapı</span>
              </div>

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

                        {b.text ? (
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

                        {b.items ? (
                          <ul style={{ margin: "10px 0 0 0", paddingLeft: 18 }}>
                            {b.items.map((item) => (
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
                <Link href="/kvkk" className="btn btnSoft">
                  KVKK →
                </Link>
                <Link href="/iletisim" className="btn btnGhost">
                  İletişim →
                </Link>
                <Link href="/teklif-al" className="btn btnPrimary">
                  Teklif Al →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}