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

  try {
    const u = new URL(raw);
    const p = u.pathname.replace(/^\/+|\/+$/g, "");
    const firstSeg = (p.split("/")[0] ?? "").trim();
    return firstSeg ? `@${firstSeg}` : "Instagram";
  } catch {
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

type FeaturedClinic = {
  id: string;
  name: string;
  instagramUrl: string | null;
  coverages: Array<{ city: string }>;
};

export default async function HomePage(): Promise<JSX.Element> {
  const featuredRaw = await prisma.clinic.findMany({
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

  const featured: FeaturedClinic[] = featuredRaw;

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

              {/* NASIL ÇALIŞIR (PREMIUM) */}
              <div className="section" id="nasil-calisir">
                <div className="homeSectionHead">
                  <div>
                    <h2 className="sectionTitle" style={{ margin: 0 }}>
                      Nasıl Çalışır?
                    </h2>
                    <div className="homeSectionSub">30 saniyede formu doldur, uygun klinikler seni arasın.</div>
                  </div>

                  <Link href="/teklif-al" className="homeMiniCta">
                    Ücretsiz Teklif Al →
                  </Link>
                </div>

                <div className="stepsShell">
                  <div className="stepsRow">
                    <div className="stepCard stepCardV2">
                      <div className="stepTop">
                        <div className="stepBadge">
                          <span className="stepNum">1</span>
                        </div>
                        <div className="stepIcon" aria-hidden>
                          📝
                        </div>
                      </div>

                      <div className="stepTitle">Formu Doldur</div>
                      <div className="stepDesc">Şehir + hizmet seç. KVKK onaylı kısa formu gönder.</div>

                      <div className="stepPills">
                        <span className="pill">✅ Ücretsiz</span>
                        <span className="pill">🔒 KVKK</span>
                        <span className="pill">🛡️ Spam koruma</span>
                      </div>
                    </div>

                    <div className="stepCard stepCardV2">
                      <div className="stepTop">
                        <div className="stepBadge">
                          <span className="stepNum">2</span>
                        </div>
                        <div className="stepIcon" aria-hidden>
                          📞
                        </div>
                      </div>

                      <div className="stepTitle">Klinikler Arasın</div>
                      <div className="stepDesc">Uygun klinikler hızlıca seni arayıp bilgi versin.</div>

                      <div className="stepPills">
                        <span className="pill">⚡ Hızlı dönüş</span>
                        <span className="pill">🏥 Uygun klinik</span>
                        <span className="pill">🎯 Doğru yönlendirme</span>
                      </div>
                    </div>

                    <div className="stepCard stepCardV2">
                      <div className="stepTop">
                        <div className="stepBadge">
                          <span className="stepNum">3</span>
                        </div>
                        <div className="stepIcon" aria-hidden>
                          🤝
                        </div>
                      </div>

                      <div className="stepTitle">Uygun Teklifi Seç</div>
                      <div className="stepDesc">Muayene sonrası netleşen fiyatlar arasından karar ver.</div>

                      <div className="stepPills">
                        <span className="pill">📌 Şeffaf</span>
                        <span className="pill">💬 İletişim</span>
                        <span className="pill">🦷 Doğru tedavi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KLINIKLERI KESFET (PREMIUM) */}
              <div className="section" id="klinikler">
                <div className="homeSectionHead">
                  <div>
                    <h2 className="sectionTitle" style={{ margin: 0 }}>
                      Klinikleri Keşfet
                    </h2>
                    <div className="homeSectionSub">Klinik profillerini incele, Instagram’ı olanları tek tıkla gör.</div>
                  </div>

                  <Link href="/klinikler" className="homeMiniCta">
                    Klinik Dizini →
                  </Link>
                </div>

                <div className="clinicExploreShell">
                  <div className="clinicExploreInner">
                    {/* LEFT */}
                    <div className="clinicExploreLeft">
                      <div className="clinicExploreKicker">🏥 Klinik Dizini • Profil + Instagram rozeti</div>

                      <div className="clinicExploreTitle">Klinik dizinine göz at, profilleri incele</div>

                      <div className="clinicExploreDesc">
                        Şehir ve hizmete göre filtrele. Kliniklerin Instagram profili varsa tek tıkla gör.
                        <br />
                        <strong>Teklif gönderimi abonelik kurallarına göre yapılır.</strong>
                      </div>

                      <div className="clinicExploreCtas">
                        <Link href="/klinikler" className="btn btnPrimary">
                          Klinik Dizini →
                        </Link>
                        <Link href="/teklif-al" className="btn btnSoft">
                          Teklif Al →
                        </Link>
                      </div>

                      <div className="clinicExploreBadges">
                        <span className="clinicBadge">📍 Şehir etiketi</span>
                        <span className="clinicBadge">🧾 Profil detayı</span>
                        <span className="clinicBadge">📸 Instagram rozeti</span>
                      </div>

                      <div className="clinicExploreNote">İpucu: Instagram ekleyen klinikler dizinde daha güven verici görünür.</div>
                    </div>

                    {/* RIGHT */}
                    <div className="clinicExploreRight">
                      <div className="clinicExploreTop">
                        <div className="clinicExploreTopTitle">Öne çıkan klinikler</div>
                        <Link href="/klinikler" className="clinicExploreTopLink">
                          Tümünü gör →
                        </Link>
                      </div>

                      {featured.length > 0 ? (
                        <div className="clinicExploreGrid">
                          {featured.map((c) => {
                            const slug = clinicSlug(c.name, c.id);
                            const city = c.coverages[0]?.city ?? "";
                            const cityText = city ? cityLabel(city) : "—";

                            const ig = (c.instagramUrl ?? "").trim();
                            const igHref = ig ? instagramHrefFromValue(ig) : "";
                            const igLabel = ig ? instagramHandleFromValue(ig) : "";

                            return (
                              <Link key={c.id} href={`/klinikler/${slug}`} className="clinicExploreCard">
                                <div className="clinicExploreCardHead">
                                  <div className="clinicExploreCardName">{c.name}</div>
                                  <div className="clinicExploreCardArrow">↗</div>
                                </div>

                                <div className="clinicExploreCardMeta">
                                  <span className="clinicChip">📍 {cityText}</span>

                                  {ig ? (
                                    <span className="clinicChip clinicChipIg">📸 {igLabel}</span>
                                  ) : (
                                    <span className="clinicChip clinicChipMuted">Instagram yok</span>
                                  )}
                                </div>

                                <div className="clinicExploreCardFoot">
                                  <div className="clinicExploreCardCta">Detay →</div>

                                  {igHref ? (
                                    <span className="clinicExploreIgLink" title={igHref}>
                                      Instagram ↗
                                    </span>
                                  ) : (
                                    <span className="clinicExploreIgLinkDisabled">—</span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="clinicExploreEmpty">Şu an öne çıkan klinik bulunamadı.</div>
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
                      <div className="faqBody">Kesin fiyat; muayene bulguları, malzeme seçimi ve vaka zorluğuna göre netleşir.</div>
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
                <div className="sectionBox quickStartBox">
                  <div className="quickStartHead">
                    <div className="quickStartTitle">Hızlı Başlangıç</div>
                    <Link href="/teklif-al" className="quickStartCta">
                      Teklif Al →
                    </Link>
                  </div>

                  <div className="quickStartDesc">Şehir ve hizmet seç → ilgili sayfadan KVKK onaylı teklif formuna git.</div>

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

                  <div className="quickStartNote">Not: Bu site bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir.</div>
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