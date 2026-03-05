import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const BASE = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/panel/", "/admin/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}