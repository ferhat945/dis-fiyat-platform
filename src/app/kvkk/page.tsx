import type { Metadata } from "next";
import Link from "next/link";
import { KVKK_TEXT_VERSION } from "@/lib/kvkk";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `KVKK Aydınlatma Metni (${KVKK_TEXT_VERSION}) • Diş Fiyat Platform`,
  description:
    "Teklif formu üzerinden paylaşılan kişisel verilerin işlenmesine ilişkin KVKK aydınlatma metni.",
  alternates: { canonical: "/kvkk" },
};

type Block = { title: string; items?: string[]; text?: string };

const BLOCKS: Block[] = [
  {
    title: "1) İşlenen Veriler",
    items: [
      "Ad-soyad",
      "Telefon",
      "Opsiyonel e-posta",
      "Talep edilen hizmet ve şehir bilgisi",
      "Spam önleme ve güvenlik amaçlı teknik kayıtlar (ör. IP, user-agent)",
    ],
  },
  {
    title: "2) Amaç",
    items: [
      "Talebinize uygun kliniklerin sizinle iletişime geçebilmesi",
      "Hizmet kalitesi ve operasyon süreçlerinin iyileştirilmesi",
      "Kötüye kullanım/spam önleme ve sistem güvenliğinin sağlanması",
    ],
  },
  {
    title: "3) Saklama",
    text:
      "Kayıtlar hizmet kalitesi ve operasyon amacıyla saklanabilir. Kesin süreler ürün ve süreçlere göre güncellenebilir.",
  },
  {
    title: "4) Güvenlik",
    items: [
      "Spam önleme (honeypot), rate limit ve loglama mekanizmaları kullanılır.",
      "Erişimler rol bazlı kontrol edilir; sadece yetkili kullanıcılar erişebilir.",
    ],
  },
];

export default function KvkkPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              {/* TOP */}
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

                  <p className="heroDesc" style={{ marginTop: 8, maxWidth: 70 * 10 }}>
                    Bu metin, teklif formu üzerinden paylaştığınız kişisel verilerin işlenmesine ilişkin
                    bilgilendirme amaçlıdır. <strong>Kesin fiyat muayene sonrası netleşir.</strong>
                  </p>

                  <div className="miniRow" style={{ marginTop: 10 }}>
                    <span className="miniItem">✅ Ücretsiz</span>
                    <span className="miniItem">🛡️ Spam korumalı</span>
                    <span className="miniItem">🔒 KVKK onaylı</span>
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

              {/* SUMMARY BOX */}
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
                    Form gönderimi için iletişime geçilmesine izin gereklidir. Onay olmadan form
                    gönderilemez. Güvenlik için honeypot ve rate limit uygulanır.
                  </div>

                  <div className="ctaRow" style={{ marginTop: 4 }}>
                    <Link href="/kvkk" className="btn btnSoft">
                      Bu sayfanın linki
                    </Link>
                    <Link href="/teklif-al" className="btn btnPrimary">
                      Formu Aç →
                    </Link>
                  </div>
                </div>
              </div>

              {/* CONTENT */}
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

              {/* NOTE */}
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
                      Bu site bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir. Kesin fiyat muayene sonrası
                      netleşir.
                    </p>
                  </div>

                  <Link href="/teklif-al" className="btn btnPrimary">
                    Teklif Al →
                  </Link>
                </div>

                <div className="miniRow" style={{ marginTop: 10 }}>
                  <Link href="/sehir" className="btn btnSoft">
                    Şehirler →
                  </Link>
                  <Link href="/hizmetler" className="btn btnSoft">
                    Hizmetler →
                  </Link>
                  <Link href="/blog" className="btn btnGhost">
                    Blog →
                  </Link>
                </div>
              </div>

              {/* END */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
