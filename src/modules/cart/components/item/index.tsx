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
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
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
    <li
      className="flex items-center gap-x-4 py-4 font-[system-ui]"
      data-testid="product-row"
    >
      {type === "full" && (
        <DeleteButton
          id={item.id}
          item={item}
          currencyCode={currencyCode}
          className="shrink-0"
          data-testid="product-delete-button"
        />
      )}

      {/* Square thumbnail on a light grey tile */}
      <LocalizedClientLink
        href={href}
        className={clx("relative block shrink-0 bg-[#f0f0f0]", {
          "w-14 h-14": type === "preview",
          "w-[60px] h-[60px] small:w-[72px] small:h-[72px]": type === "full",
        })}
      >
        {item.thumbnail && (
          <Image
            src={item.thumbnail}
            alt={item.product_title ?? ""}
            fill
            sizes="72px"
            className="object-contain"
          />
        )}
      </LocalizedClientLink>

      <div className="flex min-w-0 flex-1 flex-col gap-y-3 small:flex-row small:items-center small:gap-x-6">
        {/* Title and variant on one line, e.g. "Bag - Black" */}
        <div className="min-w-0 flex-1">
          <LocalizedClientLink href={href} className="hover:underline">
            <Text
              as="span"
              className="text-[15px] leading-[22px] text-black"
              data-testid="product-title"
            >
              {item.product_title}
            </Text>
          </LocalizedClientLink>
          {item.variant?.title && (
            <span
              className="text-[15px] leading-[22px] text-black"
              data-testid="product-variant"
            >
              {" - "}
              {item.variant.title}
            </span>
          )}
          {type === "full" && (
            <ErrorMessage error={error} data-testid="product-error-message" />
          )}
        </div>

        {/* Phones: quantity and price share a row; desktop: own columns */}
        <div className="flex items-center justify-between gap-x-3 small:contents">
          {type === "full" && (
            <div className="flex items-center gap-x-2">
              <div
                className="flex h-[34px] items-center rounded-[6px] border border-[#ddd] bg-white"
                data-testid="product-select-button"
              >
                <button
                  type="button"
                  className="flex h-full w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => changeQuantity(item.quantity - 1)}
                  disabled={isUpdatingQuantity || item.quantity <= 1}
                  aria-label={t("decreaseQuantity")}
                >
                  <Icon.MinusIcon size={16} />
                </button>
                <span
                  className="min-w-6 text-center text-[15px]"
                  data-testid="cart-item-quantity"
                  data-value={item.quantity}
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="flex h-full w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => changeQuantity(item.quantity + 1)}
                  disabled={isUpdatingQuantity}
                  aria-label={t("increaseQuantity")}
                >
                  <Icon.PlusIcon size={16} />
                </button>
              </div>
              {isUpdatingQuantity && <Spinner className="animate-spin" />}
            </div>
          )}

          <div className="flex flex-col items-end text-right small:w-[120px] [&_*]:!text-[15px] [&_.text-ui-fg-subtle]:!text-[#494949]">
            <LineItemPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
            {(type === "preview" || item.quantity > 1) && (
              <span className="flex items-center gap-x-1 !text-[13px] text-[#999]">
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
      </div>
    </li>
  )
}

export default Item
