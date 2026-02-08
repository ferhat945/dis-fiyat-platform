import Link from "next/link";
import type { Metadata } from "next";
import { CITIES, SERVICES, SERVICE_LABELS } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

function normalizeSlug(v: string): string {
  return (v ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}\-]+/gu, "");
}

function titleTR(slug: string): string {
  const s = normalizeSlug(slug).replace(/-/g, " ");
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
    .join(" ");
}

function cityLabel(citySlug: string): string {
  const s = normalizeSlug(citySlug);
  const map: Record<string, string> = {
    istanbul: "İstanbul",
    ankara: "Ankara",
    izmir: "İzmir",
    bursa: "Bursa",
    antalya: "Antalya",
  };
  return map[s] ?? titleTR(s);
}

function serviceLabel(serviceSlug: string): string {
  const s = normalizeSlug(serviceSlug);
  return SERVICE_LABELS[s] ?? titleTR(s);
}

function serviceContent(serviceSlug: string) {
  const s = normalizeSlug(serviceSlug);

  const commonFaq = [
    { q: "Fiyatlar neden değişir?", a: "Muayene bulguları, malzeme seçimi ve vaka zorluğu fiyatı etkiler." },
    { q: "Teklif almak ücretli mi?", a: "Hayır. Form ücretsizdir, klinikler seninle iletişime geçer." },
    { q: "Kesin fiyatı nasıl öğrenirim?", a: "Kesin fiyat, klinikte muayene sonrası netleşir." },
  ];

  const map: Record<string, { bullets: string[]; highlight: string; faq?: { q: string; a: string }[] }> = {
    implant: {
      highlight: "Eksik dişlerin yerine implant ile uzun ömürlü çözüm hedeflenir.",
      bullets: ["Muayene + görüntüleme ile planlama yapılır.", "Kemik durumu ve genel sağlık değerlendirilir.", "Süreç kişiye göre değişebilir."],
    },
    zirkonyum: {
      highlight: "Zirkonyum kaplama, estetik ve dayanıklılık açısından sık tercih edilir.",
      bullets: ["Renk uyumu ve doğal görünüm hedeflenir.", "Ölçü ve prova aşamaları olur.", "Uygun bakım ile uzun süre kullanılabilir."],
    },
    lamina: {
      highlight: "Lamina (yaprak porselen) ön diş estetiğinde popüler bir uygulamadır.",
      bullets: ["Minimal aşındırma ile uygulanabilir (vaka uygunsa).", "Renk/şekil kişiye özel tasarlanır.", "Kırılma riskini azaltmak için kullanım önerileri verilir."],
    },
    "dis-beyazlatma": {
      highlight: "Diş beyazlatma, diş tonunu açmaya yönelik estetik işlemdir.",
      bullets: ["Klinik uygulaması veya ev tipi plakla yapılabilir.", "Hassasiyet riski için hekim yönlendirmesi önemlidir.", "Sonuç kişiden kişiye değişebilir."],
    },
    "kanal-tedavisi": {
      highlight: "Kanal tedavisi, enfekte diş sinirini tedavi ederek dişi korumayı hedefler.",
      bullets: ["Tek veya birkaç seans sürebilir.", "Tedavi sonrası kaplama gerekebilir (vakaya göre).", "Ağrı/iltihap durumlarında sık uygulanır."],
    },
    "dis-tasi-temizligi": {
      highlight: "Diş taşı temizliği diş eti sağlığı için önemlidir.",
      bullets: ["Diş eti kanaması ve kötü koku şikâyetlerini azaltmaya yardımcı olabilir.", "Düzenli kontrol önerilir.", "Diş hekimi, sıklığı kişiye göre belirler."],
    },
    dolgu: {
      highlight: "Dolgu, çürüğün temizlenip dişin restore edilmesidir.",
      bullets: ["Kompozit dolgular estetik görünüm sunar.", "Erken müdahale daha az doku kaybı demektir.", "Ağız hijyeni ömrünü etkiler."],
    },
    kaplama: {
      highlight: "Kaplama, dişi güçlendirmek ve estetiği iyileştirmek için uygulanabilir.",
      bullets: ["Porselen/zirconyum gibi seçenekler bulunur.", "Ölçü ve prova aşamaları olur.", "Diş sıkma gibi durumlar seçimi etkileyebilir."],
    },
    ortodonti: {
      highlight: "Ortodonti, diş dizilimini düzeltmeye yönelik tedavidir.",
      bullets: ["Tel veya şeffaf plak seçenekleri olabilir.", "Süre vakaya göre değişir.", "Kontroller düzenli yapılmalıdır."],
    },
  };

  const base =
    map[s] ??
    ({
      highlight: "Bu hizmet için şehir seçip teklif alabilirsin.",
      bullets: ["Detaylı bilgi için klinikler muayene sonrası net bilgi verir."],
    } as const);

  return {
    ...base,
    faq: base.faq ?? commonFaq, // ✅ her zaman FAQ göster
  };
}

type PageProps = {
  params: Promise<{ city: string; service: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, service } = await params;
  const c = normalizeSlug(city);
  const s = normalizeSlug(service);

  const cityName = cityLabel(c);
  const serviceName = SERVICE_LABELS[s] ?? titleTR(s); // ✅ istediğin satır burada

  return {
    title: `${cityName} ${serviceName} Fiyatları • Teklif Al`,
    description: `${cityName} şehrinde ${serviceName} için kliniklerden teklif al. KVKK onaylı form, hızlı iletişim. Kesin fiyat muayene sonrası netleşir.`,
    alternates: { canonical: `/sehir/${c}/${s}` },
    openGraph: {
      title: `${cityName} • ${serviceName} Teklif Al`,
      description: `${cityName} şehrinde ${serviceName} için uygun klinikler seninle iletişime geçsin.`,
      url: `/sehir/${c}/${s}`,
      type: "website",
    },
  };
}

export default async function CityServicePage({ params }: PageProps): Promise<JSX.Element> {
  const { city, service } = await params;

  const c = normalizeSlug(city);
  const s = normalizeSlug(service);

  const cityName = cityLabel(c);
  const serviceName = SERVICE_LABELS[s] ?? titleTR(s); // ✅ istediğin satır burada da

  const cityKnown = (CITIES as readonly string[]).includes(c);
  const serviceKnown = (SERVICES as readonly string[]).includes(s);

  const content = serviceContent(s);

  const teklifHref = `/teklif-al?city=${encodeURIComponent(c)}&service=${encodeURIComponent(s)}`;

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: 16 }}>
      {/* HERO */}
      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 20,
          padding: 18,
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ opacity: 0.75, fontWeight: 900 }}>
              <Link href={`/sehir/${c}`} style={{ textDecoration: "none", color: "#111" }}>
                {cityName}
              </Link>{" "}
              /{" "}
              <Link href={`/hizmet/${s}`} style={{ textDecoration: "none", color: "#111" }}>
                {serviceName}
              </Link>
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 950, margin: "8px 0 0 0" }}>
              {cityName} {serviceName} için Teklif Al
            </h1>

            <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.7, fontWeight: 650, opacity: 0.85 }}>
              {content.highlight}
              <br />
              KVKK onaylı formu doldur → uygun klinikler seninle iletişime geçsin.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <Link
                href={teklifHref}
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                }}
              >
                Teklif Al →
              </Link>

              <Link
                href="/kvkk"
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#111",
                }}
              >
                KVKK Metni
              </Link>
            </div>
          </div>

          {/* TRUST BOX */}
          <div
            style={{
              minWidth: 280,
              flex: "1 1 320px",
              border: "1px solid #f2f2f2",
              borderRadius: 16,
              padding: 14,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 950, fontSize: 16 }}>Güven & Süreç</div>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <TrustRow title="KVKK Onayı" desc="Onay olmadan form gönderilemez." />
              <TrustRow title="Spam Önleme" desc="Gizli honeypot alanı + rate limit." />
              <TrustRow title="Kesin Fiyat" desc="Kesin fiyat muayene sonrası netleşir." />
            </div>

            <div style={{ marginTop: 12, opacity: 0.65, fontSize: 12, fontWeight: 700 }}>
              Not: Bu sayfa bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir.
            </div>
          </div>
        </div>

        {(!cityKnown || !serviceKnown) && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              border: "1px solid #f2d7d7",
              background: "#fff7f7",
              fontWeight: 850,
              color: "#8a1c1c",
              lineHeight: 1.6,
            }}
          >
            Not: Bu sayfa çalışır. Ancak {!cityKnown ? `şehir (“${cityName}”)` : ""}{" "}
            {!cityKnown && !serviceKnown ? "ve" : ""} {!serviceKnown ? `hizmet (“${serviceName}”)` : ""} listemizde yok.
            SEO için listeleri büyütmek istersen ekleriz.
          </div>
        )}
      </section>

      {/* MAIN CONTENT */}
      <section style={{ marginTop: 16, display: "grid", gap: 14, gridTemplateColumns: "1.2fr 0.8fr" }}>
        {/* LEFT */}
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 14, background: "#fff" }}>
            <h2 style={{ fontSize: 18, fontWeight: 950, margin: 0 }}>
              {cityName}’de {serviceName} hakkında kısa bilgi
            </h2>

            <ul
              style={{
                marginTop: 10,
                marginBottom: 0,
                paddingLeft: 18,
                lineHeight: 1.9,
                fontWeight: 650,
                opacity: 0.9,
              }}
            >
              {content.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href={teklifHref}
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #111",
                  background: "#111",
                  color: "#fff",
                }}
              >
                {cityName} için Teklif Al →
              </Link>

              <Link
                href={`/sehir/${c}`}
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#111",
                }}
              >
                {cityName} sayfası
              </Link>

              <Link
                href={`/hizmet/${s}`}
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#111",
                }}
              >
                {serviceName} sayfası
              </Link>
            </div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 14, background: "#fff" }}>
            <h3 style={{ fontSize: 18, fontWeight: 950, margin: 0 }}>Sık sorular</h3>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              {(content.faq ?? []).map((f) => (
                <div key={f.q} style={{ border: "1px solid #f3f3f3", borderRadius: 16, padding: 12 }}>
                  <div style={{ fontWeight: 950 }}>{f.q}</div>
                  <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 650, lineHeight: 1.7 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside style={{ display: "grid", gap: 14 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 14, background: "#fff" }}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Hızlı Teklif</div>
            <div style={{ marginTop: 6, opacity: 0.8, fontWeight: 650, lineHeight: 1.6 }}>
              30 saniyede formu doldur. Uygun klinikler seni arasın.
            </div>

            <Link
              href={teklifHref}
              style={{
                display: "inline-block",
                marginTop: 12,
                textDecoration: "none",
                fontWeight: 950,
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
              }}
            >
              Teklif Al →
            </Link>

            <div style={{ marginTop: 10, opacity: 0.65, fontSize: 12, fontWeight: 700 }}>KVKK onayı zorunludur.</div>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 14, background: "#fff" }}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>Diğer popüler sayfalar</div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {SERVICES.filter((x) => x !== s)
                .slice(0, 6)
                .map((ss) => (
                  <Link
                    key={ss}
                    href={`/sehir/${c}/${ss}`}
                    style={{
                      textDecoration: "none",
                      fontWeight: 900,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #eee",
                      background: "#fafafa",
                      color: "#111",
                    }}
                  >
                    {cityName} {serviceLabel(ss)}
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </section>

      {/* FOOTER LINKS */}
      <section style={{ marginTop: 18, borderTop: "1px solid #eee", paddingTop: 14, opacity: 0.9 }}>
        <div style={{ fontWeight: 950 }}>Daha fazlası</div>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href={`/sehir/${c}`} style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            {cityName} sayfasına dön →
          </Link>
          <Link href={`/hizmet/${s}`} style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            {serviceName} genel sayfa →
          </Link>
          <Link href="/" style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            Ana sayfa →
          </Link>
        </div>
      </section>
    </main>
  );
}

function TrustRow({ title, desc }: { title: string; desc: string }): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: "#111",
          marginTop: 7,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 950 }}>{title}</div>
        <div style={{ opacity: 0.8, fontWeight: 650, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}
