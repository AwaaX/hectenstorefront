"use client"

import { convertToLocale } from "@lib/util/money"
import { setShippingMethod } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import React, { useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

type CartTotalsProps = {
  totals: {
    id?: string
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    item_total?: number | null
    original_item_total?: number | null
    shipping_subtotal?: number | null
    shipping_total?: number | null
    original_shipping_total?: number | null
    discount_total?: number | null
    discount_subtotal?: number | null
    shipping_methods?: Array<{ id?: string | null; shipping_option_id?: string | null }> | null
    region?: {
      countries?: Array<{ display_name?: string | null }> | null
    } | null
  }
  shippingOptions?: HttpTypes.StoreCartShippingOption[]
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, shippingOptions = [] }) => {
  const t = useTranslations("Cart.Totals")
  const locale = useLocale()
  const router = useRouter()
  const [isRefreshing, startRefreshTransition] = useTransition()
  const [isSettingShipping, setIsSettingShipping] = useState(false)
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | null>(
    totals.shipping_methods?.at(-1)?.shipping_option_id ?? null
  )

  const {
    currency_code,
    total,
    tax_total,
    original_item_total,
    item_subtotal,
    discount_total,
    shipping_total,
    original_shipping_total,
    shipping_methods,
  } = totals
  const hasShippingMethod = (shipping_methods?.length ?? 0) > 0

  React.useEffect(() => {
    const currentMethodId = totals.shipping_methods?.at(-1)?.shipping_option_id ?? null
    setSelectedShippingOption(currentMethodId)
  }, [totals.shipping_methods])

  const handleShippingChange = async (optionId: string) => {
    if (!totals.id || isSettingShipping) return
    setSelectedShippingOption(optionId)
    setIsSettingShipping(true)
    try {
      await setShippingMethod({ cartId: totals.id, shippingMethodId: optionId })
      startRefreshTransition(() => {
        router.refresh()
      })
    } finally {
      setIsSettingShipping(false)
    }
  }


  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span>{t("subtotal")}</span>
          <span data-testid="cart-subtotal" data-value={original_item_total ?? item_subtotal ?? 0}>
            {convertToLocale({ amount: original_item_total ?? item_subtotal ?? 0, currency_code, locale })}
          </span>
        </div>

        {/* Discount */}
        {!!discount_total && (
          <div className="flex items-center justify-between">
            <span>{t("discount")}</span>
            <span
              className="text-ui-fg-interactive"
              data-testid="cart-discount"
              data-value={discount_total || 0}
            >
              -{" "}
              {convertToLocale({
                locale,
                amount: discount_total ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}

        {/* Shipping options */}
        {shippingOptions.length > 0 ? (
          <div className="flex items-start justify-between">
            <span className="shrink-0 pt-0.5">{t("shipping")}</span>
            <div className="flex flex-col gap-1 items-end">
              {shippingOptions.map((option) => {
                const price = option.amount ?? option.calculated_price?.calculated_amount ?? 0
                const isFree = price === 0
                return (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="cart-page-shipping-option"
                      value={option.id}
                      checked={selectedShippingOption === option.id}
                      onChange={() => handleShippingChange(option.id)}
                      disabled={isSettingShipping || isRefreshing}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[14px]">
                      {option.name}:{" "}
                      <span className="text-[15px] font-semibold">
                        {isFree
                          ? t("free")
                          : convertToLocale({
                              locale,
                              amount: price,
                              currency_code,
                            })}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span>{t("shipping")}</span>
            <span
              data-testid="cart-shipping"
              data-value={hasShippingMethod ? original_shipping_total ?? shipping_total ?? 0 : ""}
            >
              {hasShippingMethod
                ? convertToLocale({
                    locale,
                    amount: original_shipping_total ?? shipping_total ?? 0,
                    currency_code,
                  })
                : t("calculatedAtCheckout")}
            </span>
          </div>
        )}
      </div>

      <div className="h-px w-full border-b border-gray-200 my-4" />

      {/* Total with inline VAT */}
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium">
        <span>{t("total")}</span>
        <div className="flex flex-wrap items-baseline gap-x-1 justify-end">
          <span
            className="txt-xlarge-plus"
            data-testid="cart-total"
            data-value={total || 0}
          >
            {convertToLocale({ amount: total ?? 0, currency_code, locale })}
          </span>
          {(tax_total ?? 0) > 0 && (
            <span className="text-[12px] font-normal text-ui-fg-subtle">
              ({t("includes")} <span className="text-[13px] font-semibold text-ui-fg-base">{convertToLocale({
                  locale,
                  amount: tax_total ?? 0,
                  currency_code,
                })}</span> {t("vat")}
              {/* {totals.region?.countries?.[0]?.display_name && (
                <> {t("estimatedFor")} {totals.region.countries[0].display_name}</>
              )} */}
              )
            </span>
          )}
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
