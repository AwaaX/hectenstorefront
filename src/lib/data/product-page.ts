import "server-only"

import { cache } from "react"
import { getRegion } from "@lib/data/regions"
import { getProductTranslations, listProducts } from "@lib/data/products"
import { PRODUCT_PAGE_FIELDS } from "@lib/data/product-fields"

/**
 * The product page's single product request. `cache` shares the result between
 * generateMetadata, the JSON-LD and the page render, so a visit costs one request.
 */
export const getProductPageData = cache(
  async (countryCode: string, handle: string) => {
    const region = await getRegion(countryCode)

    if (!region) {
      return null
    }

    const product = await listProducts({
      countryCode,
      queryParams: { handle, fields: PRODUCT_PAGE_FIELDS },
    }).then(({ response }) => response.products[0])

    return product ? { region, product } : null
  }
)

export const getCachedProductTranslations = cache(getProductTranslations)
