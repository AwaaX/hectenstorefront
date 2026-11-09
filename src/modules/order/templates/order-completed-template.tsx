import { Heading, Text } from "@medusajs/ui"
import { cookies as nextCookies } from "next/headers"

import { buildOrderEcommercePayload } from "@lib/analytics"
import AnalyticsEvent from "@modules/analytics/components/event"
import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const t = await getTranslations("Order.Completed")
  const cookies = await nextCookies()
  const purchaseAnalyticsPayload = buildOrderEcommercePayload(order)

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="bg-ui-bg-subtle min-h-[calc(100vh-64px)] py-10 sm:py-14">
      <AnalyticsEvent
        eventName="purchase"
        ecommerce={purchaseAnalyticsPayload}
        storageKey={`analytics-purchase-${order.id}`}
      />
      <div className="content-container max-w-6xl w-full mx-auto px-4">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div
          className="flex flex-col items-center text-center mb-8"
          data-testid="order-complete-container"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <svg
              className="w-7 h-7 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <Heading
            level="h1"
            className="text-2xl sm:text-3xl font-semibold text-ui-fg-base"
          >
            {t("heading")}
          </Heading>
          <Text className="text-ui-fg-subtle mt-2 text-base max-w-md">
            {t("description")}
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column — items & totals */}
          <div className="lg:col-span-3 bg-ui-bg-base rounded-xl border border-ui-border-base p-6 sm:p-8 shadow-sm">
            <Heading level="h2" className="text-xl font-semibold text-ui-fg-base mb-4">
              {t("summary")}
            </Heading>
            <Items order={order} />
            <div className="mt-6">
              <CartTotals totals={order} />
            </div>
          </div>

          {/* Right column — order info, shipping, payment, help */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-ui-bg-base rounded-xl border border-ui-border-base p-6 shadow-sm">
              <OrderDetails order={order} />
            </div>

            <div className="bg-ui-bg-base rounded-xl border border-ui-border-base p-6 shadow-sm">
              <ShippingDetails order={order} />
              <div className="h-px bg-ui-border-base my-6" />
              <PaymentDetails order={order} />
            </div>

            <Help />
          </div>
        </div>
      </div>
    </div>
  )
}
