"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { useRouter } from "@i18n/navigation"
import { HttpTypes } from "@medusajs/types"
import { Text, useToggleState } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import { useSearchParams } from "next/navigation"
import { useActionState } from "react"
import { useTranslations } from "next-intl"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import StepCard, { stepEditButtonClass } from "../step-card"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const t = useTranslations("Checkout.Addresses")
  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push({ pathname: "/checkout", query: { step: "address" } })
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const addressLines = (address?: HttpTypes.StoreCartAddress | null) => (
    <>
      <Text className="txt-medium text-ui-fg-base">
        {address?.first_name} {address?.last_name}
      </Text>
      <Text className="txt-medium text-ui-fg-subtle">
        {address?.address_1} {address?.address_2}
      </Text>
      <Text className="txt-medium text-ui-fg-subtle">
        {address?.postal_code}, {address?.city}
      </Text>
      <Text className="txt-medium text-ui-fg-subtle">
        {address?.country_code?.toUpperCase()}
      </Text>
    </>
  )

  const summaryLabel =
    "mb-1.5 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted"

  return (
    <StepCard
      number={1}
      title={t("shippingAddress")}
      isOpen={isOpen}
      isComplete={!isOpen}
      action={
        !isOpen &&
        cart?.shipping_address && (
          <button
            onClick={handleEdit}
            className={stepEditButtonClass}
            data-testid="edit-address-button"
          >
            {t("edit")}
          </button>
        )
      }
    >
      {isOpen ? (
        <form action={formAction}>
          <ShippingAddress
            customer={customer}
            checked={sameAsBilling}
            onChange={toggleSameAsBilling}
            cart={cart}
          />

          {!sameAsBilling && (
            <div className="mt-2 border-t border-ui-border-base pt-6">
              <h3 className="mb-5 text-base-semi text-ui-fg-base">
                {t("billingAddress")}
              </h3>

              <BillingAddress cart={cart} />
            </div>
          )}
          <SubmitButton
            className="mt-6 w-full"
            data-testid="submit-address-button"
          >
            {t("continueToDelivery")}
          </SubmitButton>
          <ErrorMessage error={message} data-testid="address-error-message" />
        </form>
      ) : (
        <div className="text-small-regular">
          {cart && cart.shipping_address ? (
            <div className="grid gap-5 small:grid-cols-3">
              <div data-testid="shipping-address-summary">
                <Text className={summaryLabel}>{t("shippingAddress")}</Text>
                {addressLines(cart.shipping_address)}
              </div>

              <div data-testid="shipping-contact-summary">
                <Text className={summaryLabel}>{t("contact")}</Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {cart.shipping_address.phone}
                </Text>
                <Text className="txt-medium text-ui-fg-subtle break-all">
                  {cart.email}
                </Text>
              </div>

              <div data-testid="billing-address-summary">
                <Text className={summaryLabel}>{t("billingAddress")}</Text>

                {sameAsBilling ? (
                  <Text className="txt-medium text-ui-fg-subtle">
                    {t("billingSameAsDelivery")}
                  </Text>
                ) : (
                  addressLines(cart.billing_address)
                )}
              </div>
            </div>
          ) : (
            <div>
              <Spinner />
            </div>
          )}
        </div>
      )}
    </StepCard>
  )
}

export default Addresses
