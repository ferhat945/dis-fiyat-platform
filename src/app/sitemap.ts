import type { MetadataRoute } from "next";

import {
  CITIES,
  SERVICES,
  normalizeSlug,
} from "@/lib/seo-data";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/site-url";

/*
 * Sitemap'in her istekte yeniden DB'ye gitmesine gerek yok.
 * 6 saatte bir yenilenmesi şehir/hizmet SEO yapımızla uyumlu.
 */
export const revalidate = 21600;

/*
 * Statik çekirdek sayfaların gerçekten güncellendiğini
 * bildiğimiz sabit tarih.
 *
 * Her istekte new Date() kullanmıyoruz.
 */
const CORE_PAGES_UPDATED =
  new Date("2026-08-01T00:00:00.000Z");

function clinicPublicSlug(
  name: string,
  id: string
): string {
  const base =
    normalizeSlug(name).slice(0, 70) ||
    "klinik";

  return `${base}--${id}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const urls: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified:
        CORE_PAGES_UPDATED,
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${base}/kvkk`,
      lastModified:
        CORE_PAGES_UPDATED,
      changeFrequency: "monthly",
      priority: 0.3,
    },

    {
      url: `${base}/sehir`,
      lastModified:
        CORE_PAGES_UPDATED,
      changeFrequency: "weekly",
      priority: 0.6,
    },

    {
      url: `${base}/hizmetler`,
      lastModified:
        CORE_PAGES_UPDATED,
      changeFrequency: "weekly",
      priority: 0.6,
    },

    {
      url: `${base}/blog`,
      changeFrequency: "daily",
      priority: 0.7,
    },

    {
      url: `${base}/klinikler`,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  /*
   * Şehir ve şehir + hizmet sayfaları.
   *
   * Bu içeriklerin gerçek güncelleme tarihini merkezi
   * olarak takip etmiyoruz.
   *
   * Bu nedenle lastModified göndermiyoruz.
   * Yanlış tarih vermekten daha doğrudur.
   */
  for (const city of CITIES) {
    urls.push({
      url: `${base}/sehir/${city}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const service of SERVICES) {
      urls.push({
        url:
          `${base}/sehir/${city}/${service}`,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  /*
   * Tekil hizmet landing sayfaları.
   *
   * Canonical hizmet detay rotamız:
   *
   * /hizmet/[service]
   *
   * /hizmetler/[service] sitemap'e eklenmez.
   */
  for (const service of SERVICES) {
    urls.push({
      url: `${base}/hizmet/${service}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  /*
   * Blog içeriklerinde gerçek updatedAt mevcut.
   * Bu nedenle lastModified güvenilir biçimde gönderilebilir.
   */
  const posts =
    await prisma.blogPost.findMany({
      where: {
        isPublished: true,
      },

      select: {
        slug: true,
        updatedAt: true,
      },

      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],

      take: 50000,
    });

  for (const post of posts) {
    urls.push({
      url:
        `${base}/blog/${post.slug}`,

      lastModified:
        post.updatedAt,

      changeFrequency:
        "weekly",

      priority:
        0.6,
    });
  }

  /*
   * Klinik profillerinde de gerçek updatedAt mevcut.
   */
  const clinics =
    await prisma.clinic.findMany({
      where: {
        isActive: true,

        coverages: {
          some: {
            isActive: true,
          },
        },
      },

      select: {
        id: true,
        name: true,
        updatedAt: true,
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: 50000,
    });

  for (const clinic of clinics) {
    const slug =
      clinicPublicSlug(
        clinic.name,
        clinic.id
      );

    urls.push({
      url:
        `${base}/klinikler/${encodeURIComponent(
          slug
        )}`,

      lastModified:
        clinic.updatedAt,

      changeFrequency:
        "weekly",

      priority:
        0.5,
    });
  }

  return urls;
}