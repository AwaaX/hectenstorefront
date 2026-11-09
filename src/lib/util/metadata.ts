import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { defaultLocale } from "@i18n/routing"
import { getStorefrontLocales } from "@lib/util/storefront-locales"

type MetadataValues = Record<string, string | number>

type HreflangAlternates = NonNullable<Metadata["alternates"]>

const getCountryCodeFromLocale = (locale: string) => {
  const [, countryCode] = locale.split("-")
  return countryCode?.toUpperCase() ?? locale.toLowerCase()
}

const normalizeLocaleToHreflang = (locale: string) => {
  const [language, region] = locale.split("-")
  return region ? `${language?.toLowerCase()}-${region.toUpperCase()}` : locale.toLowerCase()
}

export async function getLocalizedMetadata(
  namespace: string,
  values?: MetadataValues,
  alternates?: HreflangAlternates
): Promise<Metadata> {
  const t = await getTranslations(namespace)

  return {
    title: t("title", values),
    description: t("description", values),
    alternates,
  }
}

/**
 * Builds hreflang alternates for the locales the backend serves (from regions),
 * not the ones declared in routing.ts.
 *
 * `currentLocale` is the locale of the page being rendered: it is the canonical.
 * `x-default` points at the default locale's URL.
 */
export async function buildHreflangAlternates(
  getPathForLocale: (
    locale: string,
    countryCode: string
  ) => Promise<string | null> | string | null,
  currentLocale: string
): Promise<HreflangAlternates> {
  const storefrontLocales = await getStorefrontLocales()

  const entries = await Promise.all(
    storefrontLocales.map(async (locale) => {
      const path = await getPathForLocale(locale, getCountryCodeFromLocale(locale))
      return path ? ([normalizeLocaleToHreflang(locale), path] as const) : null
    })
  )

  const languages = Object.fromEntries(
    entries.filter((entry): entry is readonly [string, string] => entry !== null)
  )

  const defaultPath = languages[normalizeLocaleToHreflang(defaultLocale)]
  const canonicalPath =
    languages[normalizeLocaleToHreflang(currentLocale)] ?? defaultPath

  return {
    canonical: canonicalPath,
    languages: {
      ...languages,
      "x-default": defaultPath ?? canonicalPath,
    },
  }
}
