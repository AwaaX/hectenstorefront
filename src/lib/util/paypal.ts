import { HttpTypes } from "@medusajs/types"
import { getStripeShipping } from "./stripe"

/**
 * Public PayPal client id (the secret stays on the backend). When it is not set
 * the PayPal option is hidden at checkout instead of breaking the page.
 */
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim()

/** Storefront locale (en-gb, de-de...) to the code PayPal's SDK expects. */
const PAYPAL_LOCALES: Record<string, string> = {
  "es-es": "es_ES",
  "de-de": "de_DE",
  "it-it": "it_IT",
  "nl-nl": "nl_NL",
  "sv-se": "sv_SE",
  "fr-fr": "fr_FR",
  "en-us": "en_US",
  "en-ca": "en_CA",
  "en-au": "en_AU",
  "en-ie": "en_GB", // PayPal has no en_IE locale
  "en-gb": "en_GB",
}

/** Undefined lets PayPal pick the locale from the browser. */
export const getPaypalLocale = (locale: string): string | undefined =>
  PAYPAL_LOCALES[locale?.toLowerCase()]

/**
 * Sent with the payment session so the PayPal order is created for the address
 * collected in checkout (the buyer pays for that address, which keeps PayPal's
 * seller protection applicable).
 */
export const getPaypalSessionData = (cart: HttpTypes.StoreCart) => {
  const shipping = getStripeShipping(cart)

  return shipping ? { shipping } : {}
}
