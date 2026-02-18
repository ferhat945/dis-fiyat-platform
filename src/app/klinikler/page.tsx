import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CITIES, SERVICES, cityLabel, serviceLabel, normalizeSlug, titleTR } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

function first(sp: SP, k: string): string {
  const v = sp[k];
  if (!v) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

function pickCity(sp: SP): string {
  const raw = first(sp, "city");
  return normalizeSlug(raw);
}

function pickService(sp: SP): string {
  const raw = first(sp, "service");
  return normalizeSlug(raw);
}

function pickQ(sp: SP): string {
  const raw = first(sp, "q");
  return (raw ?? "").trim().slice(0, 60);
}

function niceLabelCity(slug: string): string {
  if (!slug) return "Tümü";
  return (CITIES as readonly string[]).includes(slug) ? cityLabel(slug) : titleTR(slug);
}

function niceLabelService(slug: string): string {
  if (!slug) return "Tümü";
  return (SERVICES as readonly string[]).includes(slug) ? serviceLabel(slug) : titleTR(slug);
}

function buildCanonical(city: string, service: string, q: string): string {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  if (service) params.set("service", service);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/klinikler?${qs}` : "/klinikler";
}

function clinicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

function cleanInstagramForLabel(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/^\/+|\/+$/g, "");
    return p ? `@${p}` : "Instagram";
  } catch {
    return "Instagram";
  }
}

export const metadata: Metadata = {
  title: "Klinikler • Diş Fiyat Platform",
  description: "Şehir ve hizmete göre klinikleri keşfet. Uygun kliniklere ulaş, teklif al.",
  alternates: { canonical: "/klinikler" },
};

export default async function ClinicsIndexPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<JSX.Element> {
  const sp = await searchParams;

  const city = pickCity(sp);
  const service = pickService(sp);
  const q = pickQ(sp);

  const whereCoverage =
    city || service
      ? {
          coverages: {
            some: {
              isActive: true,
              ...(city ? { city } : {}),
              ...(service ? { service } : {}),
            },
          },
        }
      : {
          coverages: { some: { isActive: true } },
        };

  const whereName =
    q.length >= 2
      ? {
          name: { contains: q, mode: "insensitive" as const },
        }
      : {};

  const clinics = await prisma.clinic.findMany({
    where: {
      isActive: true,
      ...whereCoverage,
      ...whereName,
    },
    orderBy: [{ name: "asc" }],
    take: 120,
    select: {
      id: true,
      name: true,
      phone: true,
      instagramUrl: true,
      updatedAt: true,
      coverages: {
        where: { isActive: true, ...(city ? { city } : {}), ...(service ? { service } : {}) },
        select: { city: true, service: true },
        orderBy: [{ city: "asc" }, { service: "asc" }],
        take: 24,
      },
    },
  });

  const activeCityLabel = niceLabelCity(city);
  const activeServiceLabel = niceLabelService(service);

  const canonical = buildCanonical(city, service, q);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: "/" },
          { "@type": "ListItem", position: 2, name: "Klinikler", item: canonical },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Klinikler",
        description: "Şehir ve hizmete göre klinikleri keşfet. Uygun kliniklere ulaş, teklif al.",
        url: canonical,
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: clinics.length,
          itemListElement: clinics.map((c, idx) => {
            const slug = clinicSlug(c.name, c.id);
            const url = `/klinikler/${slug}`;
            return {
              "@type": "ListItem",
              position: idx + 1,
              item: {
                "@type": "MedicalOrganization",
                "@id": url,
                name: c.name,
                url,
                telephone: c.phone || undefined,
              },
            };
          }),
        },
      },
    ],
  };

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0 }}>Klinikler</h1>
        <Link href="/" style={{ textDecoration: "none", fontWeight: 900, color: "#111" }}>
          Ana sayfa →
        </Link>
      </div>

      <p style={{ marginTop: 10, opacity: 0.8, fontWeight: 650, lineHeight: 1.7 }}>
        Şehir ve hizmete göre filtrele. İstersen klinik adına göre arama yap.
      </p>

      <form
        action="/klinikler"
        method="GET"
        style={{
          marginTop: 14,
          border: "1px solid #eee",
          borderRadius: 18,
          padding: 14,
          background: "#fff",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 900 }}>Şehir</span>
            <select name="city" defaultValue={city} style={inp()}>
              <option value="">Tümü</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {cityLabel(c)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 900 }}>Hizmet</span>
            <select name="service" defaultValue={service} style={inp()}>
              <option value="">Tümü</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {serviceLabel(s)}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 900 }}>Arama</span>
            <input name="q" defaultValue={q} placeholder="Klinik adı..." style={inp()} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="submit"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              fontWeight: 950,
              cursor: "pointer",
              width: 180,
            }}
          >
            Filtrele
          </button>

          <Link
            href="/klinikler"
            style={{
              display: "inline-block",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              color: "#111",
              fontWeight: 950,
              textDecoration: "none",
            }}
          >
            Sıfırla
          </Link>

          <div style={{ alignSelf: "center", opacity: 0.7, fontWeight: 800 }}>
            Filtre: <strong>{activeCityLabel}</strong> / <strong>{activeServiceLabel}</strong>
            {q ? (
              <>
                {" "}
                / Arama: <strong>{q}</strong>
              </>
            ) : null}
          </div>
        </div>
      </form>

      <section style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 950 }}>
            Sonuç: <span style={{ opacity: 0.75 }}>{clinics.length}</span>
          </div>
          <Link href="/teklif-al" style={{ textDecoration: "none", fontWeight: 950, color: "#111" }}>
            Teklif Al →
          </Link>
        </div>

        {clinics.length === 0 && (
          <div
            style={{
              marginTop: 12,
              border: "1px solid #f2d7d7",
              background: "#fff7f7",
              borderRadius: 16,
              padding: 12,
              fontWeight: 850,
              color: "#8a1c1c",
              lineHeight: 1.6,
            }}
          >
            Klinik bulunamadı. Filtreyi genişletmeyi deneyin.
          </div>
        )}

        {clinics.length > 0 && (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {clinics.map((c) => {
              const slug = clinicSlug(c.name, c.id);
              const uniq = new Map<string, { city: string; service: string }>();
              for (const cv of c.coverages) uniq.set(`${cv.city}__${cv.service}`, cv);
              const tags = Array.from(uniq.values()).slice(0, 8);

              return (
                <Link
                  key={c.id}
                  href={`/klinikler/${slug}`}
                  style={{
                    textDecoration: "none",
                    border: "1px solid #eee",
                    borderRadius: 18,
                    padding: 14,
                    background: "#fff",
                    color: "#111",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 950, fontSize: 16 }}>{c.name}</div>
                    <div style={{ opacity: 0.6, fontWeight: 800, fontSize: 12 }}>
                      {new Date(c.updatedAt).toLocaleDateString("tr-TR")}
                    </div>
                  </div>

                  {c.phone ? (
                    <div style={{ opacity: 0.85, fontWeight: 800 }}>📞 {c.phone}</div>
                  ) : (
                    <div style={{ opacity: 0.6, fontWeight: 800 }}>📞 Telefon bilgisi yok</div>
                  )}

                  {c.instagramUrl ? (
                    <div style={{ opacity: 0.85, fontWeight: 850 }}>
                      📸 {cleanInstagramForLabel(c.instagramUrl)}
                    </div>
                  ) : (
                    <div style={{ opacity: 0.55, fontWeight: 800 }}>📸 Instagram eklenmemiş</div>
                  )}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {tags.map((t) => (
                      <span
                        key={`${t.city}-${t.service}`}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 999,
                          padding: "7px 10px",
                          fontWeight: 850,
                          fontSize: 12,
                          background: "#fafafa",
                        }}
                      >
                        {cityLabel(t.city)} • {serviceLabel(t.service)}
                      </span>
                    ))}
                    {uniq.size > tags.length && (
                      <span style={{ opacity: 0.65, fontWeight: 850, fontSize: 12 }}>+{uniq.size - tags.length}</span>
                    )}
                  </div>

                  <div style={{ fontWeight: 950, opacity: 0.85 }}>Detay →</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function inp(): React.CSSProperties {
  return {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid #ddd",
    background: "#fff",
    outline: "none",
    fontWeight: 800,
  };
}
