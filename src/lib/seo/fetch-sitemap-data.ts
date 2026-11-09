/**
 * Fetch Sitemap Data
 * Utilities to fetch products, collections, categories for sitemap generation.
 * Uses existing data-fetching patterns with proper caching.
 */

"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import type { CustomTranslation } from "@lib/util/localized-handle"

const BATCH_SIZE = 100
const CACHE_REVALIDATE = 3600 // 1 hour

/**
 * Fetch all product handles for sitemap
 * Uses batching to avoid memory issues with large product catalogs
 */
export async function fetchAllProductHandles(): Promise<string[]> {
  const allHandles: string[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    try {
      const { products, count } = await sdk.client.fetch<{
        products: Array<{ handle: string }>
        count: number
      }>("/store/products", {
        query: {
          fields: "handle",
          limit: BATCH_SIZE,
          offset,
        },
        next: { revalidate: CACHE_REVALIDATE },
        cache: "force-cache",
      })

      if (!products || products.length === 0) {
        break
      }

      allHandles.push(...products.map((p) => p.handle))

      if (allHandles.length >= count) {
        hasMore = false
      } else {
        offset += BATCH_SIZE
      }
    } catch (error) {
      console.error(`Error fetching products at offset ${offset}:`, error)
      break
    }
  }

  return allHandles
}

/**
 * Fetch all collections for sitemap
 */
export async function fetchAllCollections(): Promise<
  Array<{ handle: string; updated_at?: string }>
> {
  try {
    const { collections } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
    }>("/store/collections", {
      query: {
        limit: 100,
        offset: 0,
      },
      next: { revalidate: CACHE_REVALIDATE },
      cache: "force-cache",
    })

    return (
      collections?.map((c) => ({
        handle: c.handle || "",
        updated_at: c.updated_at,
      })) || []
    )
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
  }
}

export interface SitemapCategorySegment {
  handle: string
  custom_translation?: CustomTranslation | null
}

export interface SitemapCategory {
  /** Full default-locale path, e.g. "parent-slug/child-slug" */
  handle: string
  /** One entry per path segment, root first, with its translations */
  segments: SitemapCategorySegment[]
  updated_at?: string
}

type CategoryRow = {
  id: string
  handle?: string | null
  parent_category_id?: string | null
  custom_translation?: CustomTranslation | null
  updated_at?: string
}

/**
 * Fetch all categories for sitemap
 * Each category carries its full ancestor chain, matching the
 * /[locale]/[...category] URLs the storefront links to (no /shop prefix)
 */
export async function fetchAllCategories(): Promise<SitemapCategory[]> {
  const rows: CategoryRow[] = []

  try {
    for (let offset = 0; ; offset += BATCH_SIZE) {
      const { product_categories, count } = await sdk.client.fetch<{
        product_categories: CategoryRow[]
        count: number
      }>("/store/product-categories", {
        query: {
          fields: "id,handle,parent_category_id,custom_translation,updated_at",
          limit: BATCH_SIZE,
          offset,
        },
        next: { revalidate: CACHE_REVALIDATE },
        cache: "force-cache",
      })

      rows.push(...(product_categories ?? []))

      if (!product_categories?.length || rows.length >= count) {
        break
      }
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  const byId = new Map(rows.map((row) => [row.id, row]))
  const categories: SitemapCategory[] = []

  for (const row of rows) {
    const chain: CategoryRow[] = []
    const seen = new Set<string>()

    // Walk up to the root; an unpublished/missing ancestor drops the category
    for (
      let current: CategoryRow | undefined = row;
      current;
      current = current.parent_category_id
        ? byId.get(current.parent_category_id)
        : undefined
    ) {
      if (seen.has(current.id)) break
      seen.add(current.id)
      chain.unshift(current)
      if (current.parent_category_id && !byId.has(current.parent_category_id)) {
        chain.length = 0
        break
      }
    }

    if (!chain.length || chain.some((c) => !c.handle)) continue

    categories.push({
      handle: chain.map((c) => c.handle).join("/"),
      segments: chain.map((c) => ({
        handle: c.handle as string,
        custom_translation: c.custom_translation,
      })),
      updated_at: row.updated_at,
    })
  }

  return categories
}
