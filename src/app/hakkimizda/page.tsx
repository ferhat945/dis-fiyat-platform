import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkımızda | DişFiyat360",
  description: "DişFiyat360 hakkında bilgiler.",
  alternates: { canonical: "/hakkimizda" },
};

export default function AboutPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">🏢 Hakkımızda</div>

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                DişFiyat360 <span className="grad">Hakkında</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 760 }}>
                DişFiyat360, kullanıcıların diş tedavisi taleplerini daha hızlı ve düzenli şekilde ilgili
                kliniklere iletebilmesini kolaylaştırmak için oluşturulmuş bir teklif ve yönlendirme
                platformudur.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>Ne Yapıyoruz?</div>
                      <div
                        style={{
                          marginTop: 8,
                          color: "rgba(15,23,42,0.72)",
                          fontWeight: 750,
                          lineHeight: 1.75,
                        }}
                      >
                        Kullanıcıların şehir ve işlem bilgilerine göre teklif talebi oluşturmasına imkan tanıyor,
                        bu talepleri uygun kliniklerle buluşturuyoruz.
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>Ne Yapmıyoruz?</div>
                      <div
                        style={{
                          marginTop: 8,
                          color: "rgba(15,23,42,0.72)",
                          fontWeight: 750,
                          lineHeight: 1.75,
                        }}
                      >
                        Sağlık hizmeti sunmuyor, tıbbi teşhis veya tedavi vermiyoruz. Kesin fiyat ve tedavi planı
                        muayene sonrası ilgili klinik tarafından belirlenir.
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>Kurumsal Bilgiler</div>
                      <div
                        style={{
                          marginTop: 8,
                          color: "rgba(15,23,42,0.72)",
                          fontWeight: 750,
                          lineHeight: 1.9,
                        }}
                      >
                        İşletme Sahibi: <strong>Ferhat Menekşe</strong>
                        <br />
                        Vergi No: <strong>6150625779</strong>
                        <br />
                        Adres: Dumlupınar Mahallesi 38007 Sokak No:4
                        <br />
                        Telefon: 0531 917 17 39
                        <br />
                        E-posta: ferhatmenekse945@gmail.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/iletisim" className="btn btnSoft">
                  İletişim →
                </Link>
                <Link href="/kvkk" className="btn btnGhost">
                  KVKK →
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