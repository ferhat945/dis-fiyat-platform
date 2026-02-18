import type { MetadataRoute } from "next";
import { CITIES, SERVICES } from "@/lib/seo-data";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/kvkk`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },

    // index sayfaları
    { url: `${base}/sehir`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/hizmetler`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },

    // ✅ blog index
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },

    // klinik dizini
    { url: `${base}/klinikler`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  // şehir + şehir/hizmet
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

  // hizmet sayfaları
  for (const s of SERVICES) {
    urls.push({
      url: `${base}/hizmet/${s}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // blog yazıları (yayındaki)
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true, publishedAt: true },
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


  // klinik detayları (aktif + coverage'ı olan)
  const clinics = await prisma.clinic.findMany({
    where: {
      isActive: true,
      coverages: { some: { isActive: true } },
    },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50000,
  });

  for (const c of clinics) {
    urls.push({
      url: `${base}/klinikler/${c.id}`,
      lastModified: c.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  return urls;
}
