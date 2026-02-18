// src/app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { cityLabel, normalizeSlug } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

const POPULAR_TREATMENTS: ReadonlyArray<{
  slug: string;
  title: string;
  desc: string;
  icon: string;
}> = [
  { slug: "implant", title: "İmplant Tedavisi", desc: "Eksik dişler için planlama ve kalıcı çözümler.", icon: "🦷" },
  { slug: "zirkonyum", title: "Zirkonyum Kaplama", desc: "Estetik ve dayanıklılık odaklı uygulama.", icon: "✨" },
  { slug: "lamina", title: "Porselen Lamina", desc: "Gülüş estetiği için ince ve estetik kaplamalar.", icon: "😁" },
  { slug: "kanal-tedavisi", title: "Kanal Tedavisi", desc: "Enfekte dişi korumaya yönelik tedavi.", icon: "🧪" },
];

function clinicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function instagramHandleFromValue(value: string): string {
  const raw = value.trim();
  if (!raw) return "Instagram";

  // URL ise path'ten kullanıcı adı
  try {
    const u = new URL(raw);
    const p = u.pathname.replace(/^\/+|\/+$/g, "");
    const firstSeg = (p.split("/")[0] ?? "").trim();
    return firstSeg ? `@${firstSeg}` : "Instagram";
  } catch {
    // Kullanıcı adı olabilir
    const v = raw.replace(/^@+/, "");
    return v ? `@${v}` : "Instagram";
  }
}

function instagramHrefFromValue(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const v = raw.replace(/^@+/, "");
  if (!v) return "";
  return `https://www.instagram.com/${v}/`;
}

export default async function HomePage(): Promise<JSX.Element> {
  // Öne çıkan 6: aktif + en az 1 aktif coverage (şehir etiketi için)
  const featured = await prisma.clinic.findMany({
    where: {
      isActive: true,
      coverages: { some: { isActive: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      instagramUrl: true,
      coverages: {
        where: { isActive: true },
        select: { city: true },
        orderBy: { city: "asc" },
        take: 1,
      },
    },
  });

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              <div className="heroGrid">
                {/* LEFT */}
                <div>
                  <div className="kicker">⭐ Türkiye’de en çok aranan diş klinik ağı</div>

                  <h1 className="h1">
                    Diş Tedavisi Fiyatlarını Karşılaştır, <span className="grad">En İyi Teklifi</span> Al
                  </h1>

                  <p className="heroDesc">
                    30 saniyede KVKK onaylı formu doldur. Uygun klinikler seninle iletişime geçsin.
                    <br />
                    <strong>Kesin fiyat muayene sonrası netleşir.</strong>
                  </p>

                  <div className="ctaRow">
                    <Link href="/teklif-al" className="btn btnPrimary">
                      Ücretsiz Teklif Al →
                    </Link>
                    <Link href="/#nasil-calisir" className="btn btnGhost">
                      Nasıl Çalışır?
                    </Link>
                    <Link href="/hizmetler" className="btn btnSoft">
                      Hizmetleri İncele
                    </Link>
                  </div>

                  <div className="miniRow" aria-label="Güven rozetleri">
                    <span className="miniItem">✅ Ücretsiz</span>
                    <span className="miniItem">🔒 KVKK Onaylı</span>
                    <span className="miniItem">🛡️ Spam korumalı</span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="heroRight" aria-label="Popüler tedaviler">
                  <div className="treatGrid">
                    {POPULAR_TREATMENTS.map((t) => (
                      <div key={t.slug} className="treatCard">
                        <div className="treatTop">
                          <div className="treatIcon" aria-hidden>
                            {t.icon}
                          </div>
                          <div className="treatMeta">
                            <div className="treatLabel">{t.title}</div>
                            <div className="treatSub">Fiyatları karşılaştır</div>
                          </div>
                        </div>

                        <Link className="treatBtn" href={`/hizmet/${t.slug}`}>
                          Fiyat Al →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* POPULAR / STEPS BAR */}
              <div className="section" id="nasil-calisir">
                <h2 className="sectionTitle">Nasıl Çalışır?</h2>
                <div className="sectionBox">
                  <div className="stepsRow">
                    <div className="stepCard">
                      <div className="stepNum">1</div>
                      <div className="stepTitle">Formu Doldur</div>
                      <div className="stepDesc">Şehir + hizmet seç. Kısa KVKK onaylı formu doldur.</div>
                    </div>

                    <div className="stepCard">
                      <div className="stepNum">2</div>
                      <div className="stepTitle">Klinikler Arasın</div>
                      <div className="stepDesc">Uygun klinikler hızlıca seni arayıp bilgi versin.</div>
                    </div>

                    <div className="stepCard">
                      <div className="stepNum">3</div>
                      <div className="stepTitle">Uygun Teklifi Seç</div>
                      <div className="stepDesc">Muayene sonrası netleşen fiyatlar arasından karar ver.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KLINIKLERI KESFET (modern) */}
              <div className="section" id="klinikler">
                <h2 className="sectionTitle">Klinikleri Keşfet</h2>

                <div
                  style={{
                    borderRadius: 24,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background:
                      "radial-gradient(1200px 600px at 20% 0%, rgba(59,130,246,0.10), transparent 60%), linear-gradient(180deg,#fff, #fafafa)",
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      alignItems: "start",
                    }}
                  >
                    {/* LEFT */}
                    <div
                      style={{
                        borderRadius: 20,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "rgba(255,255,255,0.8)",
                        padding: 16,
                      }}
                    >
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontWeight: 950,
                            fontSize: 12,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(15,23,42,0.10)",
                            background: "#fff",
                          }}
                        >
                          🏥 Klinik Dizini
                        </span>
                        <span style={{ opacity: 0.7, fontWeight: 800, fontSize: 12 }}>
                          Profil + Instagram rozeti
                        </span>
                      </div>

                      <div style={{ marginTop: 10, fontWeight: 950, fontSize: 22 }}>
                        Klinik dizinine göz at, profilleri incele
                      </div>

                      <p style={{ marginTop: 10, color: "rgba(15,23,42,0.75)", fontWeight: 750, lineHeight: 1.7 }}>
                        Şehir ve hizmete göre filtrele. Kliniklerin Instagram profili varsa tek tıkla gör.
                        <br />
                        <strong>Teklif gönderimi abonelik kurallarına göre yapılır.</strong>
                      </p>

                      <div className="ctaRow" style={{ marginTop: 12 }}>
                        <Link href="/klinikler" className="btn btnPrimary">
                          Klinik Dizini →
                        </Link>
                        <Link href="/teklif-al" className="btn btnSoft">
                          Teklif Al →
                        </Link>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        {["📍 Şehir etiketi", "🧾 Profil detayı", "📸 Instagram rozeti"].map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: 12,
                              fontWeight: 850,
                              padding: "8px 10px",
                              borderRadius: 999,
                              border: "1px solid rgba(15,23,42,0.10)",
                              background: "rgba(255,255,255,0.9)",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div style={{ marginTop: 12, opacity: 0.7, fontWeight: 800, fontSize: 12 }}>
                        İpucu: Instagram ekleyen klinikler dizinde daha güven verici görünür.
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div
                      style={{
                        borderRadius: 20,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "rgba(255,255,255,0.8)",
                        padding: 16,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 950, fontSize: 16 }}>Öne çıkan klinikler</div>
                        <Link href="/klinikler" style={{ textDecoration: "none", fontWeight: 950, color: "#111" }}>
                          Tümünü gör →
                        </Link>
                      </div>

                      {featured.length > 0 ? (
                        <div
                          style={{
                            marginTop: 12,
                            display: "grid",
                            gap: 10,
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          }}
                        >
                          {featured.map((c) => {
                            const slug = clinicSlug(c.name, c.id);
                            const city = c.coverages[0]?.city ?? "";
                            const cityText = city ? cityLabel(city) : "—";
                            const ig = (c.instagramUrl ?? "").trim();
                            const igHref = ig ? instagramHrefFromValue(ig) : "";

                            return (
                              <Link
                                key={c.id}
                                href={`/klinikler/${slug}`}
                                style={{
                                  textDecoration: "none",
                                  color: "#111",
                                  borderRadius: 18,
                                  border: "1px solid rgba(15,23,42,0.08)",
                                  background: "#fff",
                                  padding: 14,
                                  display: "grid",
                                  gap: 10,
                                  boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                  <div style={{ fontWeight: 950 }}>{c.name}</div>
                                  <div style={{ opacity: 0.6, fontWeight: 900 }}>↗</div>
                                </div>

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 850,
                                      padding: "7px 10px",
                                      borderRadius: 999,
                                      border: "1px solid rgba(15,23,42,0.10)",
                                      background: "#fafafa",
                                    }}
                                  >
                                    📍 {cityText}
                                  </span>

                                  {ig ? (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 850,
                                        padding: "7px 10px",
                                        borderRadius: 999,
                                        border: "1px solid rgba(236,72,153,0.20)",
                                        background: "rgba(236,72,153,0.08)",
                                      }}
                                    >
                                      📸 {instagramHandleFromValue(ig)}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 850,
                                        padding: "7px 10px",
                                        borderRadius: 999,
                                        border: "1px solid rgba(15,23,42,0.10)",
                                        background: "#fafafa",
                                        opacity: 0.7,
                                      }}
                                    >
                                      Instagram yok
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                  <span style={{ fontWeight: 950, opacity: 0.9 }}>Detay →</span>

                                  {igHref ? (
                                    <span
                                      style={{
                                        fontWeight: 900,
                                        fontSize: 12,
                                        opacity: 0.8,
                                        border: "1px solid rgba(15,23,42,0.10)",
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        background: "#fff",
                                      }}
                                      title={igHref}
                                    >
                                      Instagram ↗
                                    </span>
                                  ) : (
                                    <span style={{ fontWeight: 800, fontSize: 12, opacity: 0.6 }}>—</span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ marginTop: 12, opacity: 0.7, fontWeight: 800 }}>
                          Şu an öne çıkan klinik bulunamadı.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ + CTA ROW */}
              <div className="section">
                <h2 className="sectionTitle">Merak Edilenler</h2>

                <div className="sectionBox">
                  <div className="faqGrid">
                    <details className="faqItem">
                      <summary>Teklif almak ücretli mi?</summary>
                      <div className="faqBody">Hayır. Form ücretsizdir. Uygun klinikler seninle iletişime geçer.</div>
                    </details>

                    <details className="faqItem">
                      <summary>Kesin fiyat ne zaman belli olur?</summary>
                      <div className="faqBody">
                        Kesin fiyat; muayene bulguları, malzeme seçimi ve vaka zorluğuna göre netleşir.
                      </div>
                    </details>

                    <details className="faqItem">
                      <summary>KVKK onayı neden gerekli?</summary>
                      <div className="faqBody">İletişim izni olmadan form gönderilemez. Güvenlik için zorunludur.</div>
                    </details>

                    <details className="faqItem">
                      <summary>Fiyatlar neden değişir?</summary>
                      <div className="faqBody">Muayene, görüntüleme, malzeme seçimi ve tedavi planı fiyatı etkiler.</div>
                    </details>
                  </div>

                  <div className="finalCta">
                    <div>
                      <h3 className="finalTitle">Şimdi teklif al, klinikler seni arasın</h3>
                      <p className="finalDesc">30 saniyede formu doldur. KVKK onaylıdır.</p>
                    </div>

                    <Link href="/teklif-al" className="btn btnPrimary">
                      Teklif Al →
                    </Link>
                  </div>
                </div>
              </div>

              {/* BOTTOM QUICK LINKS */}
              <div className="section">
                <div className="sectionBox">
                  <div style={{ fontWeight: 950, fontSize: 16 }}>Hızlı Başlangıç</div>
                  <div style={{ marginTop: 6, color: "rgba(15,23,42,0.70)", fontWeight: 700, lineHeight: 1.7 }}>
                    Şehir ve hizmet seç → ilgili sayfadan KVKK onaylı teklif formuna git.
                  </div>

                  <div className="ctaRow" style={{ marginTop: 12 }}>
                    <Link href="/sehir" className="btn btnSoft">
                      Şehirleri Gör
                    </Link>
                    <Link href="/hizmetler" className="btn btnSoft">
                      Hizmetler
                    </Link>
                    <Link href="/kvkk" className="btn btnGhost">
                      KVKK Metni
                    </Link>
                    <Link href="/teklif-al" className="btn btnPrimary">
                      Teklif Al →
                    </Link>
                  </div>

                  <div style={{ marginTop: 10, color: "rgba(15,23,42,0.60)", fontWeight: 700, fontSize: 12 }}>
                    Not: Bu site bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir.
                  </div>
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
