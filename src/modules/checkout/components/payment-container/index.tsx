import { Radio as RadioGroupOption } from "@headlessui/react"
import { Button, Text, clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import React, { useContext, useMemo, useState, type JSX } from "react"

import Radio from "@modules/common/components/radio"

import { isManual } from "@lib/constants"
import SkeletonCardDetails from "@modules/skeletons/components/skeleton-card-details"
import { getPaymentElementOptions } from "@lib/util/stripe"
import { initiatePaymentSession } from "@lib/data/cart"
import {
  isStaleSessionError,
  isTerminalIntentError,
} from "@lib/util/payment-errors"
import { useRouter } from "@i18n/navigation"
import { ExclamationCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { PaymentElement } from "@stripe/react-stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"
import { stripePromise } from "../payment-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<
    string,
    { title: string; icon: JSX.Element; logos?: JSX.Element }
  >
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const tm = useTranslations("Checkout.PaymentMethods")
  const isDevelopment = process.env.NODE_ENV === "development"
  const title = paymentInfoMap[paymentProviderId]?.title

  return (
    <RadioGroupOption
      key={paymentProviderId}
      value={paymentProviderId}
      disabled={disabled}
      className={clx(
        "mb-3 flex cursor-pointer flex-col gap-y-2 rounded-xl border border-ui-border-base bg-white p-4 text-small-regular transition-all hover:border-ui-border-strong hover:shadow-sm small:px-5",
        {
          "!border-ui-fg-base ring-1 ring-ui-fg-base":
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <div className="flex items-center justify-between gap-x-3">
        <div className="flex min-w-0 items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <Text className="text-base-regular">
            {title ? tm(title) : paymentProviderId}
          </Text>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden small:block" />
          )}
        </div>
        <span className="shrink-0 justify-self-end text-ui-fg-base">
          {paymentInfoMap[paymentProviderId]?.logos ??
            paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="small:hidden text-[10px]" />
      )}
      {children}
    </RadioGroupOption>
  )
}

export default PaymentContainer

// When the Payment Element can't load a stale PaymentIntent we quietly create a
// new payment session once. Module-level because the new client secret remounts
// the whole Elements tree (and this component with it).
const AUTO_REFRESH_COOLDOWN_MS = 30_000
let lastAutoRefreshAt = 0

// Set when a cancelled PaymentIntent was swapped for a new one after the
// customer had filled in the form, so the remounted form can say why it's empty.
let sessionRenewedNotice = false

/**
 * If the session's PaymentIntent was cancelled (in Stripe or by the backend),
 * it can never be paid: start a new payment session. Returns true when it did.
 */
export const renewCancelledPaymentSession = async (
  cart: HttpTypes.StoreCart,
  session: HttpTypes.StorePaymentSession | undefined
) => {
  const clientSecret = session?.data?.client_secret as string | undefined
  const stripe = await stripePromise

  if (!session || !stripe || !clientSecret) {
    return false
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)

  if (paymentIntent?.status !== "canceled") {
    return false
  }

  await initiatePaymentSession(cart, { provider_id: session.provider_id })
  sessionRenewedNotice = true
  return true
}

/** Same notice, for callers that already renewed the session themselves. */
export const markPaymentSessionRenewed = () => {
  sessionRenewedNotice = true
}

export const StripePaymentContainer = ({
  cart,
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setPaymentType,
  setError,
  setPaymentComplete,
}: Omit<PaymentContainerProps, "children"> & {
  cart: HttpTypes.StoreCart
  setPaymentType: (type: string | null) => void
  setError: (error: string | null) => void
  setPaymentComplete: (complete: boolean) => void
}) => {
  const t = useTranslations("Checkout.Payment")
  const stripeReady = useContext(StripeContext)
  const router = useRouter()
  const [loadFailed, setLoadFailed] = useState(false)
  const [reloading, setReloading] = useState(false)
  const [renewed] = useState(() => {
    const show = sessionRenewedNotice
    sessionRenewedNotice = false
    return show
  })

  // A new session means a new client secret, which remounts the Payment Element
  const refreshPaymentSession = () =>
    initiatePaymentSession(cart, { provider_id: paymentProviderId })

  /**
   * A finished PaymentIntent may already hold the customer's money. Hand paid or
   * in-flight payments to the payment-return page (which completes the order)
   * instead of letting them pay again. Returns true when it redirected.
   */
  const resumeFinishedPayment = async () => {
    const clientSecret = cart.payment_collection?.payment_sessions?.find(
      (s) => s.provider_id === paymentProviderId && s.status === "pending"
    )?.data?.client_secret as string | undefined

    const stripe = await stripePromise
    if (!stripe || !clientSecret) {
      return false
    }

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)

    if (
      paymentIntent &&
      ["succeeded", "requires_capture", "processing"].includes(
        paymentIntent.status
      )
    ) {
      router.push({
        pathname: "/checkout/payment-return",
        query: {
          payment_intent: paymentIntent.id,
          payment_intent_client_secret: clientSecret,
        },
      })
      return true
    }

    return false
  }

  const reloadPaymentForm = async () => {
    setReloading(true)
    setError(null)
    try {
      await refreshPaymentSession()
      setLoadFailed(false)
    } catch {
      setError(t("paymentFormError"))
    } finally {
      setReloading(false)
    }
  }

  // `fields` can't change after the element is created, so remount if the
  // availability of a billing phone number changes.
  const hasPhone = !!cart.billing_address?.phone
  const options = useMemo(
    () => getPaymentElementOptions(cart),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasPhone]
  )

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady && loadFailed ? (
          <div
            className="my-4 flex flex-col items-start gap-y-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle p-4"
            role="alert"
            data-testid="payment-form-unavailable"
          >
            <div className="flex gap-x-3">
              <ExclamationCircleSolid
                className="mt-0.5 shrink-0 text-ui-tag-orange-icon"
                aria-hidden="true"
              />
              <div>
                <Text className="txt-medium-plus text-ui-fg-base">
                  {t("formUnavailable.title")}
                </Text>
                <Text className="txt-small text-ui-fg-subtle">
                  {t("formUnavailable.body")}
                </Text>
              </div>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={reloadPaymentForm}
              isLoading={reloading}
              data-testid="reload-payment-form-button"
            >
              {t("formUnavailable.reload")}
            </Button>
          </div>
        ) : stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            {renewed && (
              <Text
                className="txt-small mb-3 rounded-lg bg-ui-tag-orange-bg px-3 py-2 text-ui-tag-orange-text"
                role="status"
                data-testid="payment-session-renewed"
              >
                {t("sessionRenewed")}
              </Text>
            )}
            <Text className="txt-medium-plus text-ui-fg-base mb-2">
              {t("enterPaymentDetails")}
            </Text>
            <PaymentElement
              key={hasPhone ? "with-phone" : "no-phone"}
              options={options}
              onChange={(e) => {
                setPaymentType(e.value?.type ?? null)
                setPaymentComplete(e.complete)
                setError(null)
              }}
              onLoadError={async (e) => {
                // Stripe's own message is technical ("client_secret does not
                // match..."), never show it to the customer.
                if (isTerminalIntentError(e.error)) {
                  const resumed = await resumeFinishedPayment().catch(
                    () => false
                  )
                  if (resumed) {
                    return
                  }
                }

                const canAutoRefresh =
                  (isStaleSessionError(e.error) ||
                    isTerminalIntentError(e.error)) &&
                  Date.now() - lastAutoRefreshAt > AUTO_REFRESH_COOLDOWN_MS

                if (canAutoRefresh) {
                  lastAutoRefreshAt = Date.now()
                  try {
                    await refreshPaymentSession()
                    return
                  } catch {
                    // Fall through to the manual reload notice
                  }
                }

                setLoadFailed(true)
              }}
            />
          </div>
        ) : (
          <SkeletonCardDetails />
        ))}
    </PaymentContainer>
  )
}
