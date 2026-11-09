"use client"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { useLocale } from "next-intl"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  currencyCode,
}: LineItemPriceProps) => {
  const locale = useLocale()
  const originalPrice = item.original_total ?? 0

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        <span
          className="text-base-regular"
          data-testid="product-price"
        >
          {convertToLocale({
            locale,
            amount: originalPrice,
            currency_code: currencyCode,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
