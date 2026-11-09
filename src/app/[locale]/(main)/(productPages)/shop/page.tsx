import { Metadata } from "next"
import { generateShopMetadata, generateShopJsonLd } from "@lib/seo/shop-page"
import { BreadcrumbsNavigation } from "@modules/common/components/swh"
import JsonLd from "@modules/common/components/json-ld"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    [key: string]: string | string[] | undefined
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return generateShopMetadata((await props.params).locale)
}

export default async function StorePage(props: Props) {
  const { locale } = await props.params
  const { sortBy, page, ...filterParams } = await props.searchParams

  const jsonLd = await generateShopJsonLd(locale)

  return (
    <div className="container">
      <JsonLd id="shop-jsonld" data={jsonLd} />
      <BreadcrumbsNavigation title="shop" />
      <StoreTemplate sortBy={sortBy} page={page} filterParams={filterParams} />
    </div>
  )
}
