"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { getDefaultProductVariant } from "@lib/util/product"
import { clx } from "@medusajs/ui"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"
import type { KeyboardEvent, MouseEvent } from "react"
import type { ProductGridCardData } from "./product-previews/types"

export type { ProductGridCardData } from "./product-previews/types"

type WishlistButtonProps = {
  className: string
  iconSize: number
  product: ProductGridCardData
  tooltipClassName: string
  /** Variant to toggle instead of the product's default variant */
  variantId?: string
}

const WishlistButton = ({
  className,
  iconSize,
  product,
  tooltipClassName,
  variantId: variantIdOverride,
}: WishlistButtonProps) => {
  const t = useTranslations("Wishlist.Toggle")
  const { isInWishlist, isPending, toggleWishlist } = useWishlist()

  const variantId = variantIdOverride ?? getDefaultProductVariant(product)?.id
  const isSaved = isInWishlist(variantId)
  const isLoading = isPending(variantId)

  const label = isSaved ? t("remove") : t("add")

  const handleAction = async () => {
    if (!variantId || isLoading) {
      return
    }

    await toggleWishlist(variantId, product.id)
  }

  const handleClick = async (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    await handleAction()
  }

  const handleKeyDown = async (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    await handleAction()
  }

  return (
    <div
      aria-label={label}
      aria-pressed={isSaved}
      className={clx(className, {
        active: isSaved,
        "cursor-progress opacity-70": isLoading,
        "cursor-not-allowed opacity-60": !variantId,
      })}
      data-testid="swh-product-wishlist-toggle"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={tooltipClassName}>{label}</div>
      <Icon.StarIcon
        className={clx({
          "text-white": isSaved,
        })}
        size={iconSize}
        weight={isSaved ? "fill" : "regular"}
      />
    </div>
  )
}

export default WishlistButton
