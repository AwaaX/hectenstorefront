import { listCategoryHandles, listProductHandles } from "./catalog-handles"
import { getStorefrontLocales } from "@lib/util/storefront-locales"

/**
 * Builds `{ locale, ...params }` for every locale from that locale's handles.
 * A failing locale is skipped so one bad response cannot fail the whole build.
 */
async function buildStaticParams<Params>(
  label: string,
  listHandles: (locale: string) => Promise<string[]>,
  toParams: (locale: string, handle: string) => Params
): Promise<Array<{ locale: string } & Params>> {
  try {
    const locales = await getStorefrontLocales()

    const paramsPerLocale = await Promise.all(
      locales.map(async (locale) => {
        try {
          const handles = await listHandles(locale)
          return handles.map((handle) => ({ locale, ...toParams(locale, handle) }))
        } catch (error) {
          console.error(`Failed to list ${label} for locale "${locale}":`, error)
          return []
        }
      })
    )

    return paramsPerLocale.flat()
  } catch (error) {
    console.error(
      `Failed to generate static params for ${label}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
    return []
  }
}

export const getProductStaticParams = () =>
  buildStaticParams("products", listProductHandles, (_locale, handle) => ({
    handle,
  }))

export const getCategoryStaticParams = () =>
  buildStaticParams("categories", listCategoryHandles, (_locale, handle) => ({
    category: [handle],
  }))
