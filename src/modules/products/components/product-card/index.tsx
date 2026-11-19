"use client"

import { useState } from "react"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useWishlist } from "@lib/context/wishlist-context"
import { getProductPrice } from "@lib/util/get-product-price"
import { getDefaultProductVariant } from "@lib/util/product"
import { getColorSwatch } from "@lib/util/product-options"
import type { ProductRating } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const COLOR_OPTION_TITLES = ["color", "colour", "couleur"]

type Swatch = { label: string; image?: string; color: string | null }

/**
 * One swatch per value of the product's colour option, using the image of a
 * variant in that colour (its thumbnail, else its first image). A product
 * with a single colour falls back to its main image; otherwise colours
 * without an image show as a plain colour square.
 */
const getSwatches = (product: HttpTypes.StoreProduct): Swatch[] => {
  const option = product.options?.find((o) =>
    COLOR_OPTION_TITLES.includes(o.title?.trim().toLowerCase() ?? "")
  )
  const values = option?.values ?? []
  return values
    .map((value) => {
      const images = (product.variants ?? [])
        .filter((v) => v.options?.some((o) => o.value === value.value))
        .map((v) => v.thumbnail || v.images?.[0]?.url)
      return {
        label: value.value,
        image:
          images.find(Boolean) ||
          (values.length === 1 ? product.thumbnail ?? undefined : undefined),
        color: getColorSwatch(value.value),
      }
    })
    .filter((s) => s.image || s.color)
}

const WishlistToggle = ({
  product,
  variantId: variantIdOverride,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
}) => {
  const t = useTranslations("Wishlist.Toggle")
  const { isInWishlist, isPending, toggleWishlist } = useWishlist()
  const variantId = variantIdOverride ?? getDefaultProductVariant(product)?.id
  const saved = isInWishlist(variantId)
  const label = saved ? t("remove") : t("add")

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={saved}
      title={label}
      disabled={!variantId || isPending(variantId)}
      onClick={() => variantId && toggleWishlist(variantId, product.id)}
      className="absolute top-3 right-3 z-10 flex items-center justify-center w-[34px] h-[34px] rounded-full bg-white text-black hover:bg-black hover:text-white disabled:opacity-60 duration-300"
    >
      <Icon.HeartIcon size={18} weight={saved ? "fill" : "regular"} />
    </button>
  )
}

const Stars = ({ rating }: { rating: ProductRating }) => {
  const t = useTranslations("Product.Card")
  const rounded = Math.round(rating.average)
  return (
    <span className="flex shrink-0 items-center gap-x-[6px] text-[12px] leading-[18px] text-[#494949]">
      <span
        role="img"
        aria-label={t("rating", { rating: rating.average.toFixed(1) })}
        className="flex gap-x-[2px] text-[#ff9a3c]"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Icon.StarIcon
            key={i}
            size={13}
            weight={i < rounded ? "fill" : "regular"}
          />
        ))}
      </span>
      <span>({t("reviews", { count: rating.count })})</span>
    </span>
  )
}

/**
 * Hecten product card: product on a light grey tile (products are shot on
 * transparent backgrounds), one-line title, price, and a row of square
 * colour thumbnails. Hovering a colour previews it; clicking selects it.
 * Rows have fixed heights so cards (and loading skeletons) line up.
 */
export default function ProductCard({
  product,
  rating,
  wishlistVariantId,
}: {
  product: HttpTypes.StoreProduct
  /** Shown beside the price when the product has at least one review */
  rating?: ProductRating
  /** Variant the wishlist heart acts on; defaults to the default variant */
  wishlistVariantId?: string
}) {
  const t = useTranslations("Product.Card")
  const locale = useLocale()
  const { cheapestPrice } = getProductPrice({ product, locale })
  const swatches = getSwatches(product)
  const [selected, setSelected] = useState<Swatch | null>(null)
  const [hovered, setHovered] = useState<Swatch | null>(null)
  const image = (hovered ?? selected)?.image || product.thumbnail
  const href = {
    pathname: "/products/[handle]" as const,
    params: { handle: product.handle! },
  }

  return (
    <article className="relative font-[system-ui] text-[#222]">
      <LocalizedClientLink
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-[3/4] bg-[#f0f0f0]"
      >
        {image && (
          <Image
            src={image}
            alt={product.title ?? ""}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-[6%]"
          />
        )}
      </LocalizedClientLink>
      <WishlistToggle product={product} variantId={wishlistVariantId} />

      <h3 className="mt-4 truncate text-[16px] leading-[24px] font-medium">
        <LocalizedClientLink href={href} className="hover:underline">
          {product.title}
        </LocalizedClientLink>
      </h3>
      <div className="flex h-[24px] items-center justify-between gap-x-2">
        {cheapestPrice && (
          <p className="text-[15px] leading-[24px]">
            {cheapestPrice.price_type === "sale" && (
              <s className="mr-2 text-[#999]">{cheapestPrice.original_price}</s>
            )}
            {cheapestPrice.calculated_price}
          </p>
        )}
        {rating && <Stars rating={rating} />}
      </div>

      {/* Square colour thumbnails; the row clips rather than wraps */}
      <div className="mt-[14px] h-[50px] overflow-hidden">
        {swatches.length > 0 && (
          <ul
            aria-label={t("colors")}
            className="flex gap-[8px]"
            onMouseLeave={() => setHovered(null)}
          >
            {swatches.map((s) => {
              const active = selected?.label === s.label
              return (
                <li key={s.label} className="shrink-0">
                  <button
                    type="button"
                    title={s.label}
                    aria-label={s.label}
                    aria-pressed={active}
                    onMouseEnter={() => setHovered(s)}
                    onFocus={() => setHovered(s)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected(active ? null : s)}
                    className={`relative block w-[50px] h-[50px] overflow-hidden bg-[#f0f0f0] border ${
                      active ? "border-black" : "border-[#ccc] hover:border-[#888]"
                    } duration-200`}
                    style={s.image ? undefined : { backgroundColor: s.color! }}
                  >
                    {s.image && (
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="50px"
                        className="object-contain p-[3px]"
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </article>
  )
}
