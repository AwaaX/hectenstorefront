import type {
  StripeElementLocale,
  StripePaymentElementOptions,
} from "@stripe/stripe-js"
import { HttpTypes } from "@medusajs/types"

type CartAddress = HttpTypes.StoreCart["billing_address"]

/** Cart metadata key set while a delayed payment (SEPA, ACH...) is awaiting funds. */
export const PAYMENT_PENDING_METADATA_KEY = "payment_pending_at"

const toStripeAddress = (address: CartAddress) => ({
  line1: address?.address_1 ?? "",
  line2: address?.address_2 ?? "",
  city: address?.city ?? "",
  state: address?.province ?? "",
  postal_code: address?.postal_code ?? "",
  country: (address?.country_code ?? "").toUpperCase(),
})

const fullName = (address: CartAddress) =>
  [address?.first_name, address?.last_name].filter(Boolean).join(" ")

/**
 * Billing details sent with `stripe.confirmPayment`. The customer already gave
 * these in the address step, so the Payment Element never asks for them again
 * (this is what removes the zip/country inputs from the card form).
 */
export const getStripeBillingDetails = (cart: HttpTypes.StoreCart) => {
  const phone = cart.billing_address?.phone

  return {
    name: fullName(cart.billing_address),
    email: cart.email ?? "",
    address: toStripeAddress(cart.billing_address),
    ...(phone ? { phone } : {}),
  }
}

/** Shipping details, required by methods such as Afterpay and used by Klarna. */
export const getStripeShipping = (cart: HttpTypes.StoreCart) => {
  const address = cart.shipping_address

  if (!address) {
    return undefined
  }

  return {
    name: fullName(address),
    address: toStripeAddress(address),
    ...(address.phone ? { phone: address.phone } : {}),
  }
}

/**
 * Payment Element options. Every billing field we can supply from the cart is
 * hidden; Stripe requires them to be passed back in `confirmPayment`. Phone is
 * only hidden when we actually have one, so methods that need it can still ask.
 */
export const getPaymentElementOptions = (
  cart: HttpTypes.StoreCart
): StripePaymentElementOptions => ({
  layout: {
    type: "accordion",
    defaultCollapsed: false,
    radios: false,
    spacedAccordionItems: true,
  },
  fields: {
    billingDetails: {
      name: "never",
      email: "never",
      address: "never",
      phone: cart.billing_address?.phone ? "never" : "auto",
    },
  },
  wallets: { applePay: "auto", googlePay: "auto" },
})

/** Maps the storefront locale (en-gb, de-de...) to a Stripe Elements locale. */
const STRIPE_LOCALES: Record<string, StripeElementLocale> = {
  "es-es": "es",
  "de-de": "de",
  "it-it": "it",
  "nl-nl": "nl",
  "sv-se": "sv",
  "fr-fr": "fr",
  "en-us": "en",
  "en-ca": "en-CA",
  "en-au": "en-AU",
  "en-ie": "en-GB", // Stripe has no en-IE locale
  "en-gb": "en-GB",
}

export const getStripeLocale = (locale: string): StripeElementLocale =>
  STRIPE_LOCALES[locale?.toLowerCase()] ?? "auto"

/** Display names for the `type` reported by the Payment Element / PaymentIntent. */
const STRIPE_METHOD_LABELS: Record<string, string> = {
  sepa_debit: "SEPA Direct Debit",
  customer_balance: "Bank transfer",
  us_bank_account: "ACH bank transfer",
  ideal: "iDEAL",
  wero: "Wero",
  klarna: "Klarna",
  link: "Link",
  paypal: "PayPal",
  afterpay_clearpay: "Afterpay / Clearpay",
  pay_by_bank: "Pay by Bank",
  eps: "EPS",
  multibanco: "Multibanco",
  mb_way: "MB WAY",
  satispay: "Satispay",
  revolut_pay: "Revolut Pay",
  scalapay: "Scalapay",
  alma: "Alma",
  swish: "Swish",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  bancontact: "Bancontact",
}

/**
 * Returns a brand/method name for a Stripe payment method type, or null for
 * "card" so callers can use their translated "Credit card" label instead.
 */
export const getStripeMethodLabel = (type?: string | null) => {
  if (!type || type === "card") {
    return null
  }

  return (
    STRIPE_METHOD_LABELS[type] ??
    type.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  )
}
