"use client"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { useLocale } from "next-intl"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  currencyCode,
}: LineItemUnitPriceProps) => {
  const locale = useLocale()
  const originalTotal = item.original_total ?? 0

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      <span
        className="text-base-regular"
        data-testid="product-unit-price"
      >
        {convertToLocale({
          locale,
          amount: originalTotal / item.quantity,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
