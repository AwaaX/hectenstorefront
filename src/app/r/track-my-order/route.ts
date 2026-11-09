import { NextRequest, NextResponse } from "next/server"
import { getPathname } from "@i18n/routing"
import { defaultLocale, locales } from "@i18n/routing"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const trackingNo = searchParams.get("tracking_no")
  const locale = searchParams.get("locale") || defaultLocale

  const resolvedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : defaultLocale

  const localizedPath = getPathname({
    href: "/track-my-order",
    locale: resolvedLocale,
  })

  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const origin = `${protocol}://${forwardedHost}`
  const redirectUrl = new URL(localizedPath, origin)

  if (trackingNo) {
    redirectUrl.searchParams.set("tracking_no", trackingNo)
  }

  return NextResponse.redirect(redirectUrl, 302)
}
