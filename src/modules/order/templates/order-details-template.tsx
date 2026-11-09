import { ArrowLongLeft } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import AccountPageHeader from "@modules/account/components/page-header"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"
import { getTranslations } from "next-intl/server"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate = async ({ order }: OrderDetailsTemplateProps) => {
  const t = await getTranslations("Order.Details")

  return (
    <div className="flex flex-col">
      <LocalizedClientLink
        href="/account/orders"
        className="mb-5 inline-flex w-fit items-center gap-x-2 text-sm font-medium text-secondary transition-colors hover:text-black"
        data-testid="back-to-overview-button"
      >
        <ArrowLongLeft /> {t("back")}
      </LocalizedClientLink>
      <AccountPageHeader title={t("heading")} />
      <div
        className="flex h-full w-full flex-col gap-6"
        data-testid="order-details-container"
      >
        <Section>
          <OrderDetails order={order} showStatus />
          <div className="mt-4">
            <Items order={order} />
          </div>
        </Section>
        <Section>
          <ShippingDetails order={order} />
        </Section>
        <div className="grid grid-cols-1 gap-6 small:grid-cols-2">
          <Section className="order-2 small:order-1">
            <Help />
          </Section>
          <Section className="order-1 bg-surface/60 small:order-2">
            <OrderSummary order={order} />
          </Section>
        </div>
      </div>
    </div>
  )
}

const Section = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <section
    className={clx(
      "rounded-xl border border-line bg-white p-5 small:p-6",
      className
    )}
  >
    {children}
  </section>
)

export default OrderDetailsTemplate
