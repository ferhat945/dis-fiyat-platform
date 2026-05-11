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
                DişFiyat360, diş kliniklerine yönelik dijital görünürlük, panel erişimi,
                lead yönlendirme ve abonelik hizmeti sunan bir B2B platformdur.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div style={{ display: "grid", gap: 12 }}>
                    <InfoBlock
                      title="Ne Yapıyoruz?"
                      text="DişFiyat360, diş kliniklerine yönelik dijital reklam, görünürlük, lead yönlendirme ve panel aboneliği hizmeti sunan bir B2B platformdur. Klinikler platform üzerinden kendi panel erişimlerini yönetebilir, görünürlük sağlayabilir ve kendilerine yönlendirilen kullanıcı taleplerini görüntüleyebilir."
                    />

                    <InfoBlock
                      title="Ne Yapmıyoruz?"
                      text="Platform doğrudan sağlık hizmeti sunmaz. Tıbbi teşhis, tedavi, muayene veya kesin fiyat satışı yapılmaz. Tedavi süreçleri ve sağlık hizmetleri ilgili klinikler tarafından yürütülür. Platform yalnızca dijital yönlendirme ve abonelik altyapısı sağlar."
                    />

                    <InfoBlock
                      title="Klinikler İçin Hizmet Modeli"
                      text="Klinikler, DişFiyat360 paneli üzerinden şehir ve hizmet kapsamlarını yönetebilir, görünürlük sağlayabilir ve KVKK onaylı kullanıcı taleplerini takip edebilir. Ücretli hizmetler dijital abonelik, panel erişimi, görünürlük ve lead yönetimi kapsamındadır."
                    />

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
                <Link href="/klinikler" className="btn btnPrimary">
                  Klinik Dizini →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.86)",
        borderRadius: 20,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
      <div
        style={{
          marginTop: 8,
          color: "rgba(15,23,42,0.72)",
          fontWeight: 750,
          lineHeight: 1.75,
        }}
      >
        {text}
      </div>
    </div>
  );
}