import { NextRequest, NextResponse } from "next/server"
import { resolveMaintenanceLocale } from "@lib/util/maintenance"

/** Set by the middleware; the /store-unavailable page 404s without it */
export const STORE_UNAVAILABLE_HEADER = "x-store-unavailable"
export const STORE_UNAVAILABLE_LOCALE_HEADER = "x-store-unavailable-locale"

const LOCALE_COOKIE_NAME = "_medusa_locale"

/**
 * Shown when the backend has no region with countries, so no storefront can
 * be served. A 503 (temporary) rendered from /store-unavailable by rewriting,
 * so the visitor's URL doesn't change.
 */
export const storeUnavailableResponse = (request: NextRequest): NextResponse => {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(STORE_UNAVAILABLE_HEADER, "1")
  requestHeaders.set(
    STORE_UNAVAILABLE_LOCALE_HEADER,
    resolveMaintenanceLocale(
      request.nextUrl.pathname,
      request.cookies.get(LOCALE_COOKIE_NAME)?.value,
      request.headers.get("accept-language")
    )
  )

  const target = request.nextUrl.clone()
  target.pathname = "/store-unavailable"
  target.search = ""

  return NextResponse.rewrite(target, {
    status: 503,
    request: { headers: requestHeaders },
    headers: {
      "Retry-After": "300",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  })
}
