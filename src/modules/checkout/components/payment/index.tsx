"use client"

import { RadioGroup } from "@headlessui/react"
import { buildCartEcommercePayload, trackEcommerceEvent } from "@lib/analytics"
import { isPaypal, isStripeLike, paymentInfoMap } from "@lib/constants"
import { PAYPAL_CLIENT_ID, getPaypalSessionData } from "@lib/util/paypal"
import { getStripeMethodLabel } from "@lib/util/stripe"
import { initiatePaymentSession } from "@lib/data/cart"
import { CreditCard } from "@medusajs/icons"
import { Button, Container, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripePaymentContainer,
  renewCancelledPaymentSession,
} from "@modules/checkout/components/payment-container"
import { useRouter } from "@i18n/navigation"
import StepCard, { stepEditButtonClass } from "../step-card"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const t = useTranslations("Checkout.Payment")
  const tm = useTranslations("Checkout.PaymentMethods")
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "payment"

  // PayPal is hidden when the storefront has no PayPal client id configured
  const visiblePaymentMethods = (availablePaymentMethods ?? []).filter(
    (method) => !isPaypal(method.id) || !!PAYPAL_CLIENT_ID
  )

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeLike(method) || isPaypal(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method,
        ...(isPaypal(method) ? { data: getPaypalSessionData(cart) } : {}),
      })
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const handleEdit = () => {
    router.push(
      { pathname: "/checkout", query: { step: "payment" } },
      { scroll: false }
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const shouldInputCard =
        isStripeLike(selectedPaymentMethod) && !activeSession

      const checkActiveSession =
        activeSession?.provider_id === selectedPaymentMethod

      // A PayPal order holds the amount and shipping address, so it is rebuilt
      // from the current cart every time the customer continues.
      const refreshPaypalOrder = isPaypal(selectedPaymentMethod)

      // The form may still show a PaymentIntent that was cancelled meanwhile;
      // continuing with it would only fail at "Place order".
      if (
        checkActiveSession &&
        isStripeLike(selectedPaymentMethod) &&
        (await renewCancelledPaymentSession(cart, activeSession).catch(
          () => false
        ))
      ) {
        return
      }

      if (!checkActiveSession || refreshPaypalOrder) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
          ...(refreshPaypalOrder ? { data: getPaypalSessionData(cart) } : {}),
        })
      }

      if (!shouldInputCard) {
        const paymentType = paidByGiftcard
          ? "gift_card"
          : paymentInfoMap[selectedPaymentMethod]?.title ||
            selectedPaymentMethod

        trackEcommerceEvent(
          "add_payment_info",
          buildCartEcommercePayload(cart, {
            payment_type: paymentType,
          })
        )

        return router.push(
          { pathname: "/checkout", query: { step: "review" } },
          { scroll: false }
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <StepCard
      number={3}
      title={t("title")}
      isOpen={isOpen}
      isComplete={!isOpen && !!paymentReady}
      isDisabled={!isOpen && !paymentReady}
      showBody={
        isOpen || !!(cart && paymentReady && activeSession) || !!paidByGiftcard
      }
      action={
        !isOpen &&
        !!paymentReady && (
          <button
            onClick={handleEdit}
            className={stepEditButtonClass}
            data-testid="edit-payment-button"
          >
            {t("edit")}
          </button>
        )
      }
    >
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && visiblePaymentMethods.length > 0 && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
              >
                {visiblePaymentMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    {isStripeLike(paymentMethod.id) ? (
                      <StripePaymentContainer
                        cart={cart}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setPaymentType={setPaymentType}
                        setError={setError}
                        setPaymentComplete={setPaymentComplete}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      >
                        {isPaypal(paymentMethod.id) &&
                          selectedPaymentMethod === paymentMethod.id && (
                            <Text className="txt-small text-ui-fg-subtle">
                              {tm("paypalHint")}
                            </Text>
                          )}
                      </PaymentContainer>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
                {t("method")}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {t("giftCard")}
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            size="large"
            className="mt-6 w-full"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={
              (isStripeLike(selectedPaymentMethod) && !paymentComplete) ||
              (!selectedPaymentMethod && !paidByGiftcard)
            }
            data-testid="submit-payment-button"
          >
            {!activeSession && isStripeLike(selectedPaymentMethod)
              ? t("enterPaymentDetails")
              : t("continueToReview")}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="grid w-full gap-5 small:grid-cols-2">
              <div className="flex flex-col">
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
                  {t("method")}
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title
                    ? tm(paymentInfoMap[activeSession?.provider_id].title)
                    : activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col">
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
                  {t("details")}
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>
                    {isStripeLike(selectedPaymentMethod) && paymentType
                      ? getStripeMethodLabel(paymentType) ?? tm("creditCard")
                      : t("anotherStep")}
                  </Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
                {t("method")}
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                {t("giftCard")}
              </Text>
            </div>
          ) : null}
        </div>
      </div>
    </StepCard>
  )
}

export default Payment
