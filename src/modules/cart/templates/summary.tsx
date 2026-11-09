"use client"

import { LockClosedSolid } from "@medusajs/icons"
import { Button } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import DiscountCode, {
  discountCodeCardClass,
} from "@modules/checkout/components/discount-code"
import {
  AmexLogo,
  ApplePayLogo,
  GooglePayLogo,
  MastercardLogo,
  PayPalLogo,
  VisaLogo,
} from "@modules/common/icons/payment-logos"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
  shippingOptions?: HttpTypes.StoreCartShippingOption[]
}

export function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else if (
    cart?.payment_collection?.payment_sessions?.some(
      (s: any) => s.status === "pending"
    )
  ) {
    return "review"
  } else {
    return "payment"
  }
}

const Summary = ({ cart, shippingOptions = [] }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const t = useTranslations("Cart.Summary")
  const tl = useTranslations("Checkout.Layout")

  return (
    <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm">
      <div className="px-5 py-4 small:px-7 small:py-5">
        <h2 className="text-lg font-semibold text-ui-fg-base small:text-xl">
          {t("heading")}
        </h2>
      </div>

      <div
        className={`border-t border-ui-border-base px-5 py-4 small:px-7 ${discountCodeCardClass}`}
      >
        <DiscountCode cart={cart} />
      </div>

      {/* hide CartTotals' own closing rule, the card provides the edge */}
      <div className="border-t border-ui-border-base bg-ui-bg-subtle px-5 py-5 small:px-7 small:py-6 [&>div>div:last-child]:hidden">
        <CartTotals totals={cart} shippingOptions={shippingOptions} />
      </div>

      <div className="flex flex-col gap-y-4 border-t border-ui-border-base px-5 py-5 small:px-7 small:py-6">
        <LocalizedClientLink
          href={{ pathname: "/checkout", query: { step } }}
          data-testid="checkout-button"
        >
          <Button size="large" className="h-12 w-full">
            {t("checkout")}
          </Button>
        </LocalizedClientLink>

        <div className="flex flex-col items-center gap-y-3">
          <span className="inline-flex items-center gap-x-1.5 text-small-semi text-ui-fg-subtle">
            <LockClosedSolid />
            {tl("secureCheckout")}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <VisaLogo />
            <MastercardLogo />
            <AmexLogo />
            <PayPalLogo />
            <ApplePayLogo />
            <GooglePayLogo />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Summary
