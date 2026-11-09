"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

/**
 * Fetches all product options for filtering
 * Product options are attributes like size, color, material that customers can filter by
 * Public catalog data, cached for an hour and shared across visitors.
 * @returns Array of product options with their values
 */
export const listProductOptions = async (): Promise<HttpTypes.StoreProductOption[]> => {
  try {
    const next = {
      revalidate: 3600,
      ...(await getCacheOptions("product-options")),
    }

    const response = await sdk.client.fetch<{
      product_options: HttpTypes.StoreProductOption[]
      count: number
      offset: number
      limit: number
    }>(`/store/product-options`, {
      method: "GET",
      query: {
        limit: 100,
        offset: 0,
      },
      next,
    })

    return response.product_options || []
  } catch (error) {
    console.error("Error fetching product options:", error)
    return []
  }
}

/**
 * Fetches product options with their associated products for filtering
 * This is useful for showing option counts alongside the filter options
 */
export const listProductOptionsWithCounts = async (): Promise<
  Array<{
    id: string
    title: string
    values: Array<{
      id: string
      value: string
      count?: number
    }>
  }>
> => {
  const options = await listProductOptions()
  return options.map((option) => ({
    id: option.id,
    title: option.title,
    values: (option.values || []).map((value) => ({
      id: value.id,
      value: value.value,
    })),
  }))
}
