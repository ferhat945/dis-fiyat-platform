import type { MetadataRoute } from "next";
import { CITIES, SERVICES } from "@/lib/seo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/kvkk`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

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

  for (const s of SERVICES) {
    urls.push({
      url: `${base}/hizmet/${s}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return urls;
}
