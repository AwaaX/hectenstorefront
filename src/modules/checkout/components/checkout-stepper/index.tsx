"use client"

import { HttpTypes } from "@medusajs/types"
import { CheckMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

const STEP_IDS = ["address", "delivery", "payment", "review"] as const
type StepId = (typeof STEP_IDS)[number]

// Same rule the page uses to decide where to send the customer
function currentStepFromCart(cart: HttpTypes.StoreCart): StepId {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  }

  if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  }

  if (
    cart?.payment_collection?.payment_sessions?.some(
      (s: any) => s.status === "pending"
    )
  ) {
    return "review"
  }

  return "payment"
}

/**
 * Progress indicator at the top of the checkout. Display only: it reflects the
 * `step` the page is already on and never changes it.
 */
const CheckoutStepper = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const tAddresses = useTranslations("Checkout.Addresses")
  const tShipping = useTranslations("Checkout.Shipping")
  const tPayment = useTranslations("Checkout.Payment")
  const tReview = useTranslations("Checkout.Review")
  const tLayout = useTranslations("Checkout.Layout")
  const searchParams = useSearchParams()

  const requested = searchParams.get("step") as StepId | null
  const current: StepId =
    requested && STEP_IDS.includes(requested)
      ? requested
      : currentStepFromCart(cart)
  const currentIndex = STEP_IDS.indexOf(current)

  const labels: Record<StepId, string> = {
    address: tAddresses("shippingAddress"),
    delivery: tShipping("delivery"),
    payment: tPayment("title"),
    review: tReview("heading"),
  }

  return (
    <nav aria-label={tLayout("progress")} className="mb-6 small:mb-8">
      <ol className="mx-auto flex max-w-2xl items-center justify-center">
        {STEP_IDS.map((id, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <li
              key={id}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center"
            >
              <div className="flex items-center gap-x-2">
                <span
                  className={clx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-small-semi transition-colors",
                    isComplete && "bg-ui-tag-green-icon text-white",
                    isCurrent && "bg-ui-fg-base text-white",
                    !isComplete &&
                      !isCurrent &&
                      "border border-ui-border-strong text-ui-fg-muted"
                  )}
                >
                  {isComplete ? <CheckMini /> : index + 1}
                </span>
                <span
                  className={clx("text-small-regular", {
                    // only the current label on very small screens
                    "hidden xsmall:inline": !isCurrent,
                    "font-semibold text-ui-fg-base": isCurrent,
                    "text-ui-fg-base": isComplete,
                    "text-ui-fg-muted": !isComplete && !isCurrent,
                  })}
                >
                  {labels[id]}
                </span>
              </div>

              {index < STEP_IDS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={clx(
                    "mx-2 h-px w-4 xsmall:mx-3 xsmall:w-10 small:w-14",
                    index < currentIndex
                      ? "bg-ui-tag-green-icon"
                      : "bg-ui-border-strong"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default CheckoutStepper
