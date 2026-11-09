/**
 * MIDDLEWARE: Locale & Region Detection System
 *
 * OVERVIEW:
 * This middleware handles automatic locale and region detection for the storefront.
 * It ensures users are served content in the correct locale based on their location
 * and preferences, with automatic redirects when necessary.
 *
 * FLOW:
 * 1. Skip static assets (images, styles, etc.) - no processing needed
 * 2. Retrieve region map from Medusa backend and generate/retrieve cache ID
 * 3. Detect country code using three-tier fallback strategy:
 *    - First: Extract from URL locale segment if present and valid
 *    - Second: Use IP geolocation if available
 *    - Third: Fall back to default region, then first available region
 * 4. Resolve appropriate locale from detected region
 * 5. If URL locale matches resolved locale → continue, else redirect
 * 6. Set locale cookie and cache ID cookie for client-side usage; when the
 *    locale changes, move the existing cart to the new region and locale
 *
 * DETECTION STRATEGY:
 * The middleware prioritizes explicit URL locale > geolocation > default region.
 * This ensures explicit locale choices override automatic detection, while still
 * providing smart defaults for first-time visitors.
 */

import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import { defaultLocale, pathnames } from "./i18n/routing"
import { sdk } from "@lib/config"
import { getOrBuildRegionMap } from "@lib/data/regions"
import {
  extractCountryCode,
  getLocaleFromRegion,
  getStorefrontCountryCode,
  hasStorefrontLocale,
} from "@lib/util/locale"
import {
  resolveLegacyMediaRedirect,
  resolveLegacyRedirect,
} from "@lib/util/legacy-redirects"
import { GEO_SUGGESTION_COOKIE, GeoSuggestion } from "@lib/util/geo-suggestion"
import { handleMaintenance } from "@lib/util/maintenance-gate"

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"
const LOCALE_COOKIE_NAME = "_medusa_locale"
const CACHE_ID_COOKIE = "_medusa_cache_id"
const CART_ID_COOKIE = "_medusa_cart_id"
const AUTH_TOKEN_COOKIE = "_medusa_jwt"

// ============================================================================
// LOCALE RESOLUTION HELPERS
// ============================================================================


/**
 * Applies no-index header to prevent search engine indexing in pre-production.
 * Only active when ROBOTS_NOINDEX=true (set it on staging, leave unset on production).
 */
const applyRobotsHeader = (response: NextResponse): NextResponse => {
  if (process.env.ROBOTS_NOINDEX === "true") {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return response
}

/**
 * Moves the visitor's cart to the given region and locale, mirroring what the
 * country selector does via `updateRegion`. The cart id and auth token are read
 * straight from the request because `next/headers` cookies (and therefore the
 * `@lib/data/cart` server actions) aren't available in middleware.
 * Failures are logged and swallowed so a stale or completed cart never blocks
 * the page from rendering.
 */
async function syncCartRegionAndLocale(
  request: NextRequest,
  region: HttpTypes.StoreRegion | undefined,
  locale: string
): Promise<void> {
  const cartId = request.cookies.get(CART_ID_COOKIE)?.value
  if (!cartId || !region?.id) {
    return
  }

  const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value

  try {
    await sdk.store.cart.update(
      cartId,
      { region_id: region.id, locale },
      {},
      {
        "x-medusa-locale": locale,
        ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
      }
    )
    geoLog("info",
      `CART SYNCED`,
      `cart: ${cartId}`,
      `region: ${region.id}`,
      `locale: ${locale}`
    )
  } catch (error) {
    geoLog("warn",
      `CART SYNC FAILED`,
      `cart: ${cartId}`,
      `error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Updates the response with locale cookie if it differs from current value,
 * and moves the cart to the new region/locale when that happens.
 * Cookie is set with 1-year expiry, secure flag for production, and strict SameSite.
 */
const applyLocaleCookie = async (
  request: NextRequest,
  response: NextResponse,
  region: HttpTypes.StoreRegion | undefined,
  countryCode?: string
): Promise<NextResponse> => {
  const resolvedLocale = getLocaleFromRegion(region, countryCode)
  const currentLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value

  if (resolvedLocale && resolvedLocale !== currentLocale) {
    response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })

    await syncCartRegionAndLocale(request, region, resolvedLocale)
  }

  return response
}

/**
 * Sets the geo-suggestion cookie carrying the detected country/locale mismatch
 * so the client can render the "switch country" prompt. Readable by JS (not
 * httpOnly) since the popup is rendered by a client component.
 */
const applyGeoSuggestionCookie = (
  response: NextResponse,
  suggestion: GeoSuggestion | null
): NextResponse => {
  if (!suggestion) {
    return response
  }

  response.cookies.set(
    GEO_SUGGESTION_COOKIE,
    JSON.stringify(suggestion),
    {
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    }
  )

  return response
}

// ============================================================================
// DATA FETCHING HELPERS
// ============================================================================

/**
 * Retrieves the region map from Medusa backend, building it if necessary.
 * Throws if regions cannot be retrieved.
 */
async function getRegionMap(): Promise<Map<string, HttpTypes.StoreRegion>> {
  try {
    return await getOrBuildRegionMap()
  } catch (error) {
    console.error("Failed to get region map:", error)
    throw new Error(
      "Unable to retrieve regions. Please ensure regions are configured in your Medusa Admin."
    )
  }
}

/**
 * Extracts country code from a locale string (e.g., "en-us" → "us").
 */
async function getCountryCodeFromLocale(locale: string): Promise<string> {
  return extractCountryCode(locale)
}

// ============================================================================
// PATHNAME REWRITING (Localized → Internal routes)
// ============================================================================

/**
 * Rewrites localized pathnames to their internal equivalents.
 * Converts external localized URLs to internal paths that the app router recognizes.
 *
 * Example: /es-es/productos/[handle] → /es-es/products/[handle]
 */
function rewriteLocalizedPathname(
  pathname: string,
  locale: string
): string {
  // Remove locale prefix to get the path part
  const pathParts = pathname.split("/").filter(Boolean)
  if (pathParts[0]?.toLowerCase() === locale.toLowerCase()) {
    pathParts.shift()
  }

  const path = `/${pathParts.join("/")}`

  // Search through pathnames config to find matching localized path
  for (const [internalPath, externalPathsConfig] of Object.entries(pathnames)) {
    if (typeof externalPathsConfig === "string") {
      // Simple string pathname - no localization
      if (path === externalPathsConfig) {
        return `/${locale}${internalPath}`
      }
    } else if (typeof externalPathsConfig === "object") {
      // Localized pathname object
      const localizedPath = externalPathsConfig[locale as keyof typeof externalPathsConfig]
      if (localizedPath && matchesPathPattern(path, localizedPath)) {
        // Substitute real dynamic segment values into the internal pattern
        // e.g. internal "/products/[category]" + actual
        // "/pijamas-de-navidad/parejas" → "/products/parejas"
        const resolvedInternalPath = resolveDynamicSegments(
          internalPath,
          localizedPath,
          path
        )
        return `/${locale}${resolvedInternalPath}`
      }
    }
  }

  // No rewrite needed, return original pathname
  return pathname
}

/**
 * Returns the localized URL for a request that uses an internal pathname in a
 * locale where that route is translated, or null if no redirect is needed.
 *
 * Example: /sv-se/account → /sv-se/konto
 *
 * Without this the internal URL still renders, but next-intl's usePathname()
 * can't map it back to its route and falls back to "/[...category]", which
 * breaks anything that rebuilds the current URL (e.g. the country switcher).
 */
function getLocalizedRedirectPathname(
  pathname: string,
  locale: string
): string | null {
  const pathParts = pathname.split("/").filter(Boolean)
  if (pathParts[0]?.toLowerCase() === locale.toLowerCase()) {
    pathParts.shift()
  }

  const path = `/${pathParts.join("/")}`

  const localizedEntries: [string, string][] = []
  for (const [internalPath, externalPathsConfig] of Object.entries(pathnames)) {
    if (typeof externalPathsConfig !== "object") continue
    const localizedPath = externalPathsConfig[locale as keyof typeof externalPathsConfig]
    if (localizedPath) localizedEntries.push([internalPath, localizedPath])
  }

  // Already a localized path. Catch-alls are skipped as they match any segment.
  const isLocalizedPath = localizedEntries.some(
    ([, localizedPath]) =>
      !localizedPath.includes("[...") && matchesPathPattern(path, localizedPath)
  )
  if (isLocalizedPath) {
    return null
  }

  for (const [internalPath, localizedPath] of localizedEntries) {
    if (localizedPath !== internalPath && matchesPathPattern(path, internalPath)) {
      // Fill the localized pattern's dynamic segments from the internal path
      return `/${locale}${resolveDynamicSegments(localizedPath, internalPath, path)}`
    }
  }

  return null
}

/**
 * Rebuilds an internal path pattern using the concrete dynamic segment values
 * taken from the actual (localized) request path.
 *
 * next-intl keeps identical placeholder tokens on both sides of a localized
 * pathname, so each `[token]` in the internal pattern is filled from the
 * segment at the same position in the localized pattern.
 *
 * Example:
 *   internalPath  = "/products/[category]"
 *   localizedPath = "/pijamas-de-navidad/[category]"
 *   actualPath    = "/pijamas-de-navidad/parejas"
 *   → "/products/parejas"
 */
function resolveDynamicSegments(
  internalPath: string,
  localizedPath: string,
  actualPath: string
): string {
  const internalParts = internalPath.split("/").filter(Boolean)
  const localizedParts = localizedPath.split("/").filter(Boolean)
  const actualParts = actualPath.split("/").filter(Boolean)

  const resolved = internalParts.map((part) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      const idx = localizedParts.indexOf(part)
      if (idx !== -1 && actualParts[idx] !== undefined) {
        return actualParts[idx]
      }
    }
    return part
  })

  return `/${resolved.join("/")}`
}

/**
 * Checks if a path matches a pattern, accounting for dynamic segments.
 * Example: /productos/handle-123 matches /productos/[handle]
 */
function matchesPathPattern(actualPath: string, pattern: string): boolean {
  const actualParts = actualPath.split("/").filter(Boolean)
  const patternParts = pattern.split("/").filter(Boolean)

  if (actualParts.length !== patternParts.length) {
    return false
  }

  return patternParts.every((patternPart, index) => {
    if (patternPart.startsWith("[") && patternPart.endsWith("]")) {
      // Dynamic segment matches any value
      return true
    }
    return patternPart === actualParts[index]
  })
}

// ============================================================================
// LOGGING HELPERS
// ============================================================================

const LOG_PREFIX = "[GEOLOCATION]"

function geoLog(level: "info" | "warn" | "error", ...parts: string[]) {
  const timestamp = new Date().toISOString()
  const msg = `${LOG_PREFIX} ${timestamp} | ${parts.join(" | ")}`
  if (level === "error") console.error(msg)
  else if (level === "warn") console.warn(msg)
  else console.info(msg)
}

// ============================================================================
// COUNTRY CODE DETECTION (Three-tier fallback strategy)
// ============================================================================

/**
 * Performs IP geolocation for the request and returns the detected country
 * code (lowercase), or undefined if it can't be determined.
 *
 * Calls the ipinfo.io API directly rather than routing through our own
 * /api/geo endpoint, because middleware runs in the Edge Runtime and
 * cannot reliably fetch its own origin (self-referential fetch deadlock).
 */
async function detectGeoCountryCode(
  request: NextRequest
): Promise<string | undefined> {
  const ipinfoToken = process.env.IPINFO_TOKEN
  if (!ipinfoToken) {
    return undefined
  }

  const xRealIp = request.headers.get("x-real-ip")
  const xForwardedFor = request.headers.get("x-forwarded-for")
  const clientIp = xRealIp || xForwardedFor?.split(",")[0].trim() || "127.0.0.1"

  geoLog("info",
    `IP RESOLVE`,
    `client-ip: ${clientIp}`,
    `x-real-ip: ${xRealIp ?? "(none)"}`,
    `x-forwarded-for: ${xForwardedFor ?? "(none)"}`
  )

  try {
    const response = await fetch(
      `https://ipinfo.io/${clientIp}?token=${ipinfoToken}`,
      { headers: { Accept: "application/json" } }
    )
    if (response.ok) {
      const data = await response.json()
      geoLog("info",
        `IPINFO RESPONSE`,
        `ip: ${data.ip ?? clientIp}`,
        `country: ${data.country ?? "(none)"}`,
        `region: ${data.region ?? "(none)"}`,
        `city: ${data.city ?? "(none)"}`
      )
      if (data.country) {
        const geoCountryCode = data.country.toLowerCase()
        return geoCountryCode
      }
    } else {
      geoLog("warn",
        `IPINFO FAILED`,
        `status: ${response.status}`,
        `ip: ${clientIp}`
      )
    }
  } catch (error) {
    geoLog("error",
      `IPINFO ERROR`,
      `ip: ${clientIp}`,
      `error: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  return undefined
}

/**
 * Detects country code using three fallback tiers:
 * 1. URL locale segment (explicit user choice)
 * 2. IP geolocation (smart detection for new visitors)
 * 3. Default region (configured fallback)
 *
 * Returns: country code string or undefined if no valid region found
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>
): Promise<string | undefined> {
  const pathname = request.nextUrl.pathname
  const urlSegment = pathname.split("/")[1]?.toLowerCase()

  geoLog("info",
    `DETECTION START`,
    `path: ${pathname}`,
    `url-segment: ${urlSegment ?? "(none)"}`
  )

  // TIER 1: Check if URL already contains a valid locale
  if (urlSegment) {
    const countryCode = await getCountryCodeFromLocale(urlSegment)
    if (
      countryCode &&
      regionMap.has(countryCode) &&
      hasStorefrontLocale(regionMap.get(countryCode), countryCode)
    ) {
      geoLog("info",
        `TIER 1 HIT — URL locale`,
        `segment: ${urlSegment}`,
        `country: ${countryCode}`
      )
      return countryCode
    }
  }

  // TIER 2: Attempt geolocation-based country detection
  geoLog("info", `TIER 1 MISS — no valid locale in URL, trying geolocation…`)

  const geoCountryCode = await detectGeoCountryCode(request)
  // Shipping-only countries are served by their region's storefront country
  const storefrontCountryCode = geoCountryCode
    ? getStorefrontCountryCode(regionMap.get(geoCountryCode), geoCountryCode)
    : undefined
  if (geoCountryCode && regionMap.has(geoCountryCode) && storefrontCountryCode) {
    geoLog("info",
      `TIER 2 HIT — geolocation`,
      `country: ${geoCountryCode}`,
      `storefront-country: ${storefrontCountryCode}`
    )
    return storefrontCountryCode
  }

  // TIER 3: Fall back to configured default region
  geoLog("info",
    `TIER 2 MISS — geo: ${geoCountryCode ?? "(none)"}`,
    `in-region-map: ${geoCountryCode ? regionMap.has(geoCountryCode) : false}`,
    `falling back to default: ${DEFAULT_REGION}`
  )
  if (regionMap.has(DEFAULT_REGION)) {
    geoLog("info", `TIER 3 HIT — default region`, `country: ${DEFAULT_REGION}`)
    return DEFAULT_REGION
  }

  // TIER 4: Final fallback to first available region
  const firstRegion = regionMap.keys().next().value
  geoLog("warn",
    `TIER 4 FALLBACK — first available region`,
    `country: ${firstRegion ?? "(none)"}`
  )
  return firstRegion
}

// ============================================================================
// GEO SUGGESTION (propose switching to the visitor's detected country)
// ============================================================================

/**
 * On a visitor's first request, checks whether their geolocated country
 * differs from the country of the (already valid) locale in the URL. If so,
 * returns a suggestion to switch them to their country's homepage.
 *
 * Only runs on first visit (no locale cookie yet) so it doesn't add an
 * extra geolocation lookup to every request.
 */
async function getGeoSuggestion(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>,
  currentCountryCode: string,
  currentLocale: string
): Promise<GeoSuggestion | null> {
  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE_NAME)
  const hasGeoSuggestionCookie = request.cookies.has(GEO_SUGGESTION_COOKIE)

  if (hasLocaleCookie || hasGeoSuggestionCookie) {
    return null
  }

  const geoCountryCode = await detectGeoCountryCode(request)

  if (
    !geoCountryCode ||
    geoCountryCode === currentCountryCode ||
    !regionMap.has(geoCountryCode)
  ) {
    return null
  }

  const geoRegion = regionMap.get(geoCountryCode)
  // Shipping-only countries are served by their region's storefront country
  const storefrontCountryCode = getStorefrontCountryCode(geoRegion, geoCountryCode)

  if (!storefrontCountryCode || storefrontCountryCode === currentCountryCode) {
    return null
  }

  const geoLocale = getLocaleFromRegion(geoRegion, storefrontCountryCode)

  if (!geoLocale || geoLocale.toLowerCase() === currentLocale.toLowerCase()) {
    return null
  }

  const pathSegments = request.nextUrl.pathname.split("/").filter(Boolean)
  // Drop the current locale prefix (first segment) to get the rest of the path
  pathSegments.shift()
  const remainingPath = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : ""
  const search = request.nextUrl.search || ""

  return {
    locale: geoLocale,
    country: storefrontCountryCode.toUpperCase(),
    path: `/${geoLocale}${remainingPath}${search}`,
  }
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

/**
 * Main middleware handler that orchestrates locale detection and URL redirects.
 * Skips static assets and applies locale-based routing to all dynamic paths.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Legacy WordPress media (/wp-content/uploads/...) -> CDN (301).
  // Must run before the static-asset skip below, these paths contain a ".".
  const mediaTarget = resolveLegacyMediaRedirect(request.nextUrl.pathname)
  if (mediaTarget) {
    return applyRobotsHeader(NextResponse.redirect(mediaTarget, 301))
  }

  // Skip static assets (files, images, etc.). robots.txt and the sitemaps
  // match here too, so they stay reachable during maintenance.
  if (request.nextUrl.pathname.includes(".")) {
    return applyRobotsHeader(NextResponse.next())
  }

  // Maintenance mode (toggled in the Medusa admin): 503 + Retry-After for
  // everyone except developers holding the bypass token.
  const maintenanceResponse = await handleMaintenance(request)
  if (maintenanceResponse) {
    return maintenanceResponse
  }

  // Legacy WooCommerce/WPML URLs -> new storefront URLs (301).
  // Exact-match lookup; unmatched paths fall through to normal locale routing.
  const legacyTarget = resolveLegacyRedirect(request.nextUrl.pathname)
  if (legacyTarget && legacyTarget !== request.nextUrl.pathname) {
    const dest = new URL(legacyTarget, request.nextUrl.origin)
    // Keep incoming query params, but let the target's own (e.g. ?page=N) win.
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!dest.searchParams.has(key)) {
        dest.searchParams.set(key, value)
      }
    })
    return applyRobotsHeader(NextResponse.redirect(dest, 301))
  }

  try {
    // ─ Initialize session tracking and fetch configuration
    const cacheId =
      request.cookies.get(CACHE_ID_COOKIE)?.value || crypto.randomUUID()
    const regionMap = await getRegionMap()
    const countryCode = await getCountryCode(request, regionMap)

    geoLog("info",
      `RESOLVED`,
      `country: ${countryCode ?? "(none)"}`,
      `path: ${request.nextUrl.pathname}`
    )

    // ─ Validate that a region was successfully detected
    if (!countryCode) {
      return applyRobotsHeader(new NextResponse(
        "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
        { status: 500 }
      ))
    }

    // ─ Resolve locale and check if redirect is needed
    const region = regionMap.get(countryCode)
    const resolvedLocale = getLocaleFromRegion(region, countryCode)
    const urlSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
    const hasCacheId = request.cookies.has(CACHE_ID_COOKIE)

    geoLog("info",
      `LOCALE CHECK`,
      `url-segment: ${urlSegment ?? "(none)"}`,
      `resolved-locale: ${resolvedLocale}`,
      `match: ${urlSegment === resolvedLocale.toLowerCase() ? "YES → continue" : "NO → redirect"}`
    )

    // ─ If URL already has correct locale, apply pathname rewriting and continue
    if (urlSegment === resolvedLocale.toLowerCase()) {
      // Send internal pathnames to their localized URL (/sv-se/account →
      // /sv-se/konto). GET/HEAD only, so server action POSTs aren't redirected.
      if (request.method === "GET" || request.method === "HEAD") {
        const localizedRedirectPathname = getLocalizedRedirectPathname(
          request.nextUrl.pathname,
          resolvedLocale
        )

        if (localizedRedirectPathname) {
          const url = request.nextUrl.clone()
          url.pathname = localizedRedirectPathname
          return applyRobotsHeader(NextResponse.redirect(url, 307))
        }
      }

      // On first visit, check if the visitor's geolocated country differs
      // from the one in the URL, so we can offer to switch them over.
      const geoSuggestion = await getGeoSuggestion(
        request,
        regionMap,
        countryCode,
        resolvedLocale
      )

      // Rewrite localized pathnames to internal routes
      const rewrittenPathname = rewriteLocalizedPathname(
        request.nextUrl.pathname,
        resolvedLocale
      )

      const response = NextResponse.next()

      // If pathname was rewritten, update the request to use internal pathname
      if (rewrittenPathname !== request.nextUrl.pathname) {
        const url = request.nextUrl.clone()
        url.pathname = rewrittenPathname
        const rewriteResponse = NextResponse.rewrite(url)

        if (!hasCacheId) {
          rewriteResponse.cookies.set(CACHE_ID_COOKIE, cacheId, {
            maxAge: 60 * 60 * 24,
          })
        }

        return applyRobotsHeader(applyGeoSuggestionCookie(
          await applyLocaleCookie(request, rewriteResponse, region, countryCode),
          geoSuggestion
        ))
      }

      if (!hasCacheId) {
        response.cookies.set(CACHE_ID_COOKIE, cacheId, {
          maxAge: 60 * 60 * 24,
        })
      }

      return applyRobotsHeader(applyGeoSuggestionCookie(
        await applyLocaleCookie(request, response, region, countryCode),
        geoSuggestion
      ))
    }

    // ─ Redirect to correct locale URL (307: temporary redirect)
    const pathname =
      request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
    const search = request.nextUrl.search
    const redirectUrl = `${request.nextUrl.origin}/${resolvedLocale.toLowerCase()}${pathname}${search}`

    geoLog("info",
      `REDIRECT 307`,
      `from: ${request.nextUrl.pathname}`,
      `to: /${resolvedLocale.toLowerCase()}${pathname}${search}`
    )

    const response = NextResponse.redirect(redirectUrl, 307)
    response.cookies.set(CACHE_ID_COOKIE, cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return applyRobotsHeader(await applyLocaleCookie(request, response, region, countryCode))
  } catch (error) {
    geoLog("error",
      `MIDDLEWARE FATAL`,
      `path: ${request.nextUrl.pathname}`,
      `error: ${error instanceof Error ? error.message : String(error)}`
    )
    return applyRobotsHeader(new NextResponse("Service temporarily unavailable", { status: 503 }))
  }
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = {
  matcher: [
    "/((?!api|r/|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
