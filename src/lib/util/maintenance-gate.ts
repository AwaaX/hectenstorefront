import { NextRequest, NextResponse } from "next/server"
import { getMaintenanceState } from "@lib/data/maintenance"
import {
  MAINTENANCE_ACTIVE_HEADER,
  MAINTENANCE_BYPASS_COOKIE,
  MAINTENANCE_BYPASS_HEADER,
  MAINTENANCE_BYPASS_MAX_AGE,
  MAINTENANCE_BYPASS_PARAM,
  MAINTENANCE_LOCALE_HEADER,
  MAINTENANCE_STATE_HEADER,
  MaintenanceState,
  getBypassHash,
  getRetryAfterSeconds,
  isBypassCookie,
  isBypassToken,
  resolveMaintenanceLocale,
} from "@lib/util/maintenance"

const LOCALE_COOKIE_NAME = "_medusa_locale"

// Never let a CDN or browser keep a maintenance (or bypass) response.
const NO_STORE = "no-store, no-cache, must-revalidate, max-age=0"

/**
 * `?maintenance_bypass=<token>` sets the bypass cookie and `?maintenance_bypass=off`
 * clears it. Either way the visitor is redirected to the same URL without the
 * parameter so the token doesn't linger in the address bar, history or logs.
 * Returns null when the parameter is absent or the token is wrong.
 */
const handleBypassParam = async (
  request: NextRequest
): Promise<NextResponse | null> => {
  const param = request.nextUrl.searchParams.get(MAINTENANCE_BYPASS_PARAM)
  if (param === null) {
    return null
  }

  const clearing = param === "off"
  if (!clearing && !(await isBypassToken(param))) {
    return null
  }

  const target = request.nextUrl.clone()
  target.searchParams.delete(MAINTENANCE_BYPASS_PARAM)

  const response = NextResponse.redirect(target, 307)
  response.headers.set("Cache-Control", NO_STORE)

  if (clearing) {
    response.cookies.delete(MAINTENANCE_BYPASS_COOKIE)
  } else {
    response.cookies.set(MAINTENANCE_BYPASS_COOKIE, (await getBypassHash())!, {
      maxAge: MAINTENANCE_BYPASS_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
  }

  return response
}

const hasBypassAccess = async (request: NextRequest): Promise<boolean> => {
  const cookie = request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value
  if (cookie && (await isBypassCookie(cookie))) {
    return true
  }

  const header = request.headers.get(MAINTENANCE_BYPASS_HEADER)
  return header ? isBypassToken(header) : false
}

/**
 * A real 503 (never a 200 or a redirect, so search engines treat it as
 * temporary) with Retry-After. The body is the /maintenance page, rendered by
 * rewriting so the visitor's URL doesn't change.
 */
const maintenanceResponse = (
  request: NextRequest,
  state: MaintenanceState
): NextResponse => {
  const locale = resolveMaintenanceLocale(
    request.nextUrl.pathname,
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    request.headers.get("accept-language")
  )

  // The page refuses to render without these, so it can't be served as a 200.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(MAINTENANCE_ACTIVE_HEADER, "1")
  requestHeaders.set(MAINTENANCE_LOCALE_HEADER, locale)
  requestHeaders.set(
    MAINTENANCE_STATE_HEADER,
    encodeURIComponent(JSON.stringify(state))
  )

  const target = request.nextUrl.clone()
  target.pathname = "/maintenance"
  target.search = ""

  return NextResponse.rewrite(target, {
    status: 503,
    request: { headers: requestHeaders },
    headers: {
      "Retry-After": String(getRetryAfterSeconds(state.expected_end_at)),
      "Cache-Control": NO_STORE,
      Pragma: "no-cache",
    },
  })
}

/**
 * Maintenance gate for the middleware. Returns a response when the request
 * must not continue (bypass redirect or the 503 page), or null to carry on.
 */
export async function handleMaintenance(
  request: NextRequest
): Promise<NextResponse | null> {
  const bypassRedirect = await handleBypassParam(request)
  if (bypassRedirect) {
    return bypassRedirect
  }

  if (await hasBypassAccess(request)) {
    return null
  }

  const state = await getMaintenanceState()
  if (!state.enabled) {
    return null
  }

  return maintenanceResponse(request, state)
}
