"use client"

import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type SummaryItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}

/** One line of the checkout order summary: image with quantity badge, title, price. */
const SummaryItem = ({ item, currencyCode }: SummaryItemProps) => {
  const href = {
    pathname: "/products/[handle]" as const,
    params: { handle: item.product_handle ?? "" },
  }

  return (
    <li className="flex gap-x-4 py-4" data-testid="product-row">
      <div className="relative w-16 shrink-0 small:w-[72px]">
        <LocalizedClientLink href={href} className="block">
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="rounded-lg p-0"
          />
        </LocalizedClientLink>
        <span
          className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ui-fg-base px-1 text-[11px] font-semibold leading-none text-white"
          data-testid="cart-item-quantity"
          data-value={item.quantity}
        >
          {item.quantity}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <LocalizedClientLink href={href}>
          <Text
            className="txt-medium-plus line-clamp-2 text-ui-fg-base"
            data-testid="product-title"
          >
            {item.product_title}
          </Text>
        </LocalizedClientLink>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </div>

      <div className="flex shrink-0 flex-col items-end text-right">
        <LineItemPrice item={item} style="tight" currencyCode={currencyCode} />
        {item.quantity > 1 && (
          <span className="flex items-center gap-x-1 text-small-regular text-ui-fg-muted">
            {item.quantity} ×{" "}
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
        )}
      </div>
    </li>
  )
}

export default SummaryItem
