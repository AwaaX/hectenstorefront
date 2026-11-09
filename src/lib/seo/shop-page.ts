import { Metadata } from "next"
import { pathnames } from "@i18n/routing"
import { buildHreflangAlternates, getLocalizedMetadata } from "@lib/util/metadata"
import { getCompanyInformation } from "@lib/data/information"
import { getSiteUrl } from "@lib/util/env"
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@lib/util/jsonld-utils"

/** The localized `/shop` pathname, e.g. "/tienda" for es-es. */
export const getLocalizedShopPath = (locale: string): string | null => {
  const shopPaths = pathnames["/shop"] as Record<string, string>
  return shopPaths[locale.toLowerCase()] ?? shopPaths["en-gb"] ?? null
}

export async function generateShopMetadata(
  currentLocale: string
): Promise<Metadata> {
  const alternates = await buildHreflangAlternates((locale) => {
    const shopPath = getLocalizedShopPath(locale)
    return shopPath ? `/${locale.toLowerCase()}${shopPath}` : null
  }, currentLocale)

  return getLocalizedMetadata("Metadata.AllPyjamas", undefined, alternates)
}

export async function generateShopJsonLd(locale: string) {
  const baseUrl = getSiteUrl()
  const localePrefix = `/${locale}`
  const shopPath = getLocalizedShopPath(locale) ?? ""
  const currentUrl = `${baseUrl}${localePrefix}${shopPath}`
  const companyInfo = await getCompanyInformation()

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(companyInfo, baseUrl),
      buildWebsiteJsonLd(
        companyInfo,
        baseUrl,
        `${baseUrl}${localePrefix}/`,
        locale
      ),
      buildBreadcrumbJsonLd(`${currentUrl}/#breadcrumb`, [
        { name: "Home", url: `${baseUrl}${localePrefix}/` },
        { name: "Christmas pyjamas", url: currentUrl },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${currentUrl}/#webpage`,
        url: currentUrl,
        name: "Christmas pyjamas",
        description:
          "Browse our complete collection of Christmas pyjamas from Hecten",
        isPartOf: { "@id": `${baseUrl}/#website` },
        breadcrumb: { "@id": `${currentUrl}/#breadcrumb` },
        inLanguage: locale || "en-gb",
      },
    ],
  }
}
