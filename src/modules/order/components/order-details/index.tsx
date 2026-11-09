import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = async ({ order, showStatus }: OrderDetailsProps) => {
  const t = await getTranslations("Order.Details")

  const formatStatus = (str: string) => {
    if (t.has(`statuses.${str}`)) {
      return t(`statuses.${str}`)
    }

    const formatted = str.split("_").join(" ")

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="flex flex-col gap-3">
      <Text className="text-ui-fg-subtle leading-relaxed">
        {t.rich("confirmationDetails", {
          email: () => (
            <span
              className="text-ui-fg-base font-semibold"
              data-testid="order-email"
            >
              {order.email}
            </span>
          ),
        })}
      </Text>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ui-bg-subtle">
            <svg className="w-4 h-4 text-ui-fg-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </span>
          <Text className="text-ui-fg-subtle text-sm">
            <span data-testid="order-date">
              {new Date(order.created_at).toDateString()}
            </span>
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ui-bg-subtle">
            <svg className="w-4 h-4 text-ui-fg-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
            </svg>
          </span>
          <Text className="text-ui-fg-interactive text-sm font-medium">
            <span data-testid="order-id">{order.display_id}</span>
          </Text>
        </div>
      </div>

      {showStatus && (
        <div className="flex items-center gap-4 mt-2 pt-3 border-t border-ui-border-base">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="text-sm text-ui-fg-subtle">
              {t("orderStatus")}{" "}
              <span className="font-medium text-ui-fg-base" data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <Text className="text-sm text-ui-fg-subtle">
              {t("paymentStatus")}{" "}
              <span
                className="font-medium text-ui-fg-base"
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetails
