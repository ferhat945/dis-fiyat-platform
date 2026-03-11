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
                Platform, teklifler, iş birlikleri veya hukuki bilgilendirme talepleri için aşağıdaki iletişim
                kanallarını kullanabilirsiniz.
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
                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>Telefon</div>
                      <div style={{ marginTop: 8, fontWeight: 800 }}>
                        <a href="tel:05319171739">0531 917 17 39</a>
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>E-posta</div>
                      <div style={{ marginTop: 8, fontWeight: 800 }}>
                        <a href="mailto:ferhatmenekse945@gmail.com">ferhatmenekse945@gmail.com</a>
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>Adres</div>
                      <div style={{ marginTop: 8, fontWeight: 800 }}>
                        Dumlupınar Mahallesi 38007 Sokak No:4
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid rgba(15,23,42,0.10)",
                        background: "rgba(255,255,255,0.86)",
                        borderRadius: 20,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>Vergi No</div>
                      <div style={{ marginTop: 8, fontWeight: 800 }}>6150625779</div>
                    </div>
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