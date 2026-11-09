"use client"

import { Text } from "@medusajs/ui"

import { isPaypal } from "@lib/constants"
import PaymentButton from "../payment-button"
import StepCard from "../step-card"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const Review = ({ cart }: { cart: any }) => {
  const t = useTranslations("Checkout.Review")
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // PayPal has its own buttons instead of "Place order"
  const payingWithPaypal = isPaypal(
    cart?.payment_collection?.payment_sessions?.[0]?.provider_id
  )

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <StepCard
      number={4}
      title={t("heading")}
      isOpen={isOpen}
      isDisabled={!isOpen}
      showBody={isOpen && !!previousStepsCompleted}
    >
      {isOpen && previousStepsCompleted && (
        <>
          <div className="mb-5 rounded-xl bg-ui-bg-subtle p-4">
            <Text className="text-small-regular text-ui-fg-subtle">
              {t(payingWithPaypal ? "confirmationPaypal" : "confirmation")}
            </Text>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </StepCard>
  )
}

export default Review
