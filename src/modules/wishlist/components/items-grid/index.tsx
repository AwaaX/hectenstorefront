"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { useRouter } from "@i18n/navigation"
import { WishlistDisplayItem } from "@lib/data/wishlist"
import { Heart, Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ProductGridCard } from "@modules/common/components/swh/product-previews"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

type WishlistItemsGridProps = {
  emptyMessage: string
  interactive?: boolean
  items: WishlistDisplayItem[]
}

/**
 * The grid renders server data, but removals go through the wishlist context
 * (the remove button or the card's star). Hide an item as soon as the context
 * drops it, then refresh so the server list and page header catch up without
 * a manual reload.
 */
const useRemovedItemIds = (
  items: WishlistDisplayItem[],
  enabled: boolean
) => {
  const router = useRouter()
  const { isInWishlist } = useWishlist()
  const savedIdsRef = useRef<Set<string>>(new Set())
  const [removedIds, setRemovedIds] = useState<Set<string>>(() => new Set())

  const savedKey = items
    .filter((item) => isInWishlist(item.variantId))
    .map((item) => item.itemId)
    .join(",")

  useEffect(() => {
    if (!enabled) {
      return
    }

    const savedIds = new Set(savedKey ? savedKey.split(",") : [])
    // Only items that were saved and no longer are count as removed. Guest
    // wishlist state loads after mount, so "never saved yet" must not hide items.
    const droppedIds = Array.from(savedIdsRef.current).filter(
      (id) => !savedIds.has(id)
    )

    savedIdsRef.current = savedIds

    if (!droppedIds.length) {
      return
    }

    setRemovedIds((current) => new Set([...Array.from(current), ...droppedIds]))
    router.refresh()
  }, [enabled, router, savedKey])

  return removedIds
}

export default function WishlistItemsGrid({
  emptyMessage,
  interactive = false,
  items,
}: WishlistItemsGridProps) {
  const t = useTranslations("Wishlist.ItemsGrid")
  const removedIds = useRemovedItemIds(items, interactive)
  const visibleItems = items.filter((item) => !removedIds.has(item.itemId))

  if (!visibleItems.length) {
    return (
      <div
        className="flex flex-col items-center gap-y-4 rounded-xl border border-dashed border-line px-6 py-14 text-center"
        data-testid="wishlist-empty-state"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-secondary">
          <Heart />
        </span>
        <div className="flex flex-col gap-y-1.5">
          <p className="text-lg font-semibold text-black">{t("emptyTitle")}</p>
          <p className="max-w-sm text-[15px] text-secondary">{emptyMessage}</p>
        </div>
        <LocalizedClientLink
          href="/"
          className="inline-flex h-11 items-center bg-[#ef7a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#e2683a]"
        >
          {t("startShopping")}
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <p
        className="text-sm font-medium text-secondary"
        aria-live="polite"
        data-testid="wishlist-items-count"
      >
        {t("count", { count: visibleItems.length })}
      </p>
      <ul
        className="grid grid-cols-1 gap-4 xsmall:grid-cols-2 small:grid-cols-3 small:gap-6"
        data-testid="wishlist-items-grid"
      >
        {visibleItems.map((item) => (
          <WishlistItemCard
            key={item.itemId}
            interactive={interactive}
            item={item}
          />
        ))}
      </ul>
    </div>
  )
}

const WishlistItemCard = ({
  interactive,
  item,
}: {
  interactive: boolean
  item: WishlistDisplayItem
}) => {
  const t = useTranslations("Wishlist.ItemsGrid")
  const { isPending, removeFromWishlist } = useWishlist()

  const isRemoving = isPending(item.variantId)
  const variantTitle =
    item.variantTitle && item.variantTitle !== "Default Variant"
      ? item.variantTitle
      : null

  const handleRemove = () => {
    if (!item.variantId || isRemoving) {
      return
    }

    removeFromWishlist(item.variantId, item.productId ?? undefined)
  }

  return (
    <li
      className={clx(
        "flex flex-col rounded-xl border border-line bg-white p-3 transition-[box-shadow,opacity] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] small:p-4",
        { "opacity-60": isRemoving }
      )}
      aria-busy={isRemoving}
      data-testid="wishlist-item"
    >
      {item.product ? (
        <ProductGridCard
          data={item.product}
          type="grid"
          wishlistVariantId={item.variantId ?? undefined}
        />
      ) : (
        <div>
          <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-surface text-secondary2">
            <Heart />
          </div>
          <h3 className="product-name text-title mt-4 line-clamp-2">
            {item.productTitle}
          </h3>
          <p className="mt-1 text-sm text-secondary">{t("unavailable")}</p>
        </div>
      )}

      {variantTitle && (
        <p className="mt-1 text-sm text-secondary">
          {t("variant")}: <span className="text-black">{variantTitle}</span>
        </p>
      )}

      {interactive && item.variantId && (
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label={t("removeItem", { title: item.productTitle })}
            className="flex h-11 w-full items-center justify-center gap-x-2 rounded-lg border border-line text-sm font-medium text-secondary transition-colors hover:border-red hover:bg-red/5 hover:text-red disabled:cursor-progress disabled:hover:border-line disabled:hover:bg-transparent disabled:hover:text-secondary"
            data-testid="wishlist-item-remove-button"
          >
            {isRemoving ? <Spinner className="animate-spin" /> : <Trash />}
            <span>{t("remove")}</span>
          </button>
        </div>
      )}
    </li>
  )
}
