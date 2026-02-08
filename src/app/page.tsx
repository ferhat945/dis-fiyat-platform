import Link from "next/link";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { city: "istanbul", service: "implant", label: "İstanbul • İmplant" },
  { city: "ankara", service: "zirkonyum", label: "Ankara • Zirkonyum" },
  { city: "izmir", service: "dis-beyazlatma", label: "İzmir • Diş Beyazlatma" },
  { city: "bursa", service: "kanal-tedavisi", label: "Bursa • Kanal Tedavisi" },
];

const SERVICES = [
  { slug: "implant", title: "İmplant Tedavisi", desc: "Eksik dişler için kalıcı çözümler ve planlama.", icon: "🦷" },
  { slug: "zirkonyum", title: "Zirkonyum Kaplama", desc: "Doğal görünüm ve dayanıklılık odaklı uygulama.", icon: "✨" },
  { slug: "lamina", title: "Porselen Lamina", desc: "Gülüş estetiği için ince ve estetik kaplamalar.", icon: "😁" },
  { slug: "ortodonti", title: "Ortodonti / Şeffaf Plak", desc: "Diş dizilimi için tel veya şeffaf plak seçenekleri.", icon: "🧩" },
  { slug: "dis-beyazlatma", title: "Diş Beyazlatma", desc: "Klinik/ev tipi yöntemlerle daha aydınlık tonlar.", icon: "💎" },
  { slug: "dis-tasi-temizligi", title: "Diş Taşı Temizliği", desc: "Diş eti sağlığı için düzenli bakım ve kontrol.", icon: "🫧" },
];

export default function HomePage(): JSX.Element {
  return (
    <main className="home">
      {/* HERO */}
      <section className="hero">
        <div className="container heroGrid">
          <div className="heroLeft">
            <div className="badgeRow">
              <span className="badge">KVKK Onaylı</span>
              <span className="badge badgeSoft">Ücretsiz</span>
              <span className="badge badgeSoft">Hızlı İletişim</span>
            </div>

            <h1 className="heroTitle">
              Diş Tedavisi Fiyatlarını Karşılaştır,
              <br />
              Kliniklerden Teklif Al
            </h1>

            <p className="heroDesc">
              30 saniyelik KVKK onaylı formu doldur. Uygun klinikler seninle iletişime geçsin.
              <br />
              <strong>Kesin fiyat muayene sonrası netleşir.</strong>
            </p>

            <div className="ctaRow">
              <Link href="/teklif-al" className="btn btnPrimary">
                Teklif Al
              </Link>
              <Link href="/kvkk" className="btn btnGhost">
                KVKK Metni
              </Link>
            </div>

            <div className="quickRow">
              <div className="quickTitle">Hızlı başlangıç</div>
              <div className="quickLinks">
                {QUICK_LINKS.map((x) => (
                  <Link key={x.label} href={`/sehir/${x.city}/${x.service}`} className="chip">
                    {x.label} <span aria-hidden>→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="trustMini">
              <div className="trustItem">
                <div className="trustDot" />
                <div>
                  <div className="trustTitle">Spam önleme</div>
                  <div className="trustDesc">Rate limit + honeypot ile korunur.</div>
                </div>
              </div>
              <div className="trustItem">
                <div className="trustDot" />
                <div>
                  <div className="trustTitle">Adil dağıtım</div>
                  <div className="trustDesc">Kota/uygunluk kontrolü ile yönlendirme.</div>
                </div>
              </div>
              <div className="trustItem">
                <div className="trustDot" />
                <div>
                  <div className="trustTitle">Bilgilendirme</div>
                  <div className="trustDesc">Tıbbi teşhis/tavsiye değildir.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="heroRight">
            <div className="heroCard">
              <div className="heroCardTop">
                <div className="heroCardTitle">Hemen başla</div>
                <div className="heroCardSub">Şehir + işlem seç, formu doldur.</div>
              </div>

              <div className="heroCardGrid">
                <div className="stat">
                  <div className="statNum">30 sn</div>
                  <div className="statLbl">Form doldurma</div>
                </div>
                <div className="stat">
                  <div className="statNum">0 TL</div>
                  <div className="statLbl">Ücret</div>
                </div>
                <div className="stat">
                  <div className="statNum">KVKK</div>
                  <div className="statLbl">Zorunlu onay</div>
                </div>
                <div className="stat">
                  <div className="statNum">Hızlı</div>
                  <div className="statLbl">Klinikler seni arasın</div>
                </div>
              </div>

              <div className="heroCardActions">
                <Link href="/teklif-al" className="btn btnPrimary btnBlock">
                  Teklif Al
                </Link>
                <Link href="/sehir" className="btn btnSoft btnBlock">
                  Şehirleri Gör
                </Link>
              </div>
            </div>

            {/* Decorative illustration (SVG) */}
            <div className="illus" aria-hidden>
              <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="70" y1="30" x2="430" y2="380" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7C3AED" stopOpacity="0.14" />
                    <stop offset="1" stopColor="#0EA5E9" stopOpacity="0.10" />
                  </linearGradient>
                  <linearGradient id="g2" x1="120" y1="80" x2="380" y2="360" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#111827" stopOpacity="0.06" />
                    <stop offset="1" stopColor="#111827" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <rect x="30" y="30" width="460" height="360" rx="26" fill="url(#g1)" />
                <rect x="60" y="70" width="400" height="280" rx="22" fill="white" fillOpacity="0.7" />
                <rect x="88" y="98" width="210" height="16" rx="8" fill="url(#g2)" />
                <rect x="88" y="128" width="310" height="12" rx="6" fill="url(#g2)" />
                <rect x="88" y="150" width="280" height="12" rx="6" fill="url(#g2)" />
                <circle cx="370" cy="205" r="54" fill="#0EA5E9" fillOpacity="0.08" />
                <path
                  d="M360 176c-10 0-19 7-19 22 0 18 13 37 29 50 16-13 29-32 29-50 0-15-9-22-19-22-6 0-10 3-11 5-1-2-5-5-9-5z"
                  fill="#0EA5E9"
                  fillOpacity="0.35"
                />
                <rect x="88" y="198" width="220" height="84" rx="18" fill="#111827" fillOpacity="0.04" />
                <rect x="108" y="220" width="160" height="12" rx="6" fill="#111827" fillOpacity="0.08" />
                <rect x="108" y="242" width="190" height="12" rx="6" fill="#111827" fillOpacity="0.07" />
                <rect x="88" y="298" width="340" height="36" rx="18" fill="#111827" fillOpacity="0.06" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div className="sectionKicker">Hizmetler</div>
            <h2 className="sectionTitle">Popüler işlemler</h2>
            <p className="sectionDesc">En çok aranan tedaviler için şehir seçip teklif al.</p>
          </div>

          <div className="cards">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/hizmet/${s.slug}`} className="card">
                <div className="cardIcon" aria-hidden>
                  {s.icon}
                </div>
                <div className="cardBody">
                  <div className="cardTitle">{s.title}</div>
                  <div className="cardDesc">{s.desc}</div>
                </div>
                <div className="cardArrow" aria-hidden>
                  →
                </div>
              </Link>
            ))}
          </div>

          <div className="sectionCta">
            <Link href="/hizmetler" className="btn btnSoft">
              Tüm Hizmetleri Gör
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section sectionAlt">
        <div className="container">
          <div className="sectionHead">
            <div className="sectionKicker">Nasıl çalışır?</div>
            <h2 className="sectionTitle">3 adımda teklif al</h2>
            <p className="sectionDesc">Sade akış: şehir + işlem → form → klinikler iletişime geçsin.</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="stepNum">1</div>
              <div className="stepTitle">Şehir + hizmet seç</div>
              <div className="stepDesc">Örn: İstanbul İmplant sayfasına gir.</div>
              <Link href="/sehir" className="stepLink">
                Şehirleri gör →
              </Link>
            </div>

            <div className="step">
              <div className="stepNum">2</div>
              <div className="stepTitle">KVKK onaylı formu doldur</div>
              <div className="stepDesc">Ad, telefon, ne zaman bilgisi. Hepsi bu.</div>
              <Link href="/teklif-al" className="stepLink">
                Teklif al →
              </Link>
            </div>

            <div className="step">
              <div className="stepNum">3</div>
              <div className="stepTitle">Uygun klinikler iletişime geçsin</div>
              <div className="stepDesc">Kota ve uygunluk kontrolü ile adil yönlendirme.</div>
              <Link href="/kvkk" className="stepLink">
                KVKK →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="sectionHead">
            <div className="sectionKicker">Merak edilenler</div>
            <h2 className="sectionTitle">Kısa ve net cevaplar</h2>
            <p className="sectionDesc">Bu alan güveni artırır; iddiasız, anlaşılır.</p>
          </div>

          <div className="faq">
            <details className="faqItem">
              <summary>Teklif almak ücretli mi?</summary>
              <div className="faqBody">Hayır. Form ücretsizdir. Klinikler seninle iletişime geçer.</div>
            </details>

            <details className="faqItem">
              <summary>Kesin fiyat ne zaman belli olur?</summary>
              <div className="faqBody">Kesin fiyat muayene ve vaka değerlendirmesi sonrası netleşir.</div>
            </details>

            <details className="faqItem">
              <summary>Neden fiyatlar değişir?</summary>
              <div className="faqBody">Malzeme seçimi, vaka zorluğu ve muayene bulguları fiyatı etkiler.</div>
            </details>

            <details className="faqItem">
              <summary>KVKK onayı neden gerekli?</summary>
              <div className="faqBody">İletişim izni olmadan form gönderilemez. Güvenlik için zorunludur.</div>
            </details>
          </div>

          <div className="finalCta">
            <div>
              <div className="finalTitle">Şimdi teklif al, klinikler seni arasın</div>
              <div className="finalDesc">30 saniyede formu doldur. KVKK onaylıdır.</div>
            </div>
            <Link href="/teklif-al" className="btn btnPrimary">
              Teklif Al
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
