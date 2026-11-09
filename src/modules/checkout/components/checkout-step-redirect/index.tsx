"use client"

import { useRouter } from "@i18n/navigation"
import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const STEPS = ["address", "delivery", "payment", "review"]

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  const paidByGiftcard =
    (cart as any)?.gift_cards?.length > 0 && cart?.total === 0

  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else if (
    paidByGiftcard ||
    cart?.payment_collection?.payment_sessions?.some(
      (s: any) => s.status === "pending"
    )
  ) {
    return "review"
  } else {
    return "payment"
  }
}

const CheckoutStepRedirect = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const step = searchParams.get("step")
    const correctStep = getCheckoutStep(cart)
    // A step further ahead than the cart allows is also corrected, e.g. when a
    // promotion changes the total and Medusa drops the payment session.
    if (!step || STEPS.indexOf(step) > STEPS.indexOf(correctStep)) {
      router.replace(
        { pathname: "/checkout", query: { step: correctStep } },
        { scroll: false }
      )
    }
  }, [cart, router, searchParams])

  return null
}

export default CheckoutStepRedirect
