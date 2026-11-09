"use client"

import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DynamicImage from "@modules/common/components/swh/utilities/DynamicImage"
import { useSearchModal } from "@modules/search/context/search-modal-context"
import { useLocale } from "next-intl"
import { normalizeLocaleToApi } from "@lib/util/locale"

export type ProductHit = {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  variants: HttpTypes.StoreProductVariant[]
  collection_handle: string | null
  collection_id: string | null
  locales:{ [key: string]: { title: string; handle: string } }
}

type HitProps = {
  hit: ProductHit
}

const Hit = ({ hit }: HitProps) => {
  const { close } = useSearchModal()
  const locale=useLocale()
  const normalizedLocale = normalizeLocaleToApi(locale)



  return (
    <LocalizedClientLink
      href={{ pathname: "/products/[handle]", params: { handle: locale === "en-gb" ? hit.handle : hit.locales[normalizedLocale]?.handle || hit.handle } }}
      className="group"
      data-testid="search-result"
      onClick={close}
    >
      <div className="flex flex-col gap-3 h-full">
         {hit.thumbnail && (
            <DynamicImage
              url={hit.thumbnail}
              alt={hit.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          )}

        {/* Product Title */}
        <div className="flex flex-col gap-2 flex-1">
          <h3
            className="text-sm md:text-base font-medium text-gray-900 group-hover:text-black transition-colors line-clamp-2"
            data-testid="search-result-title"
          >
            {locale === "en-gb" ? hit.title : hit.locales[normalizedLocale]?.title || hit.title}
          </h3>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

export default Hit
