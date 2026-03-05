// src/lib/site-url.ts
function stripTrailingSlashes(u: string): string {
  return (u || "").replace(/\/+$/, "");
}

/**
 * Base URL tek kaynaktan gelsin:
 * - SITE_URL (server)
 * - NEXT_PUBLIC_SITE_URL (client)
 * - APP_URL / APP_BASE_URL (legacy)
 * - fallback localhost
 *
 * Örnek:
 *  SITE_URL=https://disfiyat360.com
 */
export function getBaseUrl(): string {
  const base =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000";

  return stripTrailingSlashes(base);
}

/**
 * Path'i absolute URL yapar: absUrl("/blog") -> https://disfiyat360.com/blog
 */
export function absUrl(path: string): string {
  const base = getBaseUrl();
  const p = (path || "").startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}