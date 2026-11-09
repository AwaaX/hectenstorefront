import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { buildCartEcommercePayload } from "@lib/analytics"
import AnalyticsEvent from "@modules/analytics/components/event"
import CheckoutStepper from "@modules/checkout/components/checkout-stepper"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocalizedMetadata } from "@lib/util/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Checkout")
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()
  const checkoutAnalyticsPayload = buildCartEcommercePayload(cart)

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 small:py-10">
      <AnalyticsEvent
        eventName="begin_checkout"
        ecommerce={checkoutAnalyticsPayload}
        storageKey={`analytics-begin-checkout-${cart.id}`}
      />

      <CheckoutStepper cart={cart} />

      <div className="grid grid-cols-1 items-start gap-6 small:grid-cols-[minmax(0,1fr)_400px] small:gap-8">
        <div className="min-w-0">
          <PaymentWrapper cart={cart}>
            <CheckoutForm cart={cart} customer={customer} />
          </PaymentWrapper>
        </div>

        {/* On phones the summary comes first, collapsed into a bar */}
        <div className="order-first small:sticky small:top-6 small:order-none">
          <CheckoutSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
