export const GUEST_WISHLIST_COOKIE = "_guest_wishlist"
export const GUEST_WISHLIST_MAX_ENTRIES = 50
export const GUEST_WISHLIST_CHANGED_EVENT = "guest-wishlist-changed"
const GUEST_WISHLIST_MAX_AGE = 60 * 60 * 24 * 180

export type GuestWishlistEntry = {
  productId: string
  variantId: string
}

const readCookieValue = () => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${GUEST_WISHLIST_COOKIE}=`))

  return match ? match.slice(GUEST_WISHLIST_COOKIE.length + 1) : null
}

export const readGuestWishlist = (): GuestWishlistEntry[] => {
  if (typeof document === "undefined") {
    return []
  }

  const raw = readCookieValue()

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw))

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

const writeGuestWishlist = (entries: GuestWishlistEntry[]) => {
  document.cookie = `${GUEST_WISHLIST_COOKIE}=${encodeURIComponent(
    JSON.stringify(entries)
  )}; path=/; max-age=${GUEST_WISHLIST_MAX_AGE}; samesite=lax`

  window.dispatchEvent(new CustomEvent(GUEST_WISHLIST_CHANGED_EVENT))
}

export const addGuestWishlistEntry = (entry: GuestWishlistEntry) => {
  const current = readGuestWishlist()

  if (current.some((existing) => existing.variantId === entry.variantId)) {
    return current
  }

  const next = [...current, entry].slice(-GUEST_WISHLIST_MAX_ENTRIES)

  writeGuestWishlist(next)

  return next
}

export const removeGuestWishlistEntry = (variantId: string) => {
  const next = readGuestWishlist().filter(
    (entry) => entry.variantId !== variantId
  )

  writeGuestWishlist(next)

  return next
}

export const clearGuestWishlist = () => {
  document.cookie = `${GUEST_WISHLIST_COOKIE}=; path=/; max-age=0`
  window.dispatchEvent(new CustomEvent(GUEST_WISHLIST_CHANGED_EVENT))
}
