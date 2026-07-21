// src/app/page.tsx

import Link from "next/link";
import AiDentalHero from "@/components/home/AiDentalHero";
import { prisma } from "@/lib/db";
import { cityLabel, normalizeSlug } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

function clinicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function instagramHandleFromValue(value: string): string {
  const raw = value.trim();

  if (!raw) {
    return "Instagram";
  }

  try {
    const url = new URL(raw);
    const pathname = url.pathname.replace(/^\/+|\/+$/g, "");
    const firstSegment = (pathname.split("/")[0] ?? "").trim();

    return firstSegment ? `@${firstSegment}` : "Instagram";
  } catch {
    const username = raw.replace(/^@+/, "");

    return username ? `@${username}` : "Instagram";
  }
}

function instagramHrefFromValue(value: string): string {
  const raw = value.trim();

  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const username = raw.replace(/^@+/, "");

  if (!username) {
    return "";
  }

  return `https://www.instagram.com/${username}/`;
}

type FeaturedClinic = {
  id: string;
  name: string;
  instagramUrl: string | null;
  coverages: Array<{
    city: string;
  }>;
};

export default async function HomePage(): Promise<JSX.Element> {
  const featuredRaw = await prisma.clinic.findMany({
    where: {
      isActive: true,
      coverages: {
        some: {
          isActive: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 6,
    select: {
      id: true,
      name: true,
      instagramUrl: true,
      coverages: {
        where: {
          isActive: true,
        },
        select: {
          city: true,
        },
        orderBy: {
          city: "asc",
        },
        take: 1,
      },
    },
  });

  const featured: FeaturedClinic[] = featuredRaw;

  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="heroShell">
            <div className="heroInner">
              {/* AI DESTEKLİ YENİ HERO */}
              <AiDentalHero />

              {/* NASIL ÇALIŞIR */}
              <div className="section" id="nasil-calisir">
                <div className="homeSectionHead">
                  <div>
                    <h2 className="sectionTitle" style={{ margin: 0 }}>
                      Nasıl Çalışır?
                    </h2>

                    <div className="homeSectionSub">
                      30 saniyede formu doldur, uygun klinikler seni arasın.
                    </div>
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

                      <div className="stepDesc">
                        Şehir + hizmet seç. KVKK onaylı kısa formu gönder.
                      </div>

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

                      <div className="stepDesc">
                        Uygun klinikler hızlıca seni arayıp bilgi versin.
                      </div>

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

                      <div className="stepDesc">
                        Muayene sonrası netleşen fiyatlar arasından karar ver.
                      </div>

                      <div className="stepPills">
                        <span className="pill">📌 Şeffaf</span>
                        <span className="pill">💬 İletişim</span>
                        <span className="pill">🦷 Doğru tedavi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KLİNİKLERİ KEŞFET */}
              <div className="section" id="klinikler">
                <div className="homeSectionHead">
                  <div>
                    <h2 className="sectionTitle" style={{ margin: 0 }}>
                      Klinikleri Keşfet
                    </h2>

                    <div className="homeSectionSub">
                      Klinik profillerini incele, Instagram’ı olanları tek
                      tıkla gör.
                    </div>
                  </div>

                  <Link href="/klinikler" className="homeMiniCta">
                    Klinik Dizini →
                  </Link>
                </div>

                <div className="clinicExploreShell">
                  <div className="clinicExploreInner">
                    {/* LEFT */}
                    <div className="clinicExploreLeft">
                      <div className="clinicExploreKicker">
                        🏥 Klinik Dizini • Profil + Instagram rozeti
                      </div>

                      <div className="clinicExploreTitle">
                        Klinik dizinine göz at, profilleri incele
                      </div>

                      <div className="clinicExploreDesc">
                        Şehir ve hizmete göre filtrele. Kliniklerin Instagram
                        profili varsa tek tıkla gör.
                        <br />
                        <strong>
                          Teklif gönderimi abonelik kurallarına göre yapılır.
                        </strong>
                      </div>

                      <div className="clinicExploreCtas">
                        <Link
                          href="/klinikler"
                          className="btn btnPrimary"
                        >
                          Klinik Dizini →
                        </Link>

                        <Link href="/teklif-al" className="btn btnSoft">
                          Teklif Al →
                        </Link>
                      </div>

                      <div className="clinicExploreBadges">
                        <span className="clinicBadge">📍 Şehir etiketi</span>
                        <span className="clinicBadge">🧾 Profil detayı</span>
                        <span className="clinicBadge">
                          📸 Instagram rozeti
                        </span>
                      </div>

                      <div className="clinicExploreNote">
                        İpucu: Instagram ekleyen klinikler dizinde daha güven
                        verici görünür.
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="clinicExploreRight">
                      <div className="clinicExploreTop">
                        <div className="clinicExploreTopTitle">
                          Öne çıkan klinikler
                        </div>

                        <Link
                          href="/klinikler"
                          className="clinicExploreTopLink"
                        >
                          Tümünü gör →
                        </Link>
                      </div>

                      {featured.length > 0 ? (
                        <div className="clinicExploreGrid">
                          {featured.map((clinic) => {
                            const slug = clinicSlug(
                              clinic.name,
                              clinic.id,
                            );

                            const city =
                              clinic.coverages[0]?.city ?? "";

                            const cityText = city
                              ? cityLabel(city)
                              : "—";

                            const instagramValue = (
                              clinic.instagramUrl ?? ""
                            ).trim();

                            const instagramHref = instagramValue
                              ? instagramHrefFromValue(instagramValue)
                              : "";

                            const instagramLabel = instagramValue
                              ? instagramHandleFromValue(instagramValue)
                              : "";

                            return (
                              <Link
                                key={clinic.id}
                                href={`/klinikler/${slug}`}
                                className="clinicExploreCard"
                              >
                                <div className="clinicExploreCardHead">
                                  <div className="clinicExploreCardName">
                                    {clinic.name}
                                  </div>

                                  <div className="clinicExploreCardArrow">
                                    ↗
                                  </div>
                                </div>

                                <div className="clinicExploreCardMeta">
                                  <span className="clinicChip">
                                    📍 {cityText}
                                  </span>

                                  {instagramValue ? (
                                    <span className="clinicChip clinicChipIg">
                                      📸 {instagramLabel}
                                    </span>
                                  ) : (
                                    <span className="clinicChip clinicChipMuted">
                                      Instagram yok
                                    </span>
                                  )}
                                </div>

                                <div className="clinicExploreCardFoot">
                                  <div className="clinicExploreCardCta">
                                    Detay →
                                  </div>

                                  {instagramHref ? (
                                    <span
                                      className="clinicExploreIgLink"
                                      title={instagramHref}
                                    >
                                      Instagram ↗
                                    </span>
                                  ) : (
                                    <span className="clinicExploreIgLinkDisabled">
                                      —
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="clinicExploreEmpty">
                          Şu an öne çıkan klinik bulunamadı.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ + CTA */}
              <div className="section">
                <h2 className="sectionTitle">Merak Edilenler</h2>

                <div className="sectionBox">
                  <div className="faqGrid">
                    <details className="faqItem">
                      <summary>Teklif almak ücretli mi?</summary>

                      <div className="faqBody">
                        Hayır. Form ücretsizdir. Uygun klinikler seninle
                        iletişime geçer.
                      </div>
                    </details>

                    <details className="faqItem">
                      <summary>Kesin fiyat ne zaman belli olur?</summary>

                      <div className="faqBody">
                        Kesin fiyat; muayene bulguları, malzeme seçimi ve vaka
                        zorluğuna göre netleşir.
                      </div>
                    </details>

                    <details className="faqItem">
                      <summary>KVKK onayı neden gerekli?</summary>

                      <div className="faqBody">
                        İletişim izni olmadan form gönderilemez. Güvenlik için
                        zorunludur.
                      </div>
                    </details>

                    <details className="faqItem">
                      <summary>Fiyatlar neden değişir?</summary>

                      <div className="faqBody">
                        Muayene, görüntüleme, malzeme seçimi ve tedavi planı
                        fiyatı etkiler.
                      </div>
                    </details>
                  </div>

                  <div className="finalCta">
                    <div>
                      <h3 className="finalTitle">
                        Şimdi teklif al, klinikler seni arasın
                      </h3>

                      <p className="finalDesc">
                        30 saniyede formu doldur. KVKK onaylıdır.
                      </p>
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
                    <div className="quickStartTitle">
                      Hızlı Başlangıç
                    </div>

                    <Link
                      href="/teklif-al"
                      className="quickStartCta"
                    >
                      Teklif Al →
                    </Link>
                  </div>

                  <div className="quickStartDesc">
                    Şehir ve hizmet seç → ilgili sayfadan KVKK onaylı teklif
                    formuna git.
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

                  <div className="quickStartNote">
                    Not: Bu site bilgilendirme amaçlıdır; tıbbi teşhis veya
                    tavsiye değildir.
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