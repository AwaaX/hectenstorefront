import { listRegions } from "@lib/data/regions"
import { hasStorefrontLocale } from "@lib/util/locale"

/**
 * Storefront locales (e.g. "en-gb"), one per country served by a region.
 * The language comes from region metadata, defaulting to English.
 * Shipping-only countries (no locale metadata) are skipped.
 */
export async function getStorefrontLocales(): Promise<string[]> {
  const regions = (await listRegions()) ?? []
  const seenCountries = new Set<string>()
  const locales = new Set<string>()

  for (const region of regions) {
    for (const country of region.countries ?? []) {
      const countryCode = country.iso_2?.toLowerCase()
      if (
        !countryCode ||
        seenCountries.has(countryCode) ||
        !hasStorefrontLocale(region, countryCode)
      ) {
        continue
      }

      seenCountries.add(countryCode)
      const language = region.metadata?.[`locale_${countryCode}`] as
        | string
        | undefined
      locales.add(`${language?.toLowerCase() ?? "en"}-${countryCode}`)
    }
  }

  return [...locales]
}
