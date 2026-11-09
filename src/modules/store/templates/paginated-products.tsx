import { listProductsWithSort } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listProductOptions } from "@lib/data/options"
import { PRODUCT_CARD_FIELDS } from "@lib/data/product-fields"
import { buildProductListEcommercePayload } from "@lib/analytics"
import AnalyticsEvent from "@modules/analytics/components/event"
import { ProductsListingsPage } from "@modules/common/components/swh/sliders"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { convertSlugsToIds } from "@lib/util/option-slug-mapper"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  fields: string
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  option_value_id?: string[]
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  categoryHandle,
  productsIds,
  filterParams,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  categoryHandle?: string
  productsIds?: string[]
  filterParams?: Record<string, string | string[] | undefined>
}) {
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
    fields: PRODUCT_CARD_FIELDS,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  // Options and categories don't depend on each other or on the product query.
  const [productOptions, categories] = await Promise.all([
    listProductOptions(),
    listCategories({ fields: "name,handle,rank,parent_category_id,parent_category.handle" }).catch((error) => {
      console.error("Failed to fetch categories:", error)
      return []
    }),
  ])

  // Convert slug-based filter params to ID-based params
  // Format in URL: size=large,medium (slug-based, SEO-friendly)
  // Format for API: option_value_id=valueId1,valueId2 (ID-based)
  if (filterParams && productOptions.length > 0) {
    const idParams = convertSlugsToIds(filterParams, productOptions)
    Object.entries(idParams).forEach(([paramKey, paramValue]) => {
      if (paramKey.startsWith("option_")) {
        const valueIds = paramValue.split(",")
        if (queryParams.option_value_id) {
          queryParams.option_value_id.push(...valueIds)
        } else {
          queryParams.option_value_id = valueIds
        }
      }
    })
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  const listName = "Store product list"

  return (
    <>
      <AnalyticsEvent
        eventName="view_item_list"
        ecommerce={buildProductListEcommercePayload({
          listName,
          products,
        })}
      />
      <ProductsListingsPage
        sortBy={sortBy}
        products={products}
        page={page}
        totalPages={totalPages}
        totalProducts={count}
        productsPerPage={PRODUCT_LIMIT}
        productOptions={productOptions}
        categories={categories}
        currentCategoryHandle={categoryHandle}
      />
    </>
  )
}
