import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

import { getLocale, getTranslations } from "next-intl/server"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = async ({ order }: ShippingDetailsProps) => {
  const t = await getTranslations("Order.Shipping")
  const locale = await getLocale()

  return (
    <div>
      <Heading level="h2" className="text-xl font-semibold text-ui-fg-base mb-6">
        {t("heading")}
      </Heading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div
          className="flex flex-col"
          data-testid="shipping-address-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-2 font-medium">
            {t("address")}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-contact-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-2 font-medium">
            {t("contact")}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {order.shipping_address?.phone}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {order.email}
          </Text>
        </div>

        <div
          className="flex flex-col"
          data-testid="shipping-method-summary"
        >
          <Text className="txt-medium-plus text-ui-fg-base mb-2 font-medium">
            {t("method")}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle leading-relaxed">
            {(order as any).shipping_methods[0]?.name} (
            {convertToLocale({
              locale,
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
