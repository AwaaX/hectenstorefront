import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import parse from "html-react-parser"
import ReadMore from "@modules/common/components/read-more"
import { ExtendedProductCategory } from "@lib/data/categories"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  filterParams,
}: {
  category: ExtendedProductCategory
  sortBy?: SortOptions
  page?: string
  filterParams?: Record<string, string | string[] | undefined>
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  return (
    <>
      {category?.category_brief?.brief && (
        <ReadMore
          words={50}
          className="christmas-product-description"
        >
          {parse(category.category_brief.brief)}
        </ReadMore>
      )}
      <PaginatedProducts
        sortBy={sort}
        page={pageNumber}
        categoryId={category?.id}
        categoryHandle={category?.handle}
        filterParams={filterParams}
      />
      {category?.description && (
        <ReadMore
          words={150}
          className="christmas-product-description"
        >
          {parse(category.description)}
        </ReadMore>
      )}
    </>
  )
}
