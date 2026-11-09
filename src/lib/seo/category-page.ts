import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCompanyInformation } from "@lib/data/information"
import {
  getCachedCategoryTranslations,
  getCategoryPageData,
} from "@lib/data/category-page"
import type { ExtendedProductCategory } from "@lib/data/categories"
import { getLocalizedShopPath } from "@lib/seo/shop-page"
import { getSiteUrl } from "@lib/util/env"
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@lib/util/jsonld-utils"
import { resolveLocalizedHandle } from "@lib/util/localized-handle"
import { buildHreflangAlternates } from "@lib/util/metadata"

type CategoryRouteParams = { locale: string; category: string[] }

export const getCategoryHandle = (segments: string[]) =>
  segments.at(-1) as string

export async function generateCategoryMetadata({
  category: segments,
  locale,
}: CategoryRouteParams): Promise<Metadata> {
  try {
    const handle = getCategoryHandle(segments)
    const [category, ...segmentTranslations] = await Promise.all([
      getCategoryPageData(handle) as Promise<ExtendedProductCategory | undefined>,
      ...segments.map((seg) => getCachedCategoryTranslations(seg)),
    ])

    if (!category) {
      notFound()
    }

    const alternates = await buildHreflangAlternates((targetLocale) => {
      const localizedSegments = segmentTranslations.map((translations) => {
        if (!translations) return null
        return resolveLocalizedHandle({
          handle: translations.handle,
          customTranslation: translations.custom_translation,
          locale: targetLocale,
        })
      })

      if (localizedSegments.some((s) => s === null)) return null

      return `/${targetLocale.toLowerCase()}/${localizedSegments.join("/")}`
    }, locale)

    const description =
      category.description ||
      `${category.name} - Christmas pyjamas from Hecten`

    const image = category.product_category_image?.[0]?.url
    const images = image
      ? [{ url: image, width: 1600, height: 900, type: "image/jpeg" }]
      : []

    return {
      title: category.name,
      description,
      openGraph: {
        title: category.name,
        description,
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: category.name,
        description,
        images: image ? [image] : [],
      },
      alternates,
    }
  } catch (error) {
    notFound()
  }
}

export async function generateCategoryJsonLd({
  category,
  locale,
  handle,
}: {
  category: ExtendedProductCategory
  locale: string
  handle: string
}) {
  const baseUrl = getSiteUrl()
  const localePrefix = `/${locale}`
  const shopUrl = `${baseUrl}${localePrefix}${getLocalizedShopPath(locale) ?? ""}`
  const currentUrl = `${shopUrl}/${handle}`
  const companyInfo = await getCompanyInformation()
  const image = category.product_category_image?.[0]?.url

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
        { name: "Christmas pyjamas", url: shopUrl },
        { name: category.name || "", url: currentUrl },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${currentUrl}/#webpage`,
        url: currentUrl,
        name: category.name || "",
        description:
          category.description ||
          `${category.name} - Christmas pyjamas from Hecten`,
        isPartOf: { "@id": `${baseUrl}/#website` },
        breadcrumb: { "@id": `${currentUrl}/#breadcrumb` },
        inLanguage: locale || "en-gb",
        ...(image && { image }),
      },
    ],
  }
}
