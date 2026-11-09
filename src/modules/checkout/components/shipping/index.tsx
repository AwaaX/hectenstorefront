"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { buildCartEcommercePayload, trackEcommerceEvent } from "@lib/analytics"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, clx, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter } from "@i18n/navigation"
import MedusaRadio from "@modules/common/components/radio"
import StepCard, { stepEditButtonClass } from "../step-card"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

// Selectable delivery option cards
const optionBase =
  "flex cursor-pointer items-center justify-between gap-x-4 rounded-xl border border-ui-border-base bg-white p-4 text-small-regular transition-all hover:border-ui-border-strong hover:shadow-sm"
const optionSelected = "!border-ui-fg-base ring-1 ring-ui-fg-base"
const optionDisabled =
  "cursor-not-allowed opacity-50 hover:!border-ui-border-base hover:shadow-none"

const PICKUP_OPTION_ON = "__PICKUP_ON"
const PICKUP_OPTION_OFF = "__PICKUP_OFF"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: ShippingOptionWithDetails[] | null
}

type ShippingOptionWithDetails = HttpTypes.StoreCartShippingOption & {
  service_zone?: {
    fulfillment_set?: {
      type?: string | null
      location?: {
        address?: HttpTypes.StoreCartAddress | null
      } | null
    } | null
  } | null
}

function formatAddress(address?: HttpTypes.StoreCartAddress | null) {
  if (!address) {
    return ""
  }

  let ret = ""

  if (address.address_1) {
    ret += ` ${address.address_1}`
  }

  if (address.address_2) {
    ret += `, ${address.address_2}`
  }

  if (address.postal_code) {
    ret += `, ${address.postal_code} ${address.city}`
  }

  if (address.country_code) {
    ret += `, ${address.country_code.toUpperCase()}`
  }

  return ret
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const t = useTranslations("Checkout.Shipping")
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  const [showPickupOptions, setShowPickupOptions] =
    useState<string>(PICKUP_OPTION_OFF)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "delivery"

  const _shippingMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
  )

  const _pickupMethods = availableShippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type === "pickup"
  )

  const hasPickupOptions = !!_pickupMethods?.length
  const allShippingMethods = [
    ...(_shippingMethods ?? []),
    ...(_pickupMethods ?? []),
  ]

  useEffect(() => {
    setIsLoadingPrices(true)

    if (_shippingMethods?.length) {
      const promises = _shippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      }
    }

    if (_pickupMethods?.find((m) => m.id === shippingMethodId)) {
      setShowPickupOptions(PICKUP_OPTION_ON)
    }
  }, [availableShippingMethods])

  const handleEdit = () => {
    router.push(
      { pathname: "/checkout", query: { step: "delivery" } },
      { scroll: false }
    )
  }

  const handleSubmit = () => {
    const selectedShippingMethod = allShippingMethods.find(
      (method) => method.id === shippingMethodId
    )
    const selectedShippingAmount =
      selectedShippingMethod?.price_type === "calculated"
        ? calculatedPricesMap[selectedShippingMethod.id]
        : selectedShippingMethod?.amount

    trackEcommerceEvent(
      "add_shipping_info",
      buildCartEcommercePayload(cart, {
        shipping: selectedShippingAmount,
        shipping_tier: selectedShippingMethod?.name,
      })
    )

    router.push(
      { pathname: "/checkout", query: { step: "payment" } },
      { scroll: false }
    )
  }

  const handleSetShippingMethod = async (
    id: string,
    variant: "shipping" | "pickup"
  ) => {
    setError(null)

    if (variant === "pickup") {
      setShowPickupOptions(PICKUP_OPTION_ON)
    } else {
      setShowPickupOptions(PICKUP_OPTION_OFF)
    }

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setShippingMethodId(currentId)

        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <StepCard
      number={2}
      title={t("delivery")}
      isOpen={isOpen}
      isComplete={!isOpen && hasShippingMethod}
      isDisabled={!isOpen && !hasShippingMethod}
      showBody={isOpen || hasShippingMethod}
      action={
        !isOpen &&
        cart?.shipping_address &&
        cart?.billing_address &&
        cart?.email && (
          <button
            onClick={handleEdit}
            className={stepEditButtonClass}
            data-testid="edit-delivery-button"
          >
            {t("edit")}
          </button>
        )
      }
    >
      {isOpen ? (
        <>
          <div className="grid">
            <div className="flex flex-col">
              <span className="font-medium txt-medium text-ui-fg-base">
                {t("shippingMethod")}
              </span>
              <span className="mb-4 text-ui-fg-muted txt-medium">
                {t("deliveryPrompt")}
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-4">
                {hasPickupOptions && (
                  <RadioGroup
                    className="mb-3"
                    value={showPickupOptions}
                    onChange={(value) => {
                      const id = _pickupMethods.find(
                        (option) => !option.insufficient_inventory
                      )?.id

                      if (id) {
                        handleSetShippingMethod(id, "pickup")
                      }
                    }}
                  >
                    <Radio
                      value={PICKUP_OPTION_ON}
                      data-testid="delivery-option-radio"
                      className={clx(
                        optionBase,
                        {
                          [optionSelected]:
                            showPickupOptions === PICKUP_OPTION_ON,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <MedusaRadio
                          checked={showPickupOptions === PICKUP_OPTION_ON}
                        />
                        <span className="text-base-regular">
                          {t("pickupOrder")}
                        </span>
                      </div>
                      <span className="justify-self-end text-ui-fg-base">
                        -
                      </span>
                    </Radio>
                  </RadioGroup>
                )}
                <RadioGroup
                  className="grid gap-3 xsmall:grid-cols-2"
                  value={shippingMethodId}
                  onChange={(v) => {
                    if (v) {
                      return handleSetShippingMethod(v, "shipping")
                    }
                  }}
                >
                  {_shippingMethods?.map((option) => {
                    const isDisabled =
                      option.price_type === "calculated" &&
                      !isLoadingPrices &&
                      typeof calculatedPricesMap[option.id] !== "number"

                    return (
                      <Radio
                        key={option.id}
                        value={option.id}
                        data-testid="delivery-option-radio"
                        disabled={isDisabled}
                        className={clx(
                          optionBase,
                          {
                            [optionSelected]:
                              option.id === shippingMethodId,
                            [optionDisabled]:
                              isDisabled,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                          <MedusaRadio
                            checked={option.id === shippingMethodId}
                          />
                          <span className="text-base-regular">
                            {option.name}
                          </span>
                        </div>
                        <span className="justify-self-end text-ui-fg-base">
                          {option.price_type === "flat" ? (
                            convertToLocale({
                              locale,
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })
                          ) : calculatedPricesMap[option.id] ? (
                            convertToLocale({
                              locale,
                              amount: calculatedPricesMap[option.id],
                              currency_code: cart?.currency_code,
                            })
                          ) : isLoadingPrices ? (
                            <Loader />
                          ) : (
                            "-"
                          )}
                        </span>
                      </Radio>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          {showPickupOptions === PICKUP_OPTION_ON && (
            <div className="grid">
              <div className="flex flex-col">
                <span className="font-medium txt-medium text-ui-fg-base">
                  {t("store")}
                </span>
                <span className="mb-4 text-ui-fg-muted txt-medium">
                  {t("storePrompt")}
                </span>
              </div>
              <div data-testid="delivery-options-container">
                <div className="pb-4">
                  <RadioGroup
                    className="grid gap-3 xsmall:grid-cols-2"
                    value={shippingMethodId}
                    onChange={(v) => {
                      if (v) {
                        return handleSetShippingMethod(v, "pickup")
                      }
                    }}
                  >
                    {_pickupMethods?.map((option) => {
                      return (
                        <Radio
                          key={option.id}
                          value={option.id}
                          disabled={option.insufficient_inventory}
                          data-testid="delivery-option-radio"
                          className={clx(
                            optionBase,
                            {
                              [optionSelected]:
                                option.id === shippingMethodId,
                              [optionDisabled]:
                                option.insufficient_inventory,
                            }
                          )}
                        >
                          <div className="flex items-start gap-x-4">
                            <MedusaRadio
                              checked={option.id === shippingMethodId}
                            />
                            <div className="flex flex-col">
                              <span className="text-base-regular">
                                {option.name}
                              </span>
                              <span className="text-base-regular text-ui-fg-muted">
                                {formatAddress(
                                  option.service_zone?.fulfillment_set?.location
                                    ?.address
                                )}
                              </span>
                            </div>
                          </div>
                          <span className="justify-self-end text-ui-fg-base">
                            {convertToLocale({
                              locale,
                              amount: option.amount!,
                              currency_code: cart?.currency_code,
                            })}
                          </span>
                        </Radio>
                      )
                    })}
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="large"
              className="mt-2 w-full"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!shippingMethodId}
              data-testid="submit-delivery-option-button"
            >
              {t("continueToPayment")}
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col">
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ui-fg-muted">
                  {t("method")}
                </Text>
                <Text className="txt-medium text-ui-fg-base">
                  {cart.shipping_methods!.at(-1)!.name}{" "}
                  {convertToLocale({
                    locale,
                    amount: cart.shipping_methods!.at(-1)!.amount!,
                    currency_code: cart?.currency_code,
                  })}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </StepCard>
  )
}

export default Shipping
