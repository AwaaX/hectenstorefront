import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import {
  BancontactLogo,
  CardBrands,
  IdealLogo,
  PayPalLogo,
} from "@modules/common/icons/payment-logos"
import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use.
   `title` is a translation key under the `Checkout.PaymentMethods` namespace.
   `logos` (optional) replaces `icon` in the payment option row; `icon` is still used in the summary. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element; logos?: React.JSX.Element }
> = {
  // Stripe Payment Element: cards plus every method enabled in the Stripe Dashboard
  pp_stripe_stripe: {
    title: "stripe",
    icon: <CreditCard />,
    logos: <CardBrands />,
  },
  "pp_medusa-payments_default": {
    title: "creditCard",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "ideal",
    icon: <Ideal />,
    logos: <IdealLogo className="h-8"/>,
  },
  "pp_stripe-bancontact_stripe": {
    title: "bancontact",
    icon: <Bancontact />,
    logos: <BancontactLogo className="h-8"/>,
  },
  pp_paypal_paypal: {
    title: "paypal",
    icon: <PayPal />,
    logos: <PayPalLogo className="h-8"/>,
  },
  pp_system_default: {
    title: "manualPayment",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]

export const COMPANY_INFO_CACHE_TAG = "company-information"
export const SITE_BRAND_CACHE_TAG = "site-brand-information"
