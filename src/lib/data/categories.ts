"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getLocale } from "./locale-actions"
import {
  resolveLocalizedHandle,
  type CustomTranslation,
} from "@lib/util/localized-handle"
import { getCacheOptions } from "./cookies"
import { TRANSLATION_LOOKUP_FIELDS } from "./product-fields"

export interface ExtendedProductCategory
  extends HttpTypes.StoreProductCategory {
  product_category_image?: Array<{ url: string }>
  custom_translation?: CustomTranslation
  category_brief?:{
    brief:string
  }
}
export const listCategories = async (query?: Record<string, any>) => {
  const limit = query?.limit || 100

  const locale = await getLocale()

  const customTranslationFields = locale
    ? `*custom_translation.${locale}`
    : "*custom_translation"

  const parentCustomTranslationFields = locale
    ? `parent_category.custom_translation.${locale}`
    : "parent_category.custom_translation"

  // When a caller passes its own `fields`, append the locale-specific
  // parent category translation fields to it instead of letting it fully
  // override the default field set below.
  const fields = query?.fields
    ? `${query.fields},${parentCustomTranslationFields}`
    : `*category_children, *products.id, *parent_category, *parent_category.parent_category,*product_category_image,${customTranslationFields}`

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          ...query,
          fields,
          limit,
        },
        next: {
          revalidate: 5,
        },
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string) => {

   const locale = await getLocale()

     const categoryChildrenCustomTranslation = locale
    ? `category_children.custom_translation.${locale}`
    : "category_children.custom_translation"

      const parentCustomTranslationFields = locale
    ? `parent_category.custom_translation.${locale}`
    : "parent_category.custom_translation"



  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields:`name,handle,category_children.handle,category_children.name,parent_category.name,parent_category.handle,category_children.products.id,description,+category_brief.brief,category_children.product_category_image.*,${categoryChildrenCustomTranslation},${parentCustomTranslationFields}`,
          handle: categoryHandle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}

/**
 * Fetches every locale's handle for a category in one request, so hreflang
 * alternates for all locales need no per-locale lookups.
 */
export const getCategoryTranslations = async (
  leafHandle: string,
  { includeAncestorsTree = false }: { includeAncestorsTree?: boolean } = {}
) => {
  return sdk.client
    .fetch<{ product_categories: ExtendedProductCategory[] }>(
      `/store/product-categories`,
      {
        query: {
          fields: TRANSLATION_LOOKUP_FIELDS,
          handle: leafHandle,
          include_ancestors_tree: includeAncestorsTree,
        },
        next: { revalidate: 5 },
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0] ?? null)
}

/**
 * Resolves localized category handle for a target country.
 * Handles both single handles and full category paths.
 */
export const getLocalizedCategoryHandle = async ({
  currentHandle,
  locale,
  targetCountryCode,
}: {
  currentHandle: string
  locale: string
  targetCountryCode: string
}) => {
  const isFullPath = currentHandle.includes("/")
  const leafHandle = isFullPath ? currentHandle.split("/").pop() : currentHandle

  if (!leafHandle) {
    return null
  }

  const category = await getCategoryTranslations(leafHandle, {
    includeAncestorsTree: isFullPath,
  })

  if (!category) {
    return null
  }

  return resolveLocalizedHandle({
    handle: category.handle,
    customTranslation: category.custom_translation,
    locale,
  })
}


