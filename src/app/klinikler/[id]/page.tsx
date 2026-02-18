import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { cityLabel, serviceLabel, normalizeSlug } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function extractId(idOrSlug: string): string {
  const v = (idOrSlug ?? "").trim();
  if (!v) return "";
  const idx = v.lastIndexOf("--");
  if (idx >= 0 && idx + 2 < v.length) return v.slice(idx + 2);
  return v;
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: idOrSlug } = await params;
  const id = extractId(idOrSlug);

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true },
  });

  const fallbackCanonical = `/klinikler/${encodeURIComponent(idOrSlug)}`;

  if (!clinic || !clinic.isActive) {
    return {
      title: "Klinik bulunamadı • Diş Fiyat Platform",
      description: "Aradığınız klinik bulunamadı.",
      alternates: { canonical: fallbackCanonical },
    };
  }

  const slug = clinicSlug(clinic.name, clinic.id);
  const canonical = `/klinikler/${slug}`;

  return {
    title: `${clinic.name} • Klinik Detayı`,
    description: `${clinic.name} iletişim ve hizmet bilgileri. Şehir ve hizmet kapsamlarını incele.`,
    alternates: { canonical },
  };
}

export default async function ClinicDetailPage({ params }: PageProps): Promise<JSX.Element> {
  const { id: idOrSlug } = await params;
  const id = extractId(idOrSlug);

  const clinic = await prisma.clinic.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      instagramUrl: true,
      isActive: true,
      updatedAt: true,
      coverages: {
        where: { isActive: true },
        select: { city: true, service: true },
        orderBy: [{ city: "asc" }, { service: "asc" }],
      },
    },
  });

  if (!clinic || !clinic.isActive) notFound();

  const slug = clinicSlug(clinic.name, clinic.id);
  const canonical = `/klinikler/${slug}`;

  const grouped = new Map<string, string[]>();
  for (const c of clinic.coverages) {
    const arr = grouped.get(c.city) ?? [];
    arr.push(c.service);
    grouped.set(c.city, arr);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Ana sayfa", item: "/" },
          { "@type": "ListItem", position: 2, name: "Klinikler", item: "/klinikler" },
          { "@type": "ListItem", position: 3, name: clinic.name, item: canonical },
        ],
      },
      {
        "@type": "MedicalOrganization",
        "@id": canonical,
        name: clinic.name,
        url: canonical,
        telephone: clinic.phone || undefined,
      },
    ],
  };

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: 16 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ opacity: 0.75, fontWeight: 900 }}>
            <Link href="/klinikler" style={{ textDecoration: "none", color: "#111" }}>
              Klinikler
            </Link>{" "}
            / Detay
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 950, margin: "8px 0 0 0" }}>{clinic.name}</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link
            href="/teklif-al"
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
            Teklif Al →
          </Link>

          <Link
            href="/klinikler"
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
            Listeye dön
          </Link>
        </div>
      </div>

      <section
        style={{
          marginTop: 14,
          border: "1px solid #eee",
          borderRadius: 20,
          padding: 16,
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.9, fontWeight: 750 }}>
            <div>
              <strong>Güncellendi:</strong> {new Date(clinic.updatedAt).toLocaleString("tr-TR")}
            </div>
            <div>
              <strong>Aktif:</strong> Evet
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>İletişim</div>

            {clinic.phone ? (
              <div style={{ fontWeight: 850, opacity: 0.9 }}>📞 {clinic.phone}</div>
            ) : (
              <div style={{ fontWeight: 800, opacity: 0.65 }}>📞 Telefon bilgisi yok</div>
            )}

            {clinic.instagramUrl ? (
              <a
                href={clinic.instagramUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  fontWeight: 900,
                  opacity: 0.95,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  width: "fit-content",
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,0.10)",
                  background: "rgba(255,255,255,0.80)",
                }}
              >
                📸 {cleanInstagramForLabel(clinic.instagramUrl)} →
              </a>
            ) : (
              <div style={{ fontWeight: 800, opacity: 0.65 }}>📸 Instagram bilgisi yok</div>
            )}

            <div style={{ fontWeight: 800, opacity: 0.65 }}>
              Not: İletişim için teklif formunu da kullanabilirsin. (KVKK onaylı)
            </div>

            <Link
              href="/teklif-al"
              style={{
                display: "inline-block",
                marginTop: 6,
                textDecoration: "none",
                fontWeight: 950,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                width: 220,
                textAlign: "center",
              }}
            >
              Teklif Al →
            </Link>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 10 }}>Hizmet Kapsamı</div>

        {clinic.coverages.length === 0 && (
          <div
            style={{
              border: "1px solid #f2d7d7",
              background: "#fff7f7",
              borderRadius: 16,
              padding: 12,
              fontWeight: 850,
              color: "#8a1c1c",
              lineHeight: 1.6,
            }}
          >
            Bu kliniğin aktif şehir/hizmet kapsamı bulunamadı.
          </div>
        )}

        {clinic.coverages.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {Array.from(grouped.entries()).map(([city, services]) => (
              <div
                key={city}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 18,
                  padding: 14,
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 950, marginBottom: 10 }}>{cityLabel(city)}</div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {services.map((s) => (
                    <Link
                      key={`${city}-${s}`}
                      href={`/sehir/${encodeURIComponent(city)}/${encodeURIComponent(s)}`}
                      style={{
                        textDecoration: "none",
                        border: "1px solid #eee",
                        borderRadius: 999,
                        padding: "8px 10px",
                        fontWeight: 850,
                        fontSize: 12,
                        background: "#fafafa",
                        color: "#111",
                      }}
                    >
                      {serviceLabel(s)} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 18, borderTop: "1px solid #eee", paddingTop: 14, opacity: 0.9 }}>
        <div style={{ fontWeight: 950 }}>Daha fazlası</div>
        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/klinikler" style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            Klinik listesi →
          </Link>
          <Link href="/sehir" style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            Şehirler →
          </Link>
          <Link href="/hizmetler" style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            Hizmetler →
          </Link>
          <Link href="/" style={{ fontWeight: 850, textDecoration: "none", color: "#111" }}>
            Ana sayfa →
          </Link>
        </div>
      </section>
    </main>
  );
}
