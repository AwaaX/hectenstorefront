/**
 * Root Sitemap Index
 * Generates the main sitemap index that lists all per-locale, per-type sitemaps.
 * Serves: /sitemap_index.xml
 * Structure: /[locale]/sitemap/sitemap_[type]_[page].xml
 */

import { sitemapConfig, getBaseUrl } from "@lib/seo/sitemap-config"
import {
  buildSitemapIndexXml,
  getSitemapPageCounts,
} from "@lib/seo/sitemap-utils"

// Generated at build time, then regenerated in the background at most once a day
export const dynamic = "force-static"
export const revalidate = 86400 // 24 hours

export async function GET() {
  try {
    const baseUrl = getBaseUrl()

    const pageCounts = await getSitemapPageCounts()

    // Build sitemap references for all locales and types
    const sitemaps: Array<{ loc: string; lastmod?: string }> = []

    for (const locale of sitemapConfig.locales) {
      // Pages sitemaps
      for (let page = 1; page <= pageCounts.pages; page++) {
        sitemaps.push({
          loc: `${baseUrl}/${locale}/sitemap/sitemap_pages_${page}.xml`,
          lastmod: new Date().toISOString().split("T")[0],
        })
      }

      // Products sitemaps
      for (let page = 1; page <= pageCounts.products; page++) {
        sitemaps.push({
          loc: `${baseUrl}/${locale}/sitemap/sitemap_products_${page}.xml`,
          lastmod: new Date().toISOString().split("T")[0],
        })
      }

      // Categories sitemaps
      for (let page = 1; page <= pageCounts.categories; page++) {
        sitemaps.push({
          loc: `${baseUrl}/${locale}/sitemap/sitemap_categories_${page}.xml`,
          lastmod: new Date().toISOString().split("T")[0],
        })
      }
    }

    const xml = buildSitemapIndexXml(sitemaps)

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("Error generating sitemap index:", error)

    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</sitemapindex>`

    return new Response(errorXml, {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    })
  }
}
