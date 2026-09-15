import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İletişim | DişFiyat360",
  description:
    "DişFiyat360 iletişim, destek, klinik üyeliği, ödeme ve kurumsal iletişim bilgileri.",
  alternates: {
    canonical: "/iletisim",
  },
};

export default function ContactPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">💬 İletişim</div>

              <h1
                className="h1"
                style={{
                  fontSize: 34,
                  marginTop: 10,
                }}
              >
                Bizimle <span className="grad">İletişime Geçin</span>
              </h1>

              <p
                className="heroDesc"
                style={{
                  maxWidth: 780,
                }}
              >
                Platform kullanımı, klinik üyeliği, kredi paketleri, Premium
                üyelik, ödeme işlemleri, iş birlikleri, hukuki bilgilendirme
                veya destek talepleriniz için aşağıdaki iletişim kanallarını
                kullanabilirsiniz.
              </p>

              <div
                className="miniRow"
                style={{
                  marginTop: 10,
                }}
              >
                <span className="miniItem">🏢 Kurumsal iletişim</span>
                <span className="miniItem">💬 Klinik desteği</span>
                <span className="miniItem">🔒 Güvenli iletişim</span>
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
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(260px, 1fr))",
                    }}
                  >
                    <InfoCard
                      title="E-posta"
                      description="Destek, iş birliği ve resmi talepler için"
                    >
                      <a
                        href="mailto:disfiyat360@gmail.com"
                        style={linkStyle}
                        aria-label="DişFiyat360 e-posta adresi"
                      >
                        disfiyat360@gmail.com
                      </a>
                    </InfoCard>

                    <InfoCard
                      title="Konum"
                      description="DişFiyat360 iletişim konumu"
                    >
                      Beşiktaş / İstanbul
                    </InfoCard>

                    <InfoCard
                      title="İnternet Adresi"
                      description="DişFiyat360 resmi internet sitesi"
                    >
                      <a
                        href="https://www.disfiyat360.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={linkStyle}
                      >
                        www.disfiyat360.com
                      </a>
                    </InfoCard>
                  </div>
                </div>
              </div>

              <div
                className="section"
                style={{
                  paddingTop: 0,
                }}
              >
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
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                    }}
                  >
                    <InfoCard title="Klinik ve Üyelik Desteği">
                      Klinik hesabı, panel erişimi, kredi bakiyesi, kredi paketi,
                      Premium üyelik, şehir ve hizmet kapsamı veya lead
                      işlemleri hakkında destek alabilirsiniz.
                    </InfoCard>

                    <InfoCard title="Ödeme Desteği">
                      Ödeme bildirimi, paket aktivasyonu veya işlem kaydıyla
                      ilgili taleplerinizde işlem tarihi ve ilgili bilgilerle
                      birlikte bizimle iletişime geçebilirsiniz.
                    </InfoCard>

                    <InfoCard title="KVKK Başvuruları">
                      Kişisel verilerinize ilişkin bilgi, düzeltme, silme veya
                      diğer başvurularınızı kimliğinizi ve talebinizi açıkça
                      belirterek e-posta üzerinden iletebilirsiniz.
                    </InfoCard>

                    <InfoCard title="İş Birlikleri">
                      Diş klinikleri, kurumsal hizmet sağlayıcıları ve iş
                      ortaklığı teklifleri için e-posta üzerinden bizimle
                      iletişime geçebilirsiniz.
                    </InfoCard>
                  </div>
                </div>
              </div>

              <div
                className="section"
                style={{
                  paddingTop: 0,
                }}
              >
                <div
                  className="finalCta"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(124,58,237,0.06))",
                  }}
                >
                  <div>
                    <h2
                      className="finalTitle"
                      style={{
                        fontSize: 18,
                      }}
                    >
                      Sağlık Hizmeti Bilgilendirmesi
                    </h2>

                    <p className="finalDesc">
                      DişFiyat360 bir diş kliniği veya sağlık hizmeti
                      sağlayıcısı değildir. Platform üzerinden teşhis, muayene,
                      tedavi, reçete veya kesin tedavi fiyatı sunulmaz. Sağlık
                      hizmeti, tedavi planı ve fiyatlandırma ilgili klinik
                      tarafından belirlenir.
                    </p>
                  </div>

                  <Link
                    href="/hakkimizda"
                    className="btn btnPrimary"
                  >
                    Hakkımızda →
                  </Link>
                </div>
              </div>

              <div className="ctaRow">
                <Link
                  href="/hakkimizda"
                  className="btn btnSoft"
                >
                  Hakkımızda →
                </Link>

                <Link
                  href="/gizlilik-politikasi"
                  className="btn btnGhost"
                >
                  Gizlilik Politikası →
                </Link>

                <Link
                  href="/"
                  className="btn btnPrimary"
                >
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

function InfoCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
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
          fontSize: 16,
          lineHeight: 1.4,
          color: "rgba(15,23,42,0.94)",
        }}
      >
        {title}
      </h2>

      {description ? (
        <div
          style={{
            marginTop: 4,
            color: "rgba(15,23,42,0.54)",
            fontSize: 12,
            fontWeight: 750,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 8,
          color: "rgba(15,23,42,0.76)",
          fontWeight: 800,
          lineHeight: 1.75,
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </div>
    </article>
  );
}

const linkStyle = {
  color: "inherit",
  fontWeight: 900,
  textDecoration: "none",
  overflowWrap: "anywhere" as const,
};