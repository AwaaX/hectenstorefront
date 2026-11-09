import { Container, Heading, Text } from "@medusajs/ui"

import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { getStripeMethodLabel } from "@lib/util/stripe"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = async ({ order }: PaymentDetailsProps) => {
  const t = await getTranslations("Order.Payment")
  const tm = await getTranslations("Checkout.PaymentMethods")
  const locale = await getLocale()
  const payment = order.payment_collections?.[0]?.payments?.[0]

  // Stripe stores the PaymentIntent (with its payment method expanded) on the payment.
  const stripeMethod =
    payment && isStripeLike(payment.provider_id)
      ? (payment.data?.payment_method as
          | { type?: string; card?: { last4?: string } }
          | string
          | undefined)
      : undefined
  const methodType =
    typeof stripeMethod === "object" ? stripeMethod?.type : undefined
  const cardLast4 =
    typeof stripeMethod === "object"
      ? stripeMethod?.card?.last4
      : (payment?.data?.card_last4 as string | undefined)
  const paymentInfo = payment ? paymentInfoMap[payment.provider_id] : undefined
  const methodTitle = methodType
    ? getStripeMethodLabel(methodType) ?? tm("creditCard")
    : paymentInfo?.title
    ? tm(paymentInfo.title)
    : payment?.provider_id

  return (
    <div>
      <Heading level="h2" className="text-xl font-semibold text-ui-fg-base mb-6">
        {t("title")}
      </Heading>
      {payment && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <Text className="txt-medium-plus text-ui-fg-base mb-2 font-medium">
              {t("method")}
            </Text>
            <Text
              className="txt-medium text-ui-fg-subtle"
              data-testid="payment-method"
            >
              {methodTitle}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text className="txt-medium-plus text-ui-fg-base mb-2 font-medium">
              {t("details")}
            </Text>
            <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
              <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover rounded-md">
                {paymentInfo?.icon}
              </Container>
              <Text data-testid="payment-amount">
                {isStripeLike(payment.provider_id) && cardLast4
                  ? `**** **** **** ${cardLast4}`
                  : t("paidAt", {
                      amount: convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      }),
                      date: new Date(payment.created_at ?? "").toLocaleString(
                        locale
                      ),
                    })}
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentDetails
