"use client"
import React, { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Pagination } from "@modules/store/components/pagination"
import StickyFilterBar from "@modules/store/components/sticky-filter-bar"
import ResponsiveFilterPanel from "@modules/store/components/responsive-filter-panel"
import SortProducts from "@modules/store/components/refinement-list/sort-products"
// Use Next's usePathname (the real browser path, locale prefix included), not
// next-intl's, which returns the internal template "/[...category]" on
// category pages. It pairs with Next's router, which pushes the href as-is.
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ProductGridCard from "../product-previews/ProductGridCard"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import {
  createOptionSlugMappings,
  generateSlug,
} from "@lib/util/option-slug-mapper"
import {
  formatSizeString,
  getColorSwatch,
  getTranslatedGenderValue,
  getTranslatedOptionTitle,
} from "@lib/util/product-options"
import { buildCategoryPathSegments } from "@lib/util/category-path"

const sortOptions: SortOptions[] = ["created_at", "price_asc", "price_desc"]

const gridColsMap: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
}

/** Props for ProductsListingsPage component */
interface ProductsListingsPageProps {
  /** Current sort option */
  sortBy?: string
  /** Array of products to display */
  products: HttpTypes.StoreProduct[]
  /** Current page number */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Total number of products */
  totalProducts: number
  /** Number of products per page */
  productsPerPage: number
  /** Product options for filtering */
  productOptions?: HttpTypes.StoreProductOption[]
  /** Product categories */
  categories?: HttpTypes.StoreProductCategory[]
  /** Handle of the category currently being viewed, if any (e.g. on a category page) */
  currentCategoryHandle?: string
}

/**
 * Products listing page with grid display and pagination
 * Shows products with sorting, filtering, and pagination controls
 */
const ProductsListingsPage = ({
  sortBy,
  products,
  page,
  totalPages,
  totalProducts,
  productOptions = [],
  categories = [],
  currentCategoryHandle,
}: ProductsListingsPageProps) => {
  const t = useTranslations("Store")
  const tSort = useTranslations("Store.Sort")
  const tProduct = useTranslations("Product.Actions")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [layoutCol, setLayoutCol] = useState<number | null>(4)
  const [layoutType, setLayoutType] = useState<"grid" | "list">("grid")
  const [isSortPanelOpen, setIsSortPanelOpen] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleLayoutCol = (col: number) => {
    setLayoutCol(col)
  }

  const FromProductNo = 12 * (page - 1)
  const ToProductNo = products.length + 12 * (page - 1)

  const selectedValue =
    sortBy && sortOptions.includes(sortBy as SortOptions)
      ? tSort(sortBy as SortOptions)
      : null

  // Set query params function for sort
  const setQueryParams = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      params.set("page", "1") // Reset to first page when sorting changes
      router.push(`${pathname}?${params.toString()}`)
      setIsSortPanelOpen(false)
    },
    [searchParams, pathname, router]
  )

  // Sort categories by rank (smaller to larger) for the filter panel.
  // Ranks aren't unique across the hierarchy (e.g. a root category and one
  // of its children can both be rank 0), so when ranks tie the root
  // category (parent_category_id === null) always sorts first.
  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const rankDiff = (a.rank ?? 0) - (b.rank ?? 0)
        if (rankDiff !== 0) return rankDiff
        const aIsRoot = a.parent_category_id === null
        const bIsRoot = b.parent_category_id === null
        if (aIsRoot === bIsRoot) return 0
        return aIsRoot ? -1 : 1
      }),
    [categories]
  )

  // Create slug mappings from product options
  const slugMappings = useMemo(
    () => createOptionSlugMappings(productOptions),
    [productOptions]
  )

  // Handle product option filter changes using SEO-friendly slugs
  const handleOptionSelect = useCallback(
    (optionId: string, valueId: string, isChecked: boolean) => {
      const params = new URLSearchParams(searchParams)

      // Convert option ID to slug for URL
      const optionSlug = slugMappings.optionIdToSlug.get(optionId)
      if (!optionSlug) return // Option not found

      // Convert value ID to slug
      const valueSlug = slugMappings.valueIdToSlug.get(valueId)
      if (!valueSlug) return // Value not found

      const currentValues =
        params.get(optionSlug)?.split(",").filter(Boolean) || []

      if (isChecked) {
        if (!currentValues.includes(valueSlug)) {
          currentValues.push(valueSlug)
        }
      } else {
        const index = currentValues.indexOf(valueSlug)
        if (index > -1) {
          currentValues.splice(index, 1)
        }
      }

      if (currentValues.length > 0) {
        params.set(optionSlug, currentValues.join(","))
      } else {
        params.delete(optionSlug)
      }

      params.set("page", "1") // Reset to first page when filtering changes
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router, slugMappings]
  )

  // Clear all filters
  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams()
    params.set("page", "1")
    // Keep sortBy if it exists
    if (searchParams.has("sortBy")) {
      params.set("sortBy", searchParams.get("sortBy") || "created_at")
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])

  // Count active filters (all search params except sortBy and page)
  const activeFiltersCount = useMemo(() => {
    let count = 0
    searchParams.forEach((value, key) => {
      if (key !== "sortBy" && key !== "page") {
        count++
      }
    })
    return count
  }, [searchParams])

  // Detect mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <>
      {/* Results Header */}
      <div className="filter-heading flex items-center justify-between md:gap-5 flex-wrap z-20 bg-white top-[70px] sticky">
        <div className="max-sm:hidden left flex has-line items-center flex-wrap gap-5">
          <div className="total-product text-secondary body1">
            {t("showingResults", {
              from: FromProductNo,
              to: ToProductNo,
              total: totalProducts,
            })}
          </div>
        </div>
        <div className="right flex items-center gap-3">
          <div className="choose-layout flex items-center gap-2">
            <StickyFilterBar
              onSortClick={() => setIsSortPanelOpen(true)}
              onFilterClick={() => setIsFilterPanelOpen(true)}
              activeFiltersCount={activeFiltersCount}
              sortLabel={selectedValue || undefined}
            />
            <div
              className={`item two-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${
                layoutType === "grid" && layoutCol === 2 ? "active" : ""
              }`}
              onClick={() => {
                handleLayoutCol(2)
                setLayoutType("grid")
              }}
            >
              <div className="flex items-center gap-0.5">
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
              </div>
            </div>
            <div
              className={`max-md:hidden item three-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${
                layoutType === "grid" && layoutCol === 3 ? "active" : ""
              }`}
              onClick={() => {
                handleLayoutCol(3)
                setLayoutType("grid")
              }}
            >
              <div className="flex items-center gap-0.5">
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
              </div>
            </div>
            <div
              className={`max-md:hidden item four-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${
                layoutType === "grid" && layoutCol === 4 ? "active" : ""
              }`}
              onClick={() => {
                handleLayoutCol(4)
                setLayoutType("grid")
              }}
            >
              <div className="flex items-center gap-0.5">
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
              </div>
            </div>
            <div
              className={`max-md:hidden item five-col p-2 border border-line rounded flex items-center justify-center cursor-pointer ${
                layoutType === "grid" && layoutCol === 5 ? "active" : ""
              }`}
              onClick={() => {
                handleLayoutCol(5)
                setLayoutType("grid")
              }}
            >
              <div className="flex items-center gap-0.5">
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
                <span className="w-[3px] h-4 bg-secondary2 rounded-sm"></span>
              </div>
            </div>
            <div
              className={`item row w-8 h-8 border border-line rounded flex items-center justify-center cursor-pointer ${
                layoutType === "list" ? "active" : ""
              }`}
              onClick={() => setLayoutType("list")}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="w-4 h-[3px] bg-secondary2 rounded-sm"></span>
                <span className="w-4 h-[3px] bg-secondary2 rounded-sm"></span>
                <span className="w-4 h-[3px] bg-secondary2 rounded-sm"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden left flex has-line items-center flex-wrap gap-5">
        <div className="total-product text-secondary body1">
          {t("showingResults", {
            from: FromProductNo,
            to: ToProductNo,
            total: totalProducts,
          })}
        </div>
      </div>

      {/* Sort Panel */}
      <ResponsiveFilterPanel
        isOpen={isSortPanelOpen}
        onClose={() => setIsSortPanelOpen(false)}
        title="Sort"
        isMobile={isMobile}
      >
        <SortProducts
          sortBy={(sortBy as SortOptions) || "created_at"}
          setQueryParams={setQueryParams}
        />
      </ResponsiveFilterPanel>

      {/* Filter Panel */}
      <ResponsiveFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        title="Filters"
        isMobile={isMobile}
        onClearAll={handleClearAll}
      >
        <div className="space-y-6">
          {/* Categories Filter */}
          {sortedCategories && sortedCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-black">
                Categories
              </h3>
              <div className="space-y-2">
                {sortedCategories.map((category) => {
                  const isCurrentCategory =
                    !!currentCategoryHandle &&
                    currentCategoryHandle === category.handle
                  return (
                    <div key={category.id}>
                      <LocalizedClientLink
                        href={{
                          pathname: "/[...category]",
                          params: { category: buildCategoryPathSegments(category) },
                        }}
                        className={`block text-sm transition-all duration-200 py-2 px-3 rounded-lg ${
                          isCurrentCategory
                            ? "text-christmas font-semibold"
                            : "text-gray-700 hover:text-black hover:bg-gray-100"
                        }`}
                      >
                        {category.name}
                      </LocalizedClientLink>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Product Options Filter - Chip Style */}
          {productOptions && productOptions.length > 0 && (
            <div className="space-y-6">
              {productOptions.map((option) => {
                const hasValues = option.values && option.values.length > 0
                const optionSlug = slugMappings.optionIdToSlug.get(option.id)
                // Translate option title (Gender, Size, Color)
                const translatedOptionTitle = getTranslatedOptionTitle(
                  option.title,
                  tProduct
                )

                return (
                  <div
                    key={option.id}
                    className="border-t border-gray-200 pt-6"
                  >
                    <h3 className="text-base font-semibold mb-4 capitalize text-black">
                      {translatedOptionTitle}
                    </h3>
                    {hasValues && optionSlug ? (
                      <div className="flex flex-wrap gap-3">
                        {option.values!.map((value) => {
                          const valueSlug = slugMappings.valueIdToSlug.get(
                            value.id
                          )
                          const currentValues =
                            searchParams
                              .get(optionSlug)
                              ?.split(",")
                              .filter(Boolean) || []
                          const isSelected = valueSlug
                            ? currentValues.includes(valueSlug)
                            : false

                          // Format display value based on option type
                          let displayValue = value.value
                          const lowerOptionTitle = option.title.toLowerCase()

                          if (lowerOptionTitle === "gender") {
                            displayValue = getTranslatedGenderValue(
                              value.value,
                              tProduct
                            )
                          } else if (lowerOptionTitle === "size") {
                            displayValue = formatSizeString(value.value)
                          }

                          // Colours render as a swatch instead of their name
                          const swatch =
                            lowerOptionTitle === "color" ||
                            lowerOptionTitle === "colour"
                              ? getColorSwatch(value.value)
                              : null

                          if (valueSlug && swatch) {
                            return (
                              <button
                                key={value.id}
                                type="button"
                                onClick={() =>
                                  handleOptionSelect(
                                    option.id,
                                    value.id,
                                    !isSelected
                                  )
                                }
                                title={value.value}
                                aria-label={value.value}
                                aria-pressed={isSelected}
                                className={`w-9 h-9 rounded-full border border-gray-300 transition-all duration-200 ${
                                  isSelected
                                    ? "ring-2 ring-black ring-offset-2"
                                    : "hover:ring-2 hover:ring-gray-400 hover:ring-offset-2"
                                }`}
                                style={{ backgroundColor: swatch }}
                              />
                            )
                          }

                          return valueSlug ? (
                            <button
                              key={value.id}
                              onClick={() =>
                                handleOptionSelect(
                                  option.id,
                                  value.id,
                                  !isSelected
                                )
                              }
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 capitalize ${
                                isSelected
                                  ? "bg-gray-300 border-gray-300 text-black"
                                  : "bg-white border-gray-200 text-gray-800 hover:border-gray-400"
                              }`}
                            >
                              {displayValue}
                            </button>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No values available
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {categories.length === 0 && productOptions.length === 0 && (
            <p className="text-sm text-gray-500">No filters available</p>
          )}
        </div>
      </ResponsiveFilterPanel>

      <ul
        className={`grid mt-7 ${
          layoutType === "list"
            ? "flex flex-col gap-8"
            : `${
                gridColsMap[layoutCol!]
              } sm:grid-cols-3 grid-cols-2 sm:gap-[30px] gap-[20px]`
        } w-full gap-x-6 gap-y-8`}
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductGridCard data={p} type={layoutType} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

export default ProductsListingsPage
