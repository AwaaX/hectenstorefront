/**
 * Sitemap Utilities
 * Helper functions for generating sitemap XML with proper hreflang alternates.
 */

import { sitemapConfig, getBaseUrl, type Priority, type ChangeFreq } from "./sitemap-config"
import { fetchAllProductHandles, fetchAllCategories } from "./fetch-sitemap-data"
import { getStaticRoutes } from "./static-routes"

export interface SitemapUrl {
  loc: string
  priority?: Priority
  changefreq?: ChangeFreq
  lastmod?: string
}

export interface SitemapUrlWithAlternates extends SitemapUrl {
  alternates?: Record<string, string>
  xDefault?: string
}

/**
 * Build full URL for a given locale and path
 */
export function buildLocaleUrl(baseUrl: string, locale: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}/${locale}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1")
}

/**
 * Normalize locale to hreflang format (en-GB instead of en-gb)
 */
export function normalizeToHreflang(locale: string): string {
  const [language, country] = locale.toLowerCase().split("-")
  if (!country) return language
  return `${language}-${country.toUpperCase()}`
}

/**
 * Build hreflangs for dynamic routes (products, categories)
 * where the handle is not in the routing config (not localized)
 * Uses the localized base path but same handle for all locales
 */
export function generateDynamicHreflangs(
  baseUrl: string,
  basePath: string,
  handle: string
): Record<string, string> {
  const alternates: Record<string, string> = {}

  for (const locale of sitemapConfig.locales) {
    const hrefLangLocale = normalizeToHreflang(locale)
    const url = buildLocaleUrl(baseUrl, locale, `${basePath}${handle}`)
    alternates[hrefLangLocale] = url
  }

  // Add x-default pointing to default locale
  alternates["x-default"] = buildLocaleUrl(baseUrl, sitemapConfig.defaultLocale, `${basePath}${handle}`)

  return alternates
}

/**
 * Generate hreflang alternates for a URL across all locales
 * Includes x-default pointing to the default locale
 * Returns hreflang format (en-GB not en-gb)
 *
 * @param baseUrl - The base URL
 * @param path - The internal path (e.g., "/privacy-policy")
 * @param pathnamesConfig - Optional pathnames config for localized paths
 */
export function generateHreflangs(
  baseUrl: string,
  path: string,
  pathnamesConfig?: Record<string, string | Record<string, string>>
): Record<string, string> {
  const alternates: Record<string, string> = {}

  for (const locale of sitemapConfig.locales) {
    const hrefLangLocale = normalizeToHreflang(locale)

    // Get localized path if pathnames config is provided
    let localizedPath = path
    if (pathnamesConfig) {
      const pathConfig = pathnamesConfig[path]
      if (pathConfig) {
        if (typeof pathConfig === "string") {
          localizedPath = pathConfig
        } else {
          localizedPath = pathConfig[locale] || path
        }
      }
    }

    alternates[hrefLangLocale] = buildLocaleUrl(baseUrl, locale, localizedPath)
  }

  // Add x-default pointing to default locale
  let defaultLocalizedPath = path
  if (pathnamesConfig) {
    const pathConfig = pathnamesConfig[path]
    if (pathConfig) {
      if (typeof pathConfig === "string") {
        defaultLocalizedPath = pathConfig
      } else {
        defaultLocalizedPath = pathConfig[sitemapConfig.defaultLocale] || path
      }
    }
  }
  alternates["x-default"] = buildLocaleUrl(baseUrl, sitemapConfig.defaultLocale, defaultLocalizedPath)

  return alternates
}

/**
 * Format a single URL entry with hreflang alternates for XML
 */
export function formatSitemapUrl(url: SitemapUrlWithAlternates): string {
  const { loc, priority, changefreq, lastmod, alternates, xDefault } = url

  let xml = `  <url>
    <loc>${escapeXml(loc)}</loc>`

  if (lastmod) {
    xml += `\n    <lastmod>${escapeXml(lastmod)}</lastmod>`
  }

  if (changefreq) {
    xml += `\n    <changefreq>${escapeXml(changefreq)}</changefreq>`
  }

  if (priority) {
    xml += `\n    <priority>${escapeXml(priority)}</priority>`
  }

  // Add hreflang alternates
  if (alternates && Object.keys(alternates).length > 0) {
    xml += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefault || alternates["x-default"])}" />`

    for (const [hrefLang, url] of Object.entries(alternates)) {
      if (hrefLang !== "x-default") {
        xml += `\n    <xhtml:link rel="alternate" hreflang="${escapeXml(hrefLang)}" href="${escapeXml(url)}" />`
      }
    }
  }

  xml += `\n  </url>`

  return xml
}

/**
 * Escape XML special characters
 */
export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Build complete sitemap XML with proper namespace declarations
 */
export function buildSitemapXml(urls: SitemapUrlWithAlternates[]): string {
  const urlEntries = urls.map(formatSitemapUrl).join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

/**
 * Build sitemap index XML (for multiple sitemap files per locale)
 */
export function buildSitemapIndexXml(
  sitemaps: Array<{ loc: string; lastmod?: string }>
): string {
  const sitemapEntries = sitemaps
    .map((sitemap) => {
      let entry = `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>`

      if (sitemap.lastmod) {
        entry += `\n    <lastmod>${escapeXml(sitemap.lastmod)}</lastmod>`
      }

      entry += `\n  </sitemap>`

      return entry
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`
}

/**
 * Paginate URLs into chunks for multiple sitemap files
 * Google recommends max 50,000 URLs per sitemap file
 */
export function paginateUrls(
  urls: SitemapUrlWithAlternates[],
  maxPerFile: number = 40000
): SitemapUrlWithAlternates[][] {
  const pages: SitemapUrlWithAlternates[][] = []

  for (let i = 0; i < urls.length; i += maxPerFile) {
    pages.push(urls.slice(i, i + maxPerFile))
  }

  return pages.length > 0 ? pages : [[]]
}

export type SitemapType = "pages" | "products" | "categories"

/**
 * Calculate how many sitemap files are needed for each type
 * Shared by the sitemap index and generateStaticParams so both agree
 */
export async function getSitemapPageCounts(): Promise<Record<SitemapType, number>> {
  const [productHandles, categories] = await Promise.all([
    fetchAllProductHandles(),
    fetchAllCategories(),
  ])
  const staticRoutesCount = getStaticRoutes().length + 1 // +1 for home page
  const maxUrlsPerSitemap = sitemapConfig.maxUrlsPerSitemap

  return {
    pages: Math.max(1, Math.ceil(staticRoutesCount / maxUrlsPerSitemap)),
    products: Math.ceil(productHandles.length / maxUrlsPerSitemap),
    categories: Math.ceil(categories.length / maxUrlsPerSitemap),
  }
}
