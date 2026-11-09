// Email a visitor typed (e.g. in the newsletter form) before they had a cart.
// Read server side when the cart is created, then cleared.
export const PENDING_CART_EMAIL_COOKIE = "_pending_cart_email"
const PENDING_CART_EMAIL_MAX_AGE = 60 * 60 * 24 * 30

export const rememberPendingCartEmail = (email: string) => {
  if (typeof document === "undefined") {
    return
  }

  document.cookie = `${PENDING_CART_EMAIL_COOKIE}=${encodeURIComponent(
    email
  )}; path=/; max-age=${PENDING_CART_EMAIL_MAX_AGE}; samesite=lax${
    window.location.protocol === "https:" ? "; secure" : ""
  }`
}
