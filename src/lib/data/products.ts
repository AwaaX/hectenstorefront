"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"
import { getLocale } from "./locale-actions"
import { StoreProductReview } from "types/global"
import { extractCountryCode } from "@lib/util/locale"
import {
  resolveLocalizedHandle,
  type CustomTranslation,
} from "@lib/util/localized-handle"
import { TRANSLATION_LOOKUP_FIELDS } from "./product-fields"

export const getTotalProductCount = async (): Promise<number> => {
  return sdk.store.product.list({ limit: 1 }).then(({ count }) => count)
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductListParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const locale = await getLocale()

  const customTranslationFields = locale
    ? `*custom_translation.${locale}`
    : "*custom_translation"

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            `*variants.calculated_price,+variants.inventory_quantity,${customTranslationFields}`,
          ...queryParams,
        },
        headers,
        next:{
          revalidate: 60
        },
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * Fetches sorted products for a specific page using proper offset-based pagination.
 * Only fetches the products needed for the requested page to optimize cache usage.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at"
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const _page = Math.max(page, 1)
  const locale=await getLocale()
  const countryCode=extractCountryCode(locale)

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: _page,
    queryParams: {
      ...queryParams,
      limit,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)
  const offset = (_page - 1) * limit
  const nextPage = count > offset + limit ? _page + 1 : null

  return {
    response: {
      products: sortedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

/**
 * Resolves localized product handle for a target country.
 * Normalizes locale format to match API response structure.
 */
export const getLocalizedProductHandle = async ({
  currentHandle,
  sourceCountryCode,
  targetCountryCode,
  locale
}: {
  currentHandle: string
  sourceCountryCode: string
  targetCountryCode: string
  locale: string
}) => {
  const currentProduct = await listProducts({
    countryCode: sourceCountryCode,
    queryParams: {
      handle: currentHandle,
      fields: "id",
      limit: 1,
    },
  }).then(({ response }) => response.products[0])

  if (!currentProduct?.id) {
    return null
  }

  const localizedProduct = await listProducts({
    countryCode: targetCountryCode,
    queryParams: {
      id: [currentProduct.id],
      fields: "handle,custom_translation",
      limit: 1,
    },
  }).then(({ response }) => response.products[0])

  if (!localizedProduct) {
    return null
  }

  return resolveLocalizedHandle({
    handle: localizedProduct.handle,
    customTranslation: (localizedProduct as { custom_translation?: CustomTranslation })
      .custom_translation,
    locale,
  })
}

/**
 * Fetches every locale's handle for a product in one request, so hreflang
 * alternates for all locales need no per-locale lookups.
 * Region-independent, so it is safe to share across visitors.
 */
export const getProductTranslations = async (handle: string) => {
  return sdk.client
    .fetch<{
      products: Array<{
        handle: string
        custom_translation?: CustomTranslation
      }>
    }>(`/store/products`, {
      query: { handle, fields: TRANSLATION_LOOKUP_FIELDS, limit: 1 },
      next: { revalidate: 60 },
    })
    .then(({ products }) => products[0] ?? null)
}


export const getProductReviews = async ({
  productId,
  limit = 10,
  offset = 0,
}: {
  productId: string
  limit?: number
  offset?: number 
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions(`product-reviews-${productId}`)),
  }

  return sdk.client.fetch<{
    reviews: StoreProductReview[]
    average_rating: number
    limit: number
    offset: number
    count: number
  }>(`/store/products/${productId}/reviews`, {
    headers,
    query: {
      limit,
      offset,
      order: "-created_at",
    },
    next:{
      revalidate:60
    },
  })
}

export const addProductReview = async (input: {
  title?: string
  content: string
  first_name: string
  last_name: string
  rating: number,
  product_id: string,
  recaptchaToken: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch(`/store/reviews`, {
    method: "POST",
    headers,
    body: input,
    next: {
      ...(await getCacheOptions(`product-reviews-${input.product_id}`)),
    },
    cache: "no-store",
  })
}

export type BestSellerPeriod = "week" | "month"

export type ProductRating = { average: number; count: number }

/**
 * Most bought products of the last week, falling back to the last month.
 *
 * Expects a store route `GET /store/products/best-sellers?period=week|month`
 * returning `{ products }` ordered by units sold. Until the backend provides
 * it (or when both periods are empty) the newest products are shown instead,
 * so the homepage carousel is never empty.
 */
export const listBestSellingProducts = async ({
  countryCode,
  limit = 8,
}: {
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> => {
  const region = await getRegion(countryCode)
  if (!region) return []

  const headers = { ...(await getAuthHeaders()) }
  const locale = await getLocale()
  const fields = `*variants.calculated_price,*variants.options,*variants.images,*options.values,${
    locale ? `*custom_translation.${locale}` : "*custom_translation"
  }`

  for (const period of ["week", "month"] as BestSellerPeriod[]) {
    const products = await sdk.client
      .fetch<{ products: HttpTypes.StoreProduct[] }>(
        `/store/products/best-sellers`,
        {
          method: "GET",
          query: { period, limit, region_id: region.id, fields },
          headers,
          next: { revalidate: 3600 },
        }
      )
      .then(({ products }) => products)
      .catch(() => [])

    if (products?.length) return products
  }

  return listNewestProducts({ countryCode, limit })
}

/** Most recently added products, with prices and options for product cards */
export const listNewestProducts = async ({
  countryCode,
  limit = 10,
}: {
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> => {
  const locale = await getLocale()
  const fields = `*variants.calculated_price,*variants.options,*variants.images,*options.values,${
    locale ? `*custom_translation.${locale}` : "*custom_translation"
  }`

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit, order: "-created_at", fields } as any,
  })
  return products
}

/** Average rating and review count per product; products without reviews are omitted */
export const getProductRatings = async (
  productIds: string[]
): Promise<Record<string, ProductRating>> => {
  const entries = await Promise.all(
    productIds.map((id) =>
      getProductReviews({ productId: id, limit: 1 })
        .then(({ average_rating, count }) =>
          count > 0 ? ([id, { average: average_rating, count }] as const) : null
        )
        .catch(() => null)
    )
  )
  return Object.fromEntries(entries.filter((e) => e !== null))
}
