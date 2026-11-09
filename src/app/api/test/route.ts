// app/api/test/route.ts - Fetch product handles for all country codes with locale-specific fields

import { sdk } from "@lib/config"
import { listRegions } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { NextResponse } from "next/server"

const getLocaleFromRegionMetadata = (
  region: HttpTypes.StoreRegion | undefined,
  countryCode: string
): string | null => {
  if (!region || !countryCode) {
    return null
  }

  const normalizedCountryCode = countryCode.toLowerCase()
  const languageCode = region.metadata?.[`locale_${normalizedCountryCode}`] as string | undefined

  if (!languageCode) {
    return null
  }

  return `${languageCode.toLowerCase()}-${normalizedCountryCode.toUpperCase()}`
}

const fetchAllCategoriesForCountry = async (
  countryCode: string,
  locale: string | null
): Promise<HttpTypes.StoreProductCategory[]> => {
  const fieldsParam = locale
    ? `*category_children,*products.id,*parent_category,*parent_category.parent_category,*product_category_image,*custom_translation.${locale.split("-")[0]}`
    : "*category_children,*products.id,*parent_category,*parent_category.parent_category,*product_category_image,*custom_translation"

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields: fieldsParam,
          limit: 100,
        },
        next: { revalidate: 5 },
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
    .catch((error) => {
      console.error(
        `Failed to fetch categories for country code "${countryCode}":`,
        error
      )
      return []
    })
}



export async function GET() {
  try {
      const regions = await listRegions()
  
      if (!regions || regions.length === 0) {
        return []
      }
  
      const countryRegionMap = new Map<string, HttpTypes.StoreRegion>()
      regions.forEach((region) => {
        region.countries?.forEach((country) => {
          const countryCode = country.iso_2?.toLowerCase()
          if (countryCode && !countryRegionMap.has(countryCode)) {
            countryRegionMap.set(countryCode, region)
          }
        })
      })
  
      if (countryRegionMap.size === 0) {
        return []
      }
  
      const categoryPromises = Array.from(countryRegionMap.entries()).map(
        async ([countryCode, region]) => {
          const locale = getLocaleFromRegionMetadata(region, countryCode)
          const categories = await fetchAllCategoriesForCountry(countryCode, locale)
  
          return {
            countryCode,
            categories,
          }
        }
      )
  
      const countryCategoriesData = await Promise.all(categoryPromises)
  

      return NextResponse.json(
        countryCategoriesData
          .flatMap((countryData) =>
            countryData.categories
              .filter((category) => category.handle)
              .map((category) => ({
                countryCode: countryData.countryCode,
                category: [category.handle],
              }))
          )
      )
  } catch (error) {
    console.error(
      `Failed to fetch product handles for all country codes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
    return NextResponse.json(
      { error: "Failed to fetch product handles" },
      { status: 500 }
    )
  }
}