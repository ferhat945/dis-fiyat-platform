import type { Metadata } from "next";
import Link from "next/link";
import { KVKK_TEXT_VERSION } from "@/lib/kvkk";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `KVKK Aydınlatma Metni (${KVKK_TEXT_VERSION}) | DişFiyat360`,
  description:
    "Teklif formu üzerinden paylaşılan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

type Block = {
  title: string;
  items?: string[];
  text?: string;
};

const BLOCKS: Block[] = [
  {
    title: "1) Veri Sorumlusu",
    text:
      "Bu aydınlatma metni kapsamında veri sorumlusu Ferhat Menekşe’dir. Vergi No: 6150625779. Adres: Dumlupınar Mahallesi 38007 Sokak No:4. E-posta: ferhatmenekse945@gmail.com. Telefon: 0531 917 17 39.",
  },
  {
    title: "2) İşlenen Kişisel Veriler",
    items: [
      "Ad ve soyad",
      "Telefon numarası",
      "Opsiyonel e-posta adresi",
      "Talep edilen hizmet, şehir ve kullanıcı mesajı",
      "Spam önleme ve güvenlik amaçlı teknik kayıtlar (ör. IP adresi, user-agent, log kayıtları)",
    ],
  },
  {
    title: "3) Kişisel Verilerin İşlenme Amaçları",
    items: [
      "Teklif talebinize uygun kliniklerin sizinle iletişime geçebilmesini sağlamak",
      "Talep ve yönlendirme sürecini yürütmek",
      "Platform hizmet kalitesini ve operasyon süreçlerini geliştirmek",
      "Kötüye kullanım, spam ve güvenlik ihlallerini önlemek",
      "Yasal yükümlülükleri yerine getirmek",
    ],
  },
  {
    title: "4) Kişisel Verilerin Aktarılması",
    text:
      "Kişisel verileriniz, talebinize uygun kliniklerle paylaşılabilir. Ayrıca teknik altyapı sağlayıcıları ve yasal zorunluluk halinde yetkili kamu kurumları ile sınırlı olarak paylaşım yapılabilir. Kişisel verileriniz üçüncü kişilere pazarlama amacıyla satılmaz.",
  },
  {
    title: "5) Hukuki Sebep ve Toplama Yöntemi",
    text:
      "Kişisel verileriniz, teklif formu, iletişim formları, teknik log kayıtları ve benzeri dijital kanallar aracılığıyla elektronik ortamda toplanır. Veriler; açık rızanızın gerektiği durumlarda açık rıza, sözleşmenin kurulması veya ifası, veri sorumlusunun meşru menfaati ve hukuki yükümlülüklerin yerine getirilmesi sebeplerine dayanılarak işlenebilir.",
  },
  {
    title: "6) Saklama Süresi",
    text:
      "Kişisel veriler, hizmetin sunulması, operasyonel süreçlerin yürütülmesi, kayıt düzeninin sağlanması, olası uyuşmazlıkların çözümü ve yasal yükümlülüklerin yerine getirilmesi amacıyla gerekli süre boyunca saklanır. Süre sonunda veriler silinir, yok edilir veya anonim hale getirilir.",
  },
  {
    title: "7) Veri Güvenliği",
    items: [
      "SSL ve güvenli iletişim katmanları",
      "Spam önleme (honeypot), rate limit ve loglama mekanizmaları",
      "Rol bazlı erişim kontrolü",
      "Yetkisiz erişimi engellemeye yönelik teknik ve idari tedbirler",
    ],
  },
  {
    title: "8) KVKK Kapsamındaki Haklarınız",
    items: [
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
      "İşlenmişse buna ilişkin bilgi talep etme",
      "Amacına uygun kullanılıp kullanılmadığını öğrenme",
      "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
      "Kanuni şartlar kapsamında silinmesini veya yok edilmesini isteme",
      "İşlenen verilerin aktarıldığı üçüncü kişileri bilme",
      "Kanuna aykırı işleme nedeniyle zarara uğramanız halinde tazminat talep etme",
    ],
  },
  {
    title: "9) Önemli Bilgilendirme",
    text:
      "DişFiyat360, kullanıcıların teklif taleplerini ilgili kliniklere ileten bir platformdur. Platform sağlık hizmeti sağlayıcısı değildir; tıbbi teşhis veya tedavi sunmaz. Kesin fiyat ve tedavi planı muayene sonrası ilgili klinik tarafından belirlenir.",
  },
];

export default function KvkkPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className="kicker">
                    🔒 KVKK Aydınlatma Metni <span style={{ opacity: 0.7 }}>•</span> {KVKK_TEXT_VERSION}
                  </div>

                  <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                    KVKK <span className="grad">Bilgilendirme</span>
                  </h1>

                  <p className="heroDesc" style={{ marginTop: 8, maxWidth: 700 }}>
                    Bu metin, teklif formu ve platform kullanımı kapsamında paylaştığınız kişisel verilerin
                    işlenmesine ilişkin bilgilendirme amaçlıdır.{" "}
                    <strong>Kesin fiyat muayene sonrası netleşir.</strong>
                  </p>

                  <div className="miniRow" style={{ marginTop: 10 }}>
                    <span className="miniItem">✅ Ücretsiz teklif formu</span>
                    <span className="miniItem">🛡️ Spam korumalı</span>
                    <span className="miniItem">🔒 KVKK uyumlu süreç</span>
                  </div>
                </div>

                <div className="ctaRow" style={{ marginTop: 2 }}>
                  <Link href="/teklif-al" className="btn btnPrimary">
                    Teklif Al →
                  </Link>
                  <Link href="/" className="btn btnGhost">
                    Ana sayfa →
                  </Link>
                </div>
              </div>

              <div className="section" style={{ paddingTop: 16, paddingBottom: 0 }}>
                <div
                  className="sectionBox"
                  style={{
                    display: "grid",
                    gap: 10,
                    background: "rgba(255,255,255,0.82)",
                  }}
                >
                  <div style={{ fontWeight: 950, fontSize: 16 }}>Özet</div>
                  <div style={{ color: "rgba(15,23,42,0.70)", fontWeight: 750, lineHeight: 1.7 }}>
                    Form gönderimi için iletişime geçilmesine ilişkin gerekli onay alınır. Güvenlik amacıyla
                    honeypot, rate limit ve loglama mekanizmaları uygulanır. Platform, yalnızca teklif
                    yönlendirme hizmeti sunar; tedavi hizmeti sunmaz.
                  </div>

                  <div className="ctaRow" style={{ marginTop: 4 }}>
                    <Link href="/gizlilik-politikasi" className="btn btnSoft">
                      Gizlilik Politikası
                    </Link>
                    <Link href="/teklif-al" className="btn btnPrimary">
                      Formu Aç →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="section">
                <h2 className="sectionTitle">Detaylar</h2>

                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.78)" }}>
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
                              lineHeight: 1.7,
                            }}
                          >
                            {b.text}
                          </div>
                        ) : null}

                        {b.items?.length ? (
                          <ul style={{ margin: "10px 0 0 0", paddingLeft: 18 }}>
                            {b.items.map((it) => (
                              <li
                                key={it}
                                style={{
                                  marginTop: 6,
                                  color: "rgba(15,23,42,0.72)",
                                  fontWeight: 750,
                                  lineHeight: 1.7,
                                }}
                              >
                                {it}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="section" style={{ paddingTop: 0 }}>
                <div
                  className="finalCta"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245, 158, 11, 0.10), rgba(124, 58, 237, 0.06))",
                  }}
                >
                  <div>
                    <h3 className="finalTitle" style={{ fontSize: 18 }}>
                      Not
                    </h3>
                    <p className="finalDesc">
                      Bu site bilgilendirme ve teklif yönlendirme amaçlıdır; tıbbi teşhis/tavsiye değildir.
                      Kesin fiyat muayene sonrası ilgili klinik tarafından belirlenir.
                    </p>
                  </div>

                  <Link href="/teklif-al" className="btn btnPrimary">
                    Teklif Al →
                  </Link>
                </div>

                <div className="miniRow" style={{ marginTop: 10 }}>
                  <Link href="/gizlilik-politikasi" className="btn btnSoft">
                    Gizlilik →
                  </Link>
                  <Link href="/kullanim-kosullari" className="btn btnSoft">
                    Kullanım Koşulları →
                  </Link>
                  <Link href="/iletisim" className="btn btnGhost">
                    İletişim →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}