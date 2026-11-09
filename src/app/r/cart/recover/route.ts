import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { getPathname } from "@i18n/routing"
import { defaultLocale, locales } from "@i18n/routing"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const cartId = searchParams.get("cart_id")
  const locale = searchParams.get("locale") || defaultLocale
  const promo = searchParams.get("promo")

  if (!cartId) {
    return new NextResponse("Missing cart_id parameter", { status: 400 })
  }

  const resolvedLocale = locales.includes(locale as (typeof locales)[number])
    ? locale
    : defaultLocale

  if (promo) {
    try {
      await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ promo_codes: [promo] }),
      })
    } catch (e) {
      console.error("Smart link: failed to apply promo code to cart", cartId, e)
    }
  }

  const cacheId = request.cookies.get("_medusa_cache_id")?.value
  if (cacheId) {
    revalidateTag(`carts-${cacheId}`)
    revalidateTag(`fulfillment-${cacheId}`)
  }

  const localizedCartPath = getPathname({
    href: "/cart",
    locale: resolvedLocale,
  })

  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.host
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const origin = `${protocol}://${forwardedHost}`
  const redirectUrl = new URL(localizedCartPath, origin)

  const response = NextResponse.redirect(redirectUrl, 302)
  response.cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}
