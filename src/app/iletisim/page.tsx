import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İletişim | DişFiyat360",
  description: "DişFiyat360 iletişim bilgileri.",
  alternates: { canonical: "/iletisim" },
};

export default function ContactPage(): JSX.Element {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="kicker">📞 İletişim</div>

              <h1 className="h1" style={{ fontSize: 34, marginTop: 10 }}>
                Bizimle <span className="grad">İletişime Geçin</span>
              </h1>

              <p className="heroDesc" style={{ maxWidth: 720 }}>
                Platform, klinik aboneliği, iş birlikleri, ödeme, hukuki bilgilendirme
                veya destek talepleri için aşağıdaki iletişim kanallarını kullanabilirsiniz.
              </p>

              <div className="section">
                <div className="sectionBox" style={{ background: "rgba(255,255,255,0.82)" }}>
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    }}
                  >
                    <InfoCard title="Telefon">
                      <a href="tel:05319171739">0531 917 17 39</a>
                    </InfoCard>

                    <InfoCard title="E-posta">
                      <a href="mailto:ferhatmenekse945@gmail.com">ferhatmenekse945@gmail.com</a>
                    </InfoCard>

                    <InfoCard title="Adres">
                      Dumlupınar Mahallesi 38007 Sokak No:4
                    </InfoCard>

                    <InfoCard title="Vergi No">6150625779</InfoCard>

                    <InfoCard title="Hizmet Modeli">
                      DişFiyat360, kliniklere yönelik dijital abonelik, panel erişimi,
                      görünürlük ve lead yönlendirme hizmeti sunan bir B2B platformdur.
                    </InfoCard>

                    <InfoCard title="Sağlık Hizmeti Bilgilendirmesi">
                      Platform doğrudan teşhis, tedavi, muayene veya kesin fiyat hizmeti
                      sunmaz. Sağlık hizmetleri ilgili klinikler tarafından verilir.
                    </InfoCard>
                  </div>
                </div>
              </div>

              <div className="ctaRow">
                <Link href="/hakkimizda" className="btn btnSoft">
                  Hakkımızda →
                </Link>
                <Link href="/gizlilik-politikasi" className="btn btnGhost">
                  Gizlilik →
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      style={{
        border: "1px solid rgba(15,23,42,0.10)",
        background: "rgba(255,255,255,0.86)",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>{title}</div>
      <div style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}