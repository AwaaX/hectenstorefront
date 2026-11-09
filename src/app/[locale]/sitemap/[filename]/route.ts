/**
 * Per-Locale, Per-Type Sitemap Route
 * Generates sitemaps for specific content types (pages, products, categories)
 * with proper pagination support.
 *
 * Nested under the static "sitemap" segment so it doesn't compete with the
 * [...category] catch-all route for single-segment paths like /en-gb/baby
 * (Next.js would otherwise prefer this dynamic segment over the catch-all).
 *
 * Routes:
 * - /{locale}/sitemap/sitemap_pages_1.xml
 * - /{locale}/sitemap/sitemap_products_1.xml
 * - /{locale}/sitemap/sitemap_categories_1.xml
 */

import { NextRequest, NextResponse } from "next/server"
import { extractCountryCode } from "@lib/util/locale"
import { sitemapConfig, getBaseUrl } from "@lib/seo/sitemap-config"
import { pathnames } from "@i18n/routing"
import {
  fetchAllProductHandles,
  fetchAllCategories,
} from "@lib/seo/fetch-sitemap-data"
import { getStaticRoutes } from "@lib/seo/static-routes"
import { getLocalizedProductHandle } from "@lib/data/products"
import { resolveLocalizedHandle } from "@lib/util/localized-handle"
import {
  buildLocaleUrl,
  generateHreflangs,
  buildSitemapXml,
  SitemapUrlWithAlternates,
  paginateUrls,
  normalizeToHreflang,
  getSitemapPageCounts,
  SitemapType,
} from "@lib/seo/sitemap-utils"

// Generated at build time, then regenerated in the background at most once a day
export const dynamic = "force-static"
export const revalidate = 86400 // 24 hours

/**
 * Prerender every sitemap file listed in the sitemap index at build time
 */
export async function generateStaticParams(): Promise<
  Array<{ locale: string; filename: string }>
> {
  const pageCounts = await getSitemapPageCounts()
  const params: Array<{ locale: string; filename: string }> = []

  for (const locale of sitemapConfig.locales) {
    for (const [type, count] of Object.entries(pageCounts) as Array<
      [SitemapType, number]
    >) {
      for (let page = 1; page <= count; page++) {
        params.push({
          locale: locale.toLowerCase(),
          filename: `sitemap_${type}_${page}.xml`,
        })
      }
    }
  }

  return params
}

interface RouteParams {
  params: Promise<{
    locale: string
    filename: string
  }>
}

/**
 * Parse sitemap filename to extract type and page
 * Example: "sitemap_pages_1.xml" -> { type: "pages", page: 1 }
 */
function parseSitemapFilename(filename: string): { type: string; page: number } | null {
  const match = filename.match(/^sitemap_(pages|products|categories)_(\d+)\.xml$/)
  if (!match) return null
  return {
    type: match[1],
    page: parseInt(match[2], 10),
  }
}

/**
 * Get localized path for a given internal path and locale
 */
function getLocalizedPath(internalPath: string, locale: string): string {
  const pathConfig = pathnames[internalPath as keyof typeof pathnames]

  if (!pathConfig) {
    return internalPath
  }

  if (typeof pathConfig === "string") {
    return pathConfig
  }

  const localizedPath = pathConfig[locale as keyof typeof pathConfig]
  return localizedPath || internalPath
}

/**
 * Generate pages sitemap (static routes + home)
 */
async function generatePagesSitemap(
  locale: string,
  baseUrl: string,
  pageNumber: number
): Promise<string> {
  const urls: SitemapUrlWithAlternates[] = []
  const staticRoutes = getStaticRoutes()

  // 1. Static Routes
  for (const route of staticRoutes) {
    const localizedPath = getLocalizedPath(route.path, locale)
    const loc = buildLocaleUrl(baseUrl, locale, localizedPath)
    // const routeConfig = sitemapConfig.routes[route.path] || {
    //   priority: "0.7" as const,
    //   changefreq: "weekly" as const,
    // }
    // const alternates = generateHreflangs(baseUrl, route.path, pathnames)

    urls.push({
      loc,
      // priority: routeConfig.priority,
      // changefreq: routeConfig.changefreq,
      // alternates,
      // xDefault: alternates["x-default"],
    })

  }

  // 2. Home page
  if (!staticRoutes.some((r) => r.path === "/")) {
    const loc = buildLocaleUrl(baseUrl, locale, "/")
    const alternates = generateHreflangs(baseUrl, "/", pathnames)

    urls.push({
      loc,
      // priority: "1.0",
      // changefreq: "daily",
      // alternates,
      // xDefault: alternates["x-default"],
    })
  }

  // Paginate and get the requested page
  const pages = paginateUrls(urls, sitemapConfig.maxUrlsPerSitemap)
  const requestedPage = pages[pageNumber - 1] || []

  return buildSitemapXml(requestedPage)
}

/**
 * Generate products sitemap
 */
async function generateProductsSitemap(
  locale: string,
  baseUrl: string,
  pageNumber: number
): Promise<string> {
  const urls: SitemapUrlWithAlternates[] = []
  const productHandles = await fetchAllProductHandles()
  const sourceCountryCode = extractCountryCode(locale)
  const productsLocalizedPath = getLocalizedPath("/products/[handle]", locale)
  const productsBasePath = productsLocalizedPath.replace("[handle]", "")

  for (const handle of productHandles) {
    const localizedHandle = await getLocalizedProductHandle({
      currentHandle: handle,
      sourceCountryCode: sourceCountryCode,
      targetCountryCode: sourceCountryCode,
      locale,
    })

    const path = `${productsBasePath}${localizedHandle || handle}`
    const loc = buildLocaleUrl(baseUrl, locale, path)

    // Build hreflang alternates
    // const productAlternates: Record<string, string> = {}
    // for (const altLocale of sitemapConfig.locales) {
    //   const altCountryCode = extractCountryCode(altLocale)
    //   const altProductSegment = getLocalizedPath(
    //     "/products/[handle]",
    //     altLocale
    //   ).replace("[handle]", "")
    //   const altLocalizedHandle = await getLocalizedProductHandle({
    //     currentHandle: handle,
    //     sourceCountryCode: sourceCountryCode,
    //     targetCountryCode: altCountryCode,
    //     locale: altLocale,
    //   })
    //   const hrefLangLocale = normalizeToHreflang(altLocale)
    //   const altPath = `${altProductSegment}${altLocalizedHandle || handle}`
    //   productAlternates[hrefLangLocale] = buildLocaleUrl(
    //     baseUrl,
    //     altLocale,
    //     altPath
    //   )
    // }

    // // Add x-default
    // const defaultCountryCode = extractCountryCode(sitemapConfig.defaultLocale)
    // const defaultProductSegment = getLocalizedPath(
    //   "/products/[handle]",
    //   sitemapConfig.defaultLocale
    // ).replace("[handle]", "")
    // const defaultLocalizedHandle = await getLocalizedProductHandle({
    //   currentHandle: handle,
    //   sourceCountryCode: sourceCountryCode,
    //   targetCountryCode: defaultCountryCode,
    //   locale: sitemapConfig.defaultLocale,
    // })
    // const defaultPath = `${defaultProductSegment}${
    //   defaultLocalizedHandle || handle
    // }`
    // productAlternates["x-default"] = buildLocaleUrl(
    //   baseUrl,
    //   sitemapConfig.defaultLocale,
    //   defaultPath
    // )

    urls.push({
      loc,
      // priority: "0.8",
      // changefreq: "weekly",
      // alternates: productAlternates,
      // xDefault: productAlternates["x-default"],
    })

  }

  // Paginate and get the requested page
  const pages = paginateUrls(urls, sitemapConfig.maxUrlsPerSitemap)
  const requestedPage = pages[pageNumber - 1] || []

  return buildSitemapXml(requestedPage)
}

/**
 * Generate categories sitemap
 */
async function generateCategoriesSitemap(
  locale: string,
  baseUrl: string,
  pageNumber: number
): Promise<string> {
  const urls: SitemapUrlWithAlternates[] = []
  const categories = await fetchAllCategories()

  // Same URL shape as the category page canonical: /{locale}/{seg}/{seg}…,
  // each segment translated on its own (see generateCategoryMetadata)
  for (const category of categories) {
    const localizedSegments = category.segments.map((segment) =>
      resolveLocalizedHandle({
        handle: segment.handle,
        customTranslation: segment.custom_translation,
        locale,
      })
    )

    if (localizedSegments.some((s) => !s)) continue

    urls.push({
      loc: buildLocaleUrl(baseUrl, locale, `/${localizedSegments.join("/")}`),
    })
  }

  // Paginate and get the requested page
  const pages = paginateUrls(urls, sitemapConfig.maxUrlsPerSitemap)
  const requestedPage = pages[pageNumber - 1] || []

  return buildSitemapXml(requestedPage)
}

/**
 * GET handler for per-locale, per-type sitemap
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { locale, filename } = await params

  try {
    const baseUrl = getBaseUrl()

    // Validate locale against storefront locales
    const localeLower = locale.toLowerCase()
    if (!sitemapConfig.locales.some((l) => l.toLowerCase() === localeLower)) {
      throw new Error(`Invalid locale: ${locale}`)
    }

    // Parse filename to extract type and page
    const parsed = parseSitemapFilename(filename)
    if (!parsed) {
      throw new Error(`Invalid sitemap filename: ${filename}`)
    }

    const { type, page } = parsed

    let xml: string

    switch (type) {
      case "pages":
        xml = await generatePagesSitemap(localeLower, baseUrl, page)
        break
      case "products":
        xml = await generateProductsSitemap(localeLower, baseUrl, page)
        break
      case "categories":
        xml = await generateCategoriesSitemap(localeLower, baseUrl, page)
        break
      default:
        throw new Error(`Invalid sitemap type: ${type}`)
    }

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error generating sitemap:", {
      locale,
      filename,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })

    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`

    return new NextResponse(errorXml, {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    })
  }
}
