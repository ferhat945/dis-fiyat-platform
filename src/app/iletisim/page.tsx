import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İletişim | DişFiyat360",
  description:
    "DişFiyat360 iletişim, destek, klinik üyeliği, ödeme ve kurumsal bilgileri.",
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
              <div className="kicker">📞 İletişim</div>

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
                      title="Telefon"
                      description="Genel bilgi ve destek talepleri için"
                    >
                      <a
                        href="tel:+905319171739"
                        style={linkStyle}
                        aria-label="DişFiyat360 telefon numarası"
                      >
                        0531 917 17 39
                      </a>
                    </InfoCard>

                    <InfoCard
                      title="E-posta"
                      description="Yazılı destek ve resmi talepler için"
                    >
                      <a
                        href="mailto:ferhatmenekse945@gmail.com"
                        style={linkStyle}
                        aria-label="DişFiyat360 e-posta adresi"
                      >
                        ferhatmenekse945@gmail.com
                      </a>
                    </InfoCard>

                    <InfoCard
                      title="Adres"
                      description="İşletme ve başvuru adresi"
                    >
                      Dumlupınar Mahallesi, 38007 Sokak No:4, Seyhan / Adana
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

                    <InfoCard
                      title="İşletme Sahibi"
                      description="Platform hizmet sağlayıcısı"
                    >
                      Ferhat Menekşe
                    </InfoCard>

                    <InfoCard
                      title="Vergi Bilgileri"
                      description="Kurumsal ve mali bilgiler"
                    >
                      5 Ocak Vergi Dairesi
                      <br />
                      Vergi No: 6150625779
                    </InfoCard>
                  </div>
                </div>
              </div>

              <div className="section" style={{ paddingTop: 0 }}>
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
                      Başarısız ödeme, mükerrer tahsilat, paket aktivasyonu veya
                      işlem kaydıyla ilgili taleplerinizde ödeme tarihi ve
                      işlem bilgileriyle birlikte iletişime geçebilirsiniz.
                    </InfoCard>

                    <InfoCard title="KVKK Başvuruları">
                      Kişisel verilerinize ilişkin bilgi, düzeltme, silme veya
                      diğer başvurularınızı kimliğinizi ve talebinizi açıkça
                      belirterek e-posta veya posta yoluyla iletebilirsiniz.
                    </InfoCard>

                    <InfoCard title="İş Birlikleri">
                      Diş klinikleri, kurumsal hizmet sağlayıcıları ve iş
                      ortaklığı teklifleri için e-posta üzerinden iletişime
                      geçebilirsiniz.
                    </InfoCard>
                  </div>
                </div>
              </div>

              <div className="section" style={{ paddingTop: 0 }}>
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
                      DişFiyat360 bir diş kliniği veya sağlık hizmeti sağlayıcısı
                      değildir. Platform üzerinden teşhis, muayene, tedavi,
                      reçete veya kesin tedavi fiyatı sunulmaz. Sağlık hizmeti,
                      tedavi planı ve fiyatlandırma ilgili klinik tarafından
                      belirlenir.
                    </p>
                  </div>

                  <Link href="/hakkimizda" className="btn btnPrimary">
                    Hakkımızda →
                  </Link>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/hakkimizda" className="btn btnSoft">
                  Hakkımızda →
                </Link>

                <Link href="/gizlilik-politikasi" className="btn btnGhost">
                  Gizlilik Politikası →
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