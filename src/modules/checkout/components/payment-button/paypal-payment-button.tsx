"use client"

import { useRouter } from "@i18n/navigation"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { useTranslations } from "next-intl"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { useState } from "react"
import { usePaymentErrorAlert } from "../payment-error-dialog/use-payment-error-alert"

type PayPalPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

/**
 * Review-step payment for PayPal. PayPal's own buttons replace "Place order":
 * the customer approves the payment in PayPal's window, then the Medusa order is
 * placed (the backend captures the PayPal order while completing the cart).
 */
const PayPalPaymentButton: React.FC<PayPalPaymentButtonProps> = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}) => {
  const t = useTranslations("Checkout.Payment")
  const tError = useTranslations("Checkout.PaymentError")
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const { show: showError, alert } = usePaymentErrorAlert()

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.status === "pending"
  )
  const orderId = paymentSession?.data?.order_id as string | undefined

  // The backend already created the PayPal order when the session was started
  const createOrder = async () => {
    if (!orderId) {
      throw new Error("PayPal order not found")
    }

    return orderId
  }

  const onApprove = async () => {
    setSubmitting(true)

    try {
      await placeOrder()
    } catch (err: any) {
      // A successful order redirects to the confirmation page
      if (isRedirectError(err)) {
        return
      }

      const message = err?.message as string | undefined

      showError(/declin/i.test(message ?? "") ? "declined" : "generic", message)
      setSubmitting(false)
    }
  }

  const onError = (err: Record<string, unknown>) => {
    if (isRedirectError(err)) {
      return
    }

    showError("generic", err?.message as string | undefined)
    setSubmitting(false)
  }

  // Closing PayPal's window is not an error
  const onCancel = () => setSubmitting(false)

  if (isRejected) {
    return (
      <div
        className="flex flex-col gap-y-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4"
        data-testid="paypal-unavailable"
      >
        <p className="text-small-regular text-ui-fg-subtle">
          {t("paypalUnavailable")}
        </p>
        <Button
          variant="secondary"
          onClick={() =>
            router.push(
              { pathname: "/checkout", query: { step: "payment" } },
              { scroll: false }
            )
          }
        >
          {tError("actions.changeMethod")}
        </Button>
      </div>
    )
  }

  if (isPending) {
    return (
      <Button
        disabled
        size="large"
        isLoading
        className="w-full xsmall:w-auto"
        data-testid={dataTestId}
      >
        {t("paypalLoading")}
      </Button>
    )
  }

  return (
    <>
      <div className="relative max-w-[420px]" data-testid={dataTestId}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          // Re-render the buttons when the order or readiness changes
          forceReRender={[orderId, notReady]}
          disabled={notReady || submitting}
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 48,
          }}
        />

        {submitting && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-md bg-white/80 text-small-regular text-ui-fg-base"
            role="status"
            aria-live="polite"
          >
            {t("paypalFinalising")}
          </div>
        )}
      </div>
      {alert}
    </>
  )
}

export default PayPalPaymentButton
