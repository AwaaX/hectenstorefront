import { locales } from "@i18n/routing"
import { HttpTypes } from "@medusajs/types"
import { defaultLocale } from "@i18n/routing"

export const localeByCountryCode = locales.reduce<Record<string, string>>(
  (acc, locale) => {
    const [, region] = locale.split("-")

    if (region) {
      acc[region.toLowerCase()] = locale
    }

    return acc
  },
  {}
)

/**
 * Resolves the locale string from a region based on country code.
 * Uses region metadata to map country code to locale, with fallback to default.
 */
export const getLocaleFromRegion = (
  region: HttpTypes.StoreRegion | undefined,
  countryCode?: string
): string => {
  if (!region || !countryCode) {
    return defaultLocale
  }

  const normalizedCountryCode = countryCode.toLowerCase()
  const metadataLocale = region.metadata?.[
    `locale_${normalizedCountryCode}`
  ] as string | undefined

  if (!metadataLocale) {
    return defaultLocale
  }

  return `${metadataLocale.toLowerCase()}-${normalizedCountryCode.toLowerCase()}`
}

/**
 * Whether a country has its own storefront locale. Countries without a
 * `locale_<cc>` entry in region metadata are shipping-only: they can be used
 * in checkout addresses but don't get a storefront of their own. The default
 * locale's country always counts, as getLocaleFromRegion falls back to it.
 */
export const hasStorefrontLocale = (
  region: HttpTypes.StoreRegion | undefined,
  countryCode: string
): boolean => {
  const normalizedCountryCode = countryCode.toLowerCase()

  return (
    !!region?.metadata?.[`locale_${normalizedCountryCode}`] ||
    normalizedCountryCode === extractCountryCode(defaultLocale)
  )
}

/**
 * Maps a country to the one whose storefront should serve it: the country
 * itself if it has a locale, otherwise the first country in the same region
 * that does (e.g. a shipping-only "at" in the German region → "de").
 */
export const getStorefrontCountryCode = (
  region: HttpTypes.StoreRegion | undefined,
  countryCode: string
): string | undefined => {
  if (hasStorefrontLocale(region, countryCode)) {
    return countryCode.toLowerCase()
  }

  return region?.countries
    ?.map((c) => c.iso_2?.toLowerCase())
    .find((cc): cc is string => !!cc && hasStorefrontLocale(region, cc))
}

export const countryCodeByLocale =locales.reduce<Record<string, string>>(
  (acc, locale) => {
    const countryCode = extractCountryCode(locale)
    if (countryCode) {
      acc[locale.toLowerCase()] = countryCode
    }
    return acc
  },
  {}
)

export function extractLanguageCode(locale: string): string {
  return locale.split("-")[0].toLowerCase()
}

export function extractCountryCode(locale: string | null | undefined): string {
  const parts = locale?.split("-") ?? ""
  return parts?.length > 1 ? parts[1].toLowerCase() : ""
}

export function parseLocale(locale: string): {
  language: string
  country: string
  locale: string
} {
  const normalized = locale.toLowerCase()
  const [language, country] = normalized.split("-")

  return {
    language: language || "",
    country: country || "",
    locale: normalized,
  }
}

export function isValidLocale(locale: string): boolean {
  return locales.some((l) => l.toLowerCase() === locale.toLowerCase())
}

/**
 * Normalizes locale to storefront format (lowercase-lowercase).
 * Converts API response format (e.g., "en-GB") to storefront format (e.g., "en-gb").
 */
export function normalizeLocaleToStorefront(locale: string): string {
  return locale.toLowerCase()
}

/**
 * Normalizes locale to API format (language-UPPERCASE_COUNTRY).
 * Converts storefront format (e.g., "en-gb") to API format (e.g., "en-GB").
 */
export function normalizeLocaleToApi(locale: string): string {
  const [language, country] = locale.toLowerCase().split("-")
  if (!country) {
    return locale.toLowerCase()
  }
  return `${language}-${country.toUpperCase()}`
}

/**
 * Normalizes locale to metadata format (language-UPPERCASE_COUNTRY).
 * Used for accessing metadata keys in API responses.
 */
export function normalizeLocaleToMetadata(locale: string): string {
  const [language, country] = locale.toLowerCase().split("-")
  if (!country) {
    return locale.toLowerCase()
  }
  return `${language}-${country.toUpperCase()}`
}

/**
 * Gets all possible locale variations for matching against API responses.
 * Returns an array of different format variations.
 */
export function getLocaleVariations(locale: string): string[] {
  const normalized = locale.toLowerCase()
  const [language, country] = normalized.split("-")

  if (!country) {
    return [normalized]
  }

  return [
    normalized, // en-gb
    `${language}-${country.toUpperCase()}`, // en-GB
    `${language}_${country.toUpperCase()}`, // en_GB
    `${country.toUpperCase()}`, // GB (country code only)
  ]
}
