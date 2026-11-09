"use client"

import { noDivisionCurrencies } from "@lib/constants"
import { markCartPaymentPending, placeOrder } from "@lib/data/cart"
import { classifyStripeError, PaymentErrorKind } from "@lib/util/payment-errors"
import { convertToLocale } from "@lib/util/money"
import { stripePromise } from "@modules/checkout/components/payment-wrapper"
import { PaymentIntent } from "@stripe/stripe-js"
import { useLocale } from "next-intl"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import PaymentReturnView, { ReturnStatus } from "./view"

const SLOW_AFTER_MS = 10_000

const formatAmount = (intent: PaymentIntent, locale: string) => {
  const currency = intent.currency?.toLowerCase()

  if (!currency || typeof intent.amount !== "number") {
    return null
  }

  return convertToLocale({
    amount: noDivisionCurrencies.includes(currency)
      ? intent.amount
      : intent.amount / 100,
    currency_code: currency.toUpperCase(),
    locale,
  })
}

/** Stripe-hosted page that tells the customer how to complete a delayed payment. */
const getInstructionsUrl = (intent: PaymentIntent): string | null => {
  const action = intent.next_action as Record<string, any> | null | undefined

  const candidates = [
    action?.multibanco_display_details?.hosted_voucher_url,
    action?.display_bank_transfer_instructions?.hosted_instructions_url,
    action?.verify_with_microdeposits?.hosted_verification_url,
    action?.oxxo_display_details?.hosted_voucher_url,
    action?.boleto_display_details?.hosted_voucher_url,
    action?.konbini_display_details?.hosted_voucher_url,
  ]

  return (
    candidates.find(
      (url): url is string => typeof url === "string" && url.startsWith("https://")
    ) ?? null
  )
}

/**
 * Landing page after a payment that did not finish inline:
 *  - redirect-based methods (Klarna, iDEAL, Pay by Bank...) return here from the
 *    bank / provider with `payment_intent_client_secret` in the URL;
 *  - delayed methods (SEPA, ACH, Multibanco...) are sent here right after
 *    confirmation while the funds are still on their way.
 *
 * Paid: the cart is completed here. Waiting for funds: the Stripe webhook
 * completes the cart (and creates the order) once the payment is confirmed.
 */
const PaymentReturn = () => {
  const locale = useLocale()
  const searchParams = useSearchParams()
  const clientSecret = searchParams.get("payment_intent_client_secret")

  const [status, setStatus] = useState<ReturnStatus>("checking")
  const [amount, setAmount] = useState<string | null>(null)
  const [instructionsUrl, setInstructionsUrl] = useState<string | null>(null)
  const [failureKind, setFailureKind] = useState<PaymentErrorKind>("generic")
  const [slow, setSlow] = useState(false)
  const handled = useRef(false)

  useEffect(() => {
    if (status !== "checking") {
      return
    }

    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS)

    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (handled.current) {
      return
    }
    handled.current = true

    const run = async () => {
      const stripe = await stripePromise

      if (!stripe || !clientSecret) {
        setStatus("failed")
        return
      }

      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)

      if (paymentIntent) {
        setAmount(formatAmount(paymentIntent, locale))
        setInstructionsUrl(getInstructionsUrl(paymentIntent))
      }

      switch (paymentIntent?.status) {
        case "succeeded":
        case "requires_capture":
          try {
            await placeOrder()
          } catch (err) {
            if (isRedirectError(err)) {
              return
            }
            // No cart in this browser (e.g. opened from a banking app) or the
            // webhook already completed it: the order exists or is being created.
            setStatus("received")
          }
          return

        case "processing":
        case "requires_action":
          await markCartPaymentPending()
          setStatus("pending")
          return

        default:
          setFailureKind(classifyStripeError(paymentIntent?.last_payment_error))
          setStatus("failed")
      }
    }

    run().catch(() => setStatus("failed"))
  }, [clientSecret, locale])

  return (
    <PaymentReturnView
      status={status}
      amount={amount}
      instructionsUrl={instructionsUrl}
      failureKind={failureKind}
      slow={slow}
    />
  )
}

export default PaymentReturn
