import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { cityLabel, normalizeSlug } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

type CoverageRow = {
  id: string;
  city: string;
  service: string;
};

type SubscriptionRow = {
  id: string;
  status: string;
  quotaTotal: number;
  quotaUsed: number;
  expiresAt: Date;
};

type PriceRangeRow = {
  id: string;
  city: string;
  service: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  updatedAt: Date;
};

function parseClinicIdFromSlug(slugOrId: string): string {
  const raw = decodeURIComponent(slugOrId || "").trim();
  if (!raw) return "";
  const parts = raw.split("--");
  const last = parts[parts.length - 1]?.trim();
  return last || raw;
}

function clinicPublicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function instagramHandleFromValue(value: string): string {
  const raw = (value ?? "").trim();
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
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const v = raw.replace(/^@+/, "");
  if (!v) return "";
  return `https://www.instagram.com/${v}/`;
}

function pickPrimaryCity(coverages: Array<{ city: string }>): string {
  const c = (coverages?.[0]?.city ?? "").trim();
  return c;
}

function formatTRDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString("tr-TR");
}

function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount);
}

function currencySymbol(code: string): string {
  const c = (code || "").toUpperCase().trim();
  if (c === "TRY") return "₺";
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  return c || "₺";
}

/**
 * SEO/UX: Hizmet slug'larını kullanıcı dostu label'a çevir.
 */
function serviceLabel(slug: string): string {
  const s = (slug ?? "").trim().toLowerCase();
  const map: Record<string, string> = {
    implant: "İmplant",
    zirkonyum: "Zirkonyum Kaplama",
    "zirkonyum-kaplama": "Zirkonyum Kaplama",
    lamina: "Lamina (Yaprak Porselen)",
    "yaprak-porselen": "Lamina (Yaprak Porselen)",
    porselen: "Porselen Kaplama",
    "porselen-kaplama": "Porselen Kaplama",
    "kanal-tedavisi": "Kanal Tedavisi",
    kanal: "Kanal Tedavisi",
    dolgu: "Dolgu",
    "dis-cekimi": "Diş Çekimi",
    "diş-cekimi": "Diş Çekimi",
    "dis-tasi": "Diş Taşı Temizliği",
    "dis-tasi-temizligi": "Diş Taşı Temizliği",
    ortodonti: "Ortodonti (Tel)",
    "dis-beyazlatma": "Diş Beyazlatma",
    "gulus-tasarimi": "Gülüş Tasarımı",
    protez: "Protez",
  };

  const hit = map[s];
  if (hit) return hit;

  const spaced = s.replace(/[-_]+/g, " ").trim();
  if (!spaced) return "Hizmet";

  return spaced
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1))
    .join(" ");
}

function serviceCategory(slug: string): string {
  const s = (slug ?? "").trim().toLowerCase();

  const rules: Array<{ test: (v: string) => boolean; label: string }> = [
    { test: (v) => v.includes("implant"), label: "İmplant" },
    { test: (v) => v.includes("kanal"), label: "Kanal" },
    { test: (v) => v.includes("dolgu"), label: "Dolgu" },
    { test: (v) => v.includes("zirkonyum") || v.includes("porselen") || v.includes("lamina"), label: "Kaplama" },
    { test: (v) => v.includes("cekimi") || v.includes("çekimi"), label: "Cerrahi" },
    { test: (v) => v.includes("ortodonti") || v.includes("tel"), label: "Ortodonti" },
    { test: (v) => v.includes("beyazlatma"), label: "Estetik" },
    { test: (v) => v.includes("protez"), label: "Protez" },
    { test: (v) => v.includes("tas") || v.includes("temiz"), label: "Bakım" },
  ];

  const found = rules.find((r) => r.test(s));
  return found?.label ?? "Diş";
}

/** JSON-LD helpers */
function breadcrumbsJsonLd(items: Array<{ name: string; item: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.name,
      item: x.item,
    })),
  };
}

function webPageJsonLd(opts: { url: string; name: string; description: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: "tr-TR",
  };
}

function howToJsonLd(opts: { url: string; name: string; description: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    inLanguage: "tr-TR",
    step: [
      { "@type": "HowToStep", name: "Kliniği seç", text: "Bu sayfadan başvuruyu başlat." },
      { "@type": "HowToStep", name: "Formu doldur", text: "KVKK onaylı formu 30 saniyede doldur." },
      { "@type": "HowToStep", name: "Klinik dönüş yapsın", text: "Seçtiğin klinik seninle iletişime geçer." },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const clinicId = parseClinicIdFromSlug(id);
  if (!clinicId) return { title: "Klinik | DişFiyat360", robots: { index: false, follow: false } };

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { id: true, name: true, isActive: true },
  });

  if (!clinic || !clinic.isActive) {
    return { title: "Klinik bulunamadı", robots: { index: false, follow: false } };
  }

  const canonicalSlug = clinicPublicSlug(clinic.name, clinic.id);

  return {
    title: `${clinic.name} | Klinik Profili`,
    description: `${clinic.name} kliniğinin profilini inceleyin, hizmet kapsamlarını görün ve ücretsiz ön görüşme için başvuru yapın.`,
    alternates: { canonical: `/klinikler/${encodeURIComponent(canonicalSlug)}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title: `${clinic.name} | DişFiyat360`,
      description: `${clinic.name} profili — hizmet kapsamları ve ücretsiz ön görüşme başvurusu.`,
      url: `/klinikler/${encodeURIComponent(canonicalSlug)}`,
      locale: "tr_TR",
    },
  };
}

export default async function ClinicDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const { id } = await params;
  const clinicId = parseClinicIdFromSlug(id);
  if (!clinicId) notFound();

  const now = new Date();

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      name: true,
      phone: true,
      instagramUrl: true,
      updatedAt: true,
      isActive: true,
      coverages: {
        where: { isActive: true },
        orderBy: [{ city: "asc" }, { service: "asc" }],
        select: { id: true, city: true, service: true },
      },
      subscriptions: {
        where: { status: { in: ["active", "trial"] }, expiresAt: { gt: now } },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { id: true, status: true, quotaTotal: true, quotaUsed: true, expiresAt: true },
      },
      priceRanges: {
        where: { isActive: true },
        orderBy: [{ city: "asc" }, { service: "asc" }, { updatedAt: "desc" }],
        take: 120,
        select: {
          id: true,
          city: true,
          service: true,
          minPrice: true,
          maxPrice: true,
          currency: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!clinic || !clinic.isActive) notFound();

  const canonicalSlug = clinicPublicSlug(clinic.name, clinic.id);
  const canonicalUrlPath = `/klinikler/${encodeURIComponent(canonicalSlug)}`;

  const sub: SubscriptionRow | null = (clinic.subscriptions?.[0] as SubscriptionRow | undefined) ?? null;
  const hasQuota = !!sub && sub.quotaUsed < sub.quotaTotal;
  const isOpen = !!sub && hasQuota;

  const coverages: CoverageRow[] = (clinic.coverages ?? []) as CoverageRow[];
  const primaryCity = pickPrimaryCity(coverages.map((x) => ({ city: x.city })));
  const primaryCityLabel = primaryCity ? cityLabel(primaryCity) : "—";

  // coverages grouped by city
  const cityMap = new Map<string, CoverageRow[]>();
  for (const c of coverages) {
    const city = (c.city ?? "").trim();
    const service = (c.service ?? "").trim();
    if (!city || !service) continue;
    const arr = cityMap.get(city) ?? [];
    arr.push(c);
    cityMap.set(city, arr);
  }

  const groupedCoverages = Array.from(cityMap.entries()).map(([city, rows]) => {
    const uniq = new Map<string, CoverageRow>();
    for (const r of rows) uniq.set(r.service, r);
    const services = Array.from(uniq.values()).sort((a, b) => a.service.localeCompare(b.service, "tr"));
    return { city, services };
  });

  // price ranges grouped by city
  const prs: PriceRangeRow[] = (clinic.priceRanges ?? []) as PriceRangeRow[];
  const prMap = new Map<string, PriceRangeRow[]>();
  for (const pr of prs) {
    const city = (pr.city ?? "").trim();
    const service = (pr.service ?? "").trim();
    if (!city || !service) continue;
    const arr = prMap.get(city) ?? [];
    arr.push(pr);
    prMap.set(city, arr);
  }

  const groupedPrices = Array.from(prMap.entries()).map(([city, items]) => {
    const sorted = [...items].sort((a, b) => a.service.localeCompare(b.service, "tr"));
    const latest = sorted.reduce<Date | null>((acc, x) => {
      if (!acc) return x.updatedAt;
      return x.updatedAt > acc ? x.updatedAt : acc;
    }, null);
    return { city, items: sorted, latestUpdatedAt: latest };
  });

  const igRaw = (clinic.instagramUrl ?? "").trim();
  const igHref = igRaw ? instagramHrefFromValue(igRaw) : "";
  const igLabel = igRaw ? instagramHandleFromValue(igRaw) : "";

  // ✅ DIRECT başvuru linki (lead seçilen kliniğe gitsin)
  const directOfferHref = `/teklif-al?clinicId=${encodeURIComponent(clinic.id)}`;
  const generalOfferHref = "/teklif-al";
  const ctaHref = isOpen ? directOfferHref : generalOfferHref;

  // ✅ Rich results JSON-LD
  const dentistLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinic.name,
    telephone: clinic.phone || undefined,
    url: canonicalUrlPath,
    address: primaryCityLabel
      ? { "@type": "PostalAddress", addressLocality: primaryCityLabel, addressCountry: "TR" }
      : undefined,
    sameAs: igHref ? [igHref] : undefined,
  };

  const crumbsLd = breadcrumbsJsonLd([
    { name: "Ana sayfa", item: "/" },
    { name: "Klinikler", item: "/klinikler" },
    { name: clinic.name, item: canonicalUrlPath },
  ]);

  const pageLd = webPageJsonLd({
    url: canonicalUrlPath,
    name: `${clinic.name} | Klinik Profili`,
    description: `${clinic.name} profili — hizmet kapsamları, fiyat aralıkları ve ücretsiz ön görüşme başvurusu.`,
  });

  const howToLd = howToJsonLd({
    url: canonicalUrlPath,
    name: "Bu klinikten nasıl teklif alınır?",
    description: "3 adımda ücretsiz ön görüşme başvurusu.",
  });

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 16px 70px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ opacity: 0.8, fontWeight: 900 }}>
          <Link href="/klinikler" style={{ textDecoration: "none", color: "#111" }}>
            Klinikler
          </Link>{" "}
          / Profil
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href={ctaHref}
            style={{
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
              color: "#fff",
              fontWeight: 950,
              boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ✨ Ücretsiz Ön Görüşme →
          </Link>

          <Link
            href="/klinikler"
            style={{
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.75)",
              color: "#111",
              fontWeight: 900,
            }}
          >
            Listeye dön
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div
        style={{
          marginTop: 14,
          borderRadius: 26,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,0.10)",
          background:
            "radial-gradient(900px 420px at 15% 20%, rgba(124,58,237,0.20), transparent 60%), radial-gradient(900px 520px at 85% 0%, rgba(14,165,233,0.18), transparent 55%), rgba(255,255,255,0.70)",
          boxShadow: "0 18px 55px rgba(15,23,42,0.10)",
        }}
      >
        <div style={{ padding: 18 }}>
          <div
            className="clinicHeroGrid"
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "1.35fr 0.65fr",
              alignItems: "start",
            }}
          >
            {/* LEFT */}
            <div>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.1, fontWeight: 950 }}>
                {clinic.name}
              </h1>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 999,
                    fontWeight: 950,
                    fontSize: 12,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.72)",
                  }}
                >
                  📍 {primaryCityLabel}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 999,
                    fontWeight: 950,
                    fontSize: 12,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: isOpen ? "rgba(16,185,129,0.10)" : "rgba(245,158,11,0.12)",
                    color: isOpen ? "rgba(6,95,70,0.95)" : "rgba(124,45,18,0.95)",
                  }}
                >
                  {isOpen ? "✅ Şu anda başvuru alıyor" : "⏳ Şu an başvuru alamıyor"}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 10px",
                    borderRadius: 999,
                    fontWeight: 900,
                    fontSize: 12,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.62)",
                    opacity: 0.85,
                  }}
                >
                  🕒 Güncellendi: {formatTRDateTime(clinic.updatedAt)}
                </span>
              </div>

              {/* CONTACT + CTA CARD */}
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 20,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.78)",
                  padding: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 950, fontSize: 16 }}>İletişim</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {clinic.phone ? (
                    <a
                      href={`tel:${clinic.phone}`}
                      style={{
                        textDecoration: "none",
                        fontWeight: 950,
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.12)",
                        background: "rgba(255,255,255,0.90)",
                      }}
                    >
                      📞 {clinic.phone}
                    </a>
                  ) : (
                    <span style={{ opacity: 0.75, fontWeight: 850 }}>Telefon bilgisi eklenmemiş</span>
                  )}

                  {igHref ? (
                    <a
                      href={igHref}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        textDecoration: "none",
                        fontWeight: 950,
                        padding: "10px 12px",
                        borderRadius: 14,
                        border: "1px solid rgba(236,72,153,0.25)",
                        background: "rgba(236,72,153,0.10)",
                        color: "rgba(124,58,237,0.98)",
                      }}
                    >
                      📸 {igLabel} ↗
                    </a>
                  ) : (
                    <span style={{ opacity: 0.7, fontWeight: 850 }}>Instagram eklenmemiş</span>
                  )}
                </div>

                {isOpen ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Link
                      href={directOfferHref}
                      style={{
                        textDecoration: "none",
                        fontWeight: 950,
                        padding: "12px 14px",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.22)",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.95))",
                        color: "#fff",
                        boxShadow: "0 14px 30px rgba(15,23,42,0.14)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      💬 Ücretsiz Ön Görüşme Başvurusu →
                    </Link>

                    <span style={{ opacity: 0.78, fontWeight: 800, fontSize: 12 }}>
                      Not: Kesin ücret muayene sonrası netleşir.
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(245,158,11,0.25)",
                      background: "rgba(245,158,11,0.10)",
                      padding: 12,
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontWeight: 950, color: "rgba(124,45,18,0.95)" }}>
                      Şu an direkt başvuru alınmıyor
                    </div>
                    <div style={{ fontWeight: 800, opacity: 0.85, lineHeight: 1.6 }}>
                      Dilersen genel formdan başvuru bırakabilirsin; uygun klinikler seni arar.
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                      <Link
                        href={generalOfferHref}
                        style={{
                          textDecoration: "none",
                          fontWeight: 950,
                          padding: "10px 12px",
                          borderRadius: 14,
                          border: "1px solid rgba(15,23,42,0.12)",
                          background: "rgba(255,255,255,0.88)",
                          color: "#111",
                        }}
                      >
                        Genel Başvuru Formu →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT INFO */}
            <div
              style={{
                borderRadius: 20,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "rgba(255,255,255,0.72)",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 950 }}>Bu sayfa ne işe yarar?</div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  lineHeight: 1.75,
                  fontWeight: 760,
                  opacity: 0.92,
                  fontSize: 13,
                }}
              >
                <li>Kliniğin aktif şehir/hizmet kapsamlarını görürsün</li>
                <li>İlgili hizmet sayfalarına 1 tıkla gidersin</li>
                <li>KVKK onaylı form ile hızlıca başvuru yaparsın</li>
              </ul>

              <div style={{ marginTop: 10, fontWeight: 950 }}>Hızlı linkler</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { href: "/sehir", label: "Şehirler →" },
                  { href: "/hizmetler", label: "Hizmetler →" },
                  { href: "/klinikler", label: "Klinik Dizini →" },
                ].map((x) => (
                  <Link
                    key={x.href}
                    href={x.href}
                    style={{
                      textDecoration: "none",
                      fontWeight: 950,
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(15,23,42,0.10)",
                      background: "rgba(255,255,255,0.86)",
                      color: "#111",
                    }}
                  >
                    {x.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COVERAGES + PRICES */}
      <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
        {/* COVERAGES */}
        <section
          style={{
            borderRadius: 22,
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.72)",
            padding: 16,
            boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 950, fontSize: 20 }}>Hizmet Kapsamı</div>
              <div style={{ marginTop: 6, opacity: 0.78, fontWeight: 800, fontSize: 14, lineHeight: 1.7 }}>
                Klinik hangi şehirlerde hangi işlemleri yapıyor?
              </div>
            </div>

            <Link
              href={ctaHref}
              style={{
                textDecoration: "none",
                fontWeight: 950,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.12)",
                background: "rgba(255,255,255,0.85)",
              }}
            >
              Başvuru Yap →
            </Link>
          </div>

          {groupedCoverages.length === 0 ? (
            <div style={{ marginTop: 12, opacity: 0.75, fontWeight: 850 }}>Bu klinik için kapsam bilgisi yok.</div>
          ) : (
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {groupedCoverages.map((g) => (
                <div
                  key={g.city}
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.82)",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          padding: "8px 12px",
                          borderRadius: 999,
                          border: "1px solid rgba(15,23,42,0.10)",
                          background: "rgba(255,255,255,0.90)",
                          fontSize: 13,
                          fontWeight: 950,
                        }}
                      >
                        📍 {cityLabel(g.city)}
                      </span>
                      <span style={{ opacity: 0.72, fontWeight: 850, fontSize: 13 }}>{g.services.length} hizmet</span>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(124,58,237,0.18)",
                        background: "rgba(124,58,237,0.08)",
                        color: "rgba(124,58,237,0.98)",
                      }}
                    >
                      ✅ Aktif kapsamlar
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {g.services.map((r) => {
                      const sLabel = serviceLabel(r.service);
                      const cat = serviceCategory(r.service);

                      return (
                        <Link
                          key={r.id}
                          href={`/sehir/${encodeURIComponent(g.city)}/${encodeURIComponent(r.service)}`}
                          style={{
                            textDecoration: "none",
                            borderRadius: 999,
                            border: "1px solid rgba(15,23,42,0.10)",
                            background: "rgba(255,255,255,0.92)",
                            color: "#111",
                            padding: "9px 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            fontWeight: 950,
                            fontSize: 13,
                          }}
                          title={`${cityLabel(g.city)} / ${sLabel}`}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 950,
                              padding: "6px 9px",
                              borderRadius: 999,
                              border: "1px solid rgba(14,165,233,0.18)",
                              background: "rgba(14,165,233,0.08)",
                              color: "rgba(2,132,199,0.95)",
                            }}
                          >
                            {cat}
                          </span>
                          <span>{sLabel}</span>
                          <span style={{ opacity: 0.6, fontWeight: 900 }}>↗</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PRICE RANGES */}
        <section
          style={{
            borderRadius: 22,
            border: "1px solid rgba(15,23,42,0.10)",
            background: "rgba(255,255,255,0.72)",
            padding: 16,
            boxShadow: "0 10px 22px rgba(15,23,42,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 950, fontSize: 20 }}>Tahmini Fiyat Aralıkları</div>
              <div style={{ marginTop: 6, opacity: 0.78, fontWeight: 800, fontSize: 14, lineHeight: 1.7 }}>
                Klinik tarafından girilen bilgilendirme amaçlı aralıklar.
              </div>
            </div>

            <span
              style={{
                fontSize: 12,
                fontWeight: 950,
                padding: "8px 10px",
                borderRadius: 999,
                border: "1px solid rgba(245,158,11,0.25)",
                background: "rgba(245,158,11,0.10)",
                color: "rgba(124,45,18,0.95)",
              }}
            >
              Not: Kesin ücret muayene sonrası netleşir.
            </span>
          </div>

          {groupedPrices.length === 0 ? (
            <div style={{ marginTop: 12, opacity: 0.75, fontWeight: 850 }}>
              Bu klinik için fiyat aralığı bilgisi yok.
            </div>
          ) : (
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {groupedPrices.map((g) => (
                <div
                  key={g.city}
                  style={{
                    borderRadius: 18,
                    border: "1px solid rgba(15,23,42,0.10)",
                    background: "rgba(255,255,255,0.82)",
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontWeight: 950, fontSize: 14 }}>📍 {cityLabel(g.city)}</div>
                      <span style={{ opacity: 0.7, fontWeight: 850, fontSize: 12 }}>{g.items.length} kalem</span>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 950,
                          padding: "7px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(124,58,237,0.18)",
                          background: "rgba(124,58,237,0.08)",
                          color: "rgba(124,58,237,0.98)",
                        }}
                      >
                        🧾 Tahmini
                      </span>
                      {g.latestUpdatedAt ? (
                        <span style={{ opacity: 0.65, fontWeight: 800, fontSize: 12 }}>
                          Son güncelleme: {formatTRDateTime(g.latestUpdatedAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {g.items.map((x) => {
                      const sLabel = serviceLabel(x.service);
                      const cat = serviceCategory(x.service);
                      const sym = currencySymbol(x.currency);

                      return (
                        <div
                          key={x.id}
                          style={{
                            borderRadius: 16,
                            border: "1px solid rgba(15,23,42,0.10)",
                            background: "rgba(255,255,255,0.92)",
                            padding: 12,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 950,
                                padding: "6px 9px",
                                borderRadius: 999,
                                border: "1px solid rgba(14,165,233,0.18)",
                                background: "rgba(14,165,233,0.08)",
                                color: "rgba(2,132,199,0.95)",
                              }}
                            >
                              {cat}
                            </span>
                            <div style={{ fontWeight: 950, fontSize: 14 }}>{sLabel}</div>
                          </div>

                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                            <span
                              style={{
                                fontWeight: 950,
                                fontSize: 14,
                                padding: "8px 10px",
                                borderRadius: 999,
                                border: "1px solid rgba(15,23,42,0.10)",
                                background: "rgba(255,255,255,0.90)",
                              }}
                            >
                              {sym} {formatTRY(x.minPrice)} – {formatTRY(x.maxPrice)}
                            </span>

                            <span style={{ opacity: 0.6, fontWeight: 850, fontSize: 12 }}>
                              güncelleme: {formatTRDateTime(x.updatedAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ opacity: 0.75, fontWeight: 800, marginTop: 2 }}>
          Not: Bu sayfa bilgilendirme amaçlıdır; tıbbi teşhis/tavsiye değildir.
        </div>
      </div>

      {/* Responsive */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 980px){
            .clinicHeroGrid{
              grid-template-columns: 1fr !important;
            }
          }
        `,
        }}
      />
    </main>
  );
}