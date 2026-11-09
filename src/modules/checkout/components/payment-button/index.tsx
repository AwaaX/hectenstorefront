"use client"

import { isManual, isPaypal, isStripeLike } from "@lib/constants"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { classifyStripeError } from "@lib/util/payment-errors"
import { getStripeBillingDetails, getStripeShipping } from "@lib/util/stripe"
import { useRouter } from "@i18n/navigation"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePaymentErrorAlert } from "../payment-error-dialog/use-payment-error-alert"
import { markPaymentSessionRenewed } from "../payment-container"
import PayPalPaymentButton from "./paypal-payment-button"
import { isRedirectError } from "next/dist/client/components/redirect-error"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const t = useTranslations("Checkout.Payment")
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isStripeLike(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return (
        <Button disabled className="w-full">
          {t("selectMethod")}
        </Button>
      )
  }
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const t = useTranslations("Checkout.Payment")
  const locale = useLocale()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const { show: showError, alert } = usePaymentErrorAlert()

  const stripe = useStripe()
  const elements = useElements()

  const disabled = !stripe || !elements

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
    } catch (err: any) {
      if (isRedirectError(err)) {
        throw err
      }
      // The payment itself went through, only the order could not be finalised
      showError("order", err?.message)
      setSubmitting(false)
    }
  }

  const handlePayment = async () => {
    if (!stripe || !elements || !cart) {
      return
    }

    setSubmitting(true)

    try {
      try {
        // Pick up any PaymentIntent change (amount, shipping) made server-side
        // after the Payment Element was mounted.
        await elements.fetchUpdates()
      } catch {
        // Non-blocking: confirmPayment uses the latest PaymentIntent anyway.
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Redirect-based methods (Klarna, iDEAL, Pay by Bank...) come back here.
          return_url: `${window.location.origin}/${locale}/checkout/payment-return`,
          payment_method_data: {
            billing_details: getStripeBillingDetails(cart),
          },
          shipping: getStripeShipping(cart),
        },
        redirect: "if_required",
      })

      if (error) {
        const session = cart.payment_collection?.payment_sessions?.[0]
        const clientSecret = session?.data?.client_secret as string | undefined

        // Stripe's error doesn't always carry the intent, and its message can be
        // as vague as "A processing error occurred", so ask for the real status.
        const pi =
          error.payment_intent ??
          (clientSecret
            ? (
                await stripe
                  .retrievePaymentIntent(clientSecret)
                  .catch(() => null)
              )?.paymentIntent
            : null)

        if (
          pi &&
          (pi.status === "requires_capture" || pi.status === "succeeded")
        ) {
          return await onPaymentCompleted()
        }

        // A cancelled intent can never be paid: same fix as an expired session
        const kind =
          pi?.status === "canceled"
            ? "session_expired"
            : classifyStripeError(error)

        const providerId = session?.provider_id

        if (kind === "session_expired" && providerId) {
          // Start a new PaymentIntent and send the customer back to re-enter
          // their details. The new client secret remounts this button, so a
          // dialog opened here would vanish; the payment step explains instead.
          const renewed = await initiatePaymentSession(cart, {
            provider_id: providerId,
          })
            .then(() => true)
            .catch(() => false)

          if (renewed) {
            markPaymentSessionRenewed()
            return router.push(
              { pathname: "/checkout", query: { step: "payment" } },
              { scroll: false }
            )
          }
        }

        showError(kind, error.message)
        setSubmitting(false)
        return
      }

      switch (paymentIntent?.status) {
        case "succeeded":
        case "requires_capture":
          return await onPaymentCompleted()

        // Delayed methods (SEPA, ACH, Multibanco, bank transfer...). The order is
        // created by the Stripe webhook once the funds are confirmed.
        case "processing":
        case "requires_action":
          return router.push({
            pathname: "/checkout/payment-return",
            query: {
              payment_intent: paymentIntent.id,
              payment_intent_client_secret: paymentIntent.client_secret ?? "",
            },
          })

        default:
          showError("generic")
          setSubmitting(false)
      }
    } catch (err: any) {
      if (isRedirectError(err)) {
        throw err
      }
      showError("generic", err?.message)
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        className="w-full"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        {t("placeOrder")}
      </Button>
      {alert}
    </>
  )
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const t = useTranslations("Checkout.Payment")
  const [submitting, setSubmitting] = useState(false)
  const { show: showError, alert } = usePaymentErrorAlert()

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        if (isRedirectError(err)) {
          throw err
        }
        console.error("Payment error:", err)
        showError("generic", err?.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        className="w-full"
        data-testid="submit-order-button"
      >
        {t("placeOrder")}
      </Button>
      {alert}
    </>
  )
}

export default PaymentButton
