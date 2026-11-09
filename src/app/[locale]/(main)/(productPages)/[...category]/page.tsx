import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import type { ExtendedProductCategory } from "@lib/data/categories"
import { getCategoryPageData } from "@lib/data/category-page"
import {
  generateCategoryJsonLd,
  generateCategoryMetadata,
  getCategoryHandle,
} from "@lib/seo/category-page"
import { getCategoryStaticParams } from "@lib/static-params"
import CategoryTemplate from "@modules/categories/templates"
import JsonLd from "@modules/common/components/json-ld"
import { BreadcrumbsNavigation } from "@modules/common/components/swh"
import SwhCatSliderUI from "@modules/layout/components/category-slider-ui"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; locale: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    [key: string]: string | string[] | undefined
  }>
}

export function generateStaticParams() {
  return getCategoryStaticParams()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return generateCategoryMetadata(await props.params)
}

export default async function CategoryPage(props: Props) {
  const { category: segments, locale } = await props.params
  const { sortBy, page, ...filterParams } = await props.searchParams

  const handle = getCategoryHandle(segments)
  const productCategory = await getCategoryPageData(handle)

  if (!productCategory) {
    notFound()
  }

  const jsonLd = await generateCategoryJsonLd({
    category: productCategory as ExtendedProductCategory,
    locale,
    handle,
  })

  const parents: HttpTypes.StoreProductCategory[] = []
  for (
    let parent = productCategory.parent_category;
    parent;
    parent = parent.parent_category
  ) {
    parents.push(parent)
  }

  return (
    <div className="container">
      <JsonLd id="category-jsonld" data={jsonLd} />
      <BreadcrumbsNavigation
        title={productCategory.name}
        localizeTitle={false}
        parents={parents}
      />
      <SwhCatSliderUI categories={productCategory.category_children} parentCategoryHandle={productCategory.handle} />
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        filterParams={filterParams}
      />
    </div>
  )
}
