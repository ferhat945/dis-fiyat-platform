import type { MetadataRoute } from "next";
import { CITIES, SERVICES, normalizeSlug } from "@/lib/seo-data";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

function clinicPublicSlug(name: string, id: string): string {
  const base = normalizeSlug(name).slice(0, 70) || "klinik";
  return `${base}--${id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/kvkk`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },

    { url: `${base}/sehir`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/hizmetler`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },

    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },

    { url: `${base}/klinikler`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  // Şehir + hizmet sayfaları
  for (const c of CITIES) {
    urls.push({
      url: `${base}/sehir/${c}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const s of SERVICES) {
      urls.push({
        url: `${base}/sehir/${c}/${s}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  // Hizmet landing
  for (const s of SERVICES) {
    urls.push({
      url: `${base}/hizmet/${s}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Blog postları
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 50000,
  });

  for (const p of posts) {
    urls.push({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Klinik profilleri (sluglı)
  const clinics = await prisma.clinic.findMany({
    where: {
      isActive: true,
      coverages: { some: { isActive: true } },
    },
    select: { id: true, name: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50000,
  });

  for (const c of clinics) {
    const slug = clinicPublicSlug(c.name, c.id);
    urls.push({
      url: `${base}/klinikler/${encodeURIComponent(slug)}`,
      lastModified: c.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return urls;
}