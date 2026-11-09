import "server-only"
import { cookies as nextCookies } from "next/headers"
import { PENDING_CART_EMAIL_COOKIE } from "@lib/util/pending-cart-email"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}

export const getPendingCartEmail = async () => {
  const cookies = await nextCookies()
  return cookies.get(PENDING_CART_EMAIL_COOKIE)?.value
}

export const removePendingCartEmail = async () => {
  const cookies = await nextCookies()
  cookies.set(PENDING_CART_EMAIL_COOKIE, "", {
    maxAge: -1,
  })
}

export const GUEST_WISHLIST_COOKIE = "_guest_wishlist"
export const GUEST_WISHLIST_MAX_ENTRIES = 50

export type GuestWishlistEntry = {
  productId: string
  variantId: string
}

export const getGuestWishlistEntries = async (): Promise<
  GuestWishlistEntry[]
> => {
  const cookies = await nextCookies()
  const value = cookies.get(GUEST_WISHLIST_COOKIE)?.value

  if (!value) {
    return []
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value))

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (entry): entry is GuestWishlistEntry =>
        Boolean(entry) &&
        typeof entry.productId === "string" &&
        typeof entry.variantId === "string"
    )
  } catch {
    return []
  }
}

export const removeGuestWishlist = async () => {
  const cookies = await nextCookies()
  cookies.set(GUEST_WISHLIST_COOKIE, "", {
    maxAge: -1,
  })
}
