"use client"

import {
  buildLineItemAnalyticsItem,
  getAnalyticsValue,
  trackEcommerceEvent,
} from "@lib/analytics"
import { Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Spinner } from "@medusajs/icons"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [isRefreshing, startRefreshTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("Cart.Dropdown")
  const router = useRouter()

  // Keep the current cart page quantity limit behavior.
  const maxQuantity = 10
  const isUpdatingQuantity = updating || isRefreshing

  const changeQuantity = async (quantity: number) => {
    const quantityDelta = quantity - item.quantity

    if (
      quantityDelta === 0 ||
      quantity < 1 ||
      isUpdatingQuantity
    ) {
      return
    }

    setError(null)
    setUpdating(true)

    try {
      await updateLineItem({
        lineId: item.id,
        quantity,
      })
      startRefreshTransition(() => {
        router.refresh()
      })

      const analyticsItem = buildLineItemAnalyticsItem({
        item,
        quantity: Math.abs(quantityDelta),
      })

      trackEcommerceEvent(
        quantityDelta > 0 ? "add_to_cart" : "remove_from_cart",
        {
          currency: currencyCode?.toUpperCase(),
          value: getAnalyticsValue([analyticsItem]),
          items: [analyticsItem],
        }
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const href = {
    pathname: "/products/[handle]" as const,
    params: { handle: item.product_handle ?? "" },
  }

  return (
    <li className="flex gap-x-4 py-5" data-testid="product-row">
      <LocalizedClientLink
        href={href}
        className={clx("block shrink-0", {
          "w-16": type === "preview",
          "w-20 small:w-24": type === "full",
        })}
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
          className="rounded-lg p-0"
        />
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-1 flex-col gap-y-3">
        <div className="flex items-start justify-between gap-x-4">
          <div className="min-w-0">
            <LocalizedClientLink href={href}>
              <Text
                className="txt-medium-plus line-clamp-2 text-ui-fg-base"
                data-testid="product-title"
              >
                {item.product_title}
              </Text>
            </LocalizedClientLink>
            <LineItemOptions
              variant={item.variant}
              data-testid="product-variant"
            />
          </div>

          <div className="flex shrink-0 flex-col items-end text-right">
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
            {(type === "preview" || item.quantity > 1) && (
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
        </div>

        {type === "full" && (
          <div>
            <div className="flex items-center justify-between gap-x-3">
              <div className="flex items-center gap-x-3">
                <div
                  className="flex h-10 items-center rounded-xl border border-ui-border-strong"
                  data-testid="product-select-button"
                >
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl transition-colors hover:bg-ui-bg-subtle disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    onClick={() => changeQuantity(item.quantity - 1)}
                    disabled={isUpdatingQuantity || item.quantity <= 1}
                    aria-label={t("decreaseQuantity")}
                  >
                    <Icon.MinusIcon size={16} />
                  </button>
                  <span
                    className="min-w-8 text-center text-[15px] font-medium"
                    data-testid="cart-item-quantity"
                    data-value={item.quantity}
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl transition-colors hover:bg-ui-bg-subtle disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    onClick={() => changeQuantity(item.quantity + 1)}
                    disabled={isUpdatingQuantity}
                    aria-label={t("increaseQuantity")}
                  >
                    <Icon.PlusIcon size={16} />
                  </button>
                </div>
                {isUpdatingQuantity && <Spinner className="animate-spin" />}
              </div>

              <DeleteButton
                id={item.id}
                item={item}
                currencyCode={currencyCode}
                data-testid="product-delete-button"
              />
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </div>
        )}
      </div>
    </li>
  )
}

export default Item
