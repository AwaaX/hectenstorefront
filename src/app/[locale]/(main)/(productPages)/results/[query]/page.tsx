import { Metadata } from "next"
import {
  buildHreflangAlternates,
  getLocalizedMetadata,
} from "@lib/util/metadata"
import { pathnames } from "@i18n/routing"
import { extractCountryCode } from "@lib/util/locale"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { search } from "@modules/search/actions"
import SearchResultsTemplate from "@modules/search/templates/search-results-template"

type Params = {
  params: Promise<{ query: string; locale: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params
  const query = decodeURIComponent(params.query)
  const alternates = await buildHreflangAlternates((locale) => {
    const route = pathnames["/results/[query]"] as
      | string
      | Record<string, string>
    const localizedLocale = locale.toLowerCase()

    if (typeof route === "string") {
      return `/${localizedLocale}/${route.replace(
        "[query]",
        encodeURIComponent(query)
      )}`
    }

    const localizedPath = route[locale as keyof typeof route] ?? route["en-gb"]

    return localizedPath
      ? `/${localizedLocale}/${localizedPath.replace(
          "[query]",
          encodeURIComponent(query)
        )}`
      : null
  }, params.locale)

  return getLocalizedMetadata(
    "Metadata.SearchResults",
    {
      query,
    },
    alternates
  )
}

export default async function SearchResults(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { query } = params
  const { sortBy, page } = searchParams
  const countryCode = extractCountryCode(params.locale)

  const hits = await search(query)

  const ids = hits
    .map((h) => h.objectID || h.id)
    .filter((id): id is string => {
      return typeof id === "string"
    })

  return (
    <SearchResultsTemplate
      query={query}
      ids={ids}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
    />
  )
}
