import { Metadata } from "next"
import { HttpTypes } from "@medusajs/types"
import { pathnames, redirect } from "@i18n/routing"
import { getCompanyInformation } from "@lib/data/information"
import {
  getCachedProductTranslations,
  getProductPageData,
} from "@lib/data/product-page"
import { getSiteUrl } from "@lib/util/env"
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@lib/util/jsonld-utils"
import { extractCountryCode } from "@lib/util/locale"
import { resolveLocalizedHandle } from "@lib/util/localized-handle"
import { buildHreflangAlternates } from "@lib/util/metadata"

type ProductRouteParams = { locale: string; handle: string }

export const getLocalizedProductSegment = (locale: string): string => {
  const productPaths = pathnames["/products/[handle]"]
  if (typeof productPaths === "string") {
    return "products"
  }
  const localeMapping = productPaths as Record<string, string>
  const path = localeMapping[locale.toLowerCase()] || localeMapping["en-gb"]
  return path.split("/")[1] || "products"
}

export async function generateProductMetadata({
  locale,
  handle,
}: ProductRouteParams): Promise<Metadata> {
  const [data, translations] = await Promise.all([
    getProductPageData(extractCountryCode(locale), handle),
    getCachedProductTranslations(handle),
  ])

  if (!data) {
    return redirect({ href: "/", locale })
  }

  const { product } = data

  const alternates = await buildHreflangAlternates((targetLocale) => {
    const localizedHandle = translations
      ? resolveLocalizedHandle({
          handle: translations.handle,
          customTranslation: translations.custom_translation,
          locale: targetLocale,
        })
      : null

    return localizedHandle
      ? `/${targetLocale.toLowerCase()}/${getLocalizedProductSegment(
          targetLocale
        )}/${localizedHandle}`
      : null
  }, locale)

  const description = product.subtitle || product.title
  const images = product.thumbnail
    ? [
        {
          url: product.thumbnail,
          width: 1600,
          height: 900,
          type: "image/jpeg",
        },
      ]
    : []

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images,
    },
    alternates,
  }
}

export async function generateProductJsonLd({
  product,
  region,
  locale,
  handle,
}: ProductRouteParams & {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const baseUrl = getSiteUrl()
  const localePrefix = locale ? `/${locale}` : ""
  const productSegment = getLocalizedProductSegment(locale)
  const currentUrl = `${baseUrl}${localePrefix}/${productSegment}/${handle}`
  const companyInfo = await getCompanyInformation()

  const image =
    product.images?.[0]?.url ||
    product.thumbnail ||
    `${baseUrl}/product-placeholder.jpg`

  const cheapestVariant = (product.variants || [])
    .filter((v) => v.calculated_price)
    .sort(
      (a, b) =>
        (a.calculated_price?.calculated_amount || 0) -
        (b.calculated_price?.calculated_amount || 0)
    )[0]

  const price = cheapestVariant?.calculated_price?.calculated_amount || 0
  const currencyCode = region.currency_code?.toUpperCase() || "GBP"
  const priceValidUntil = new Date()
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1)

  const inStock =
    !cheapestVariant?.manage_inventory ||
    (cheapestVariant?.inventory_quantity ?? 0) > 0

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
        {
          name: "Christmas pyjamas",
          url: `${baseUrl}${localePrefix}/${productSegment}`,
        },
        { name: product.title || "", url: currentUrl },
      ]),
      {
        "@type": "Product",
        "@id": `${currentUrl}/#richSnippet`,
        name: product.title || "",
        description:
          product.subtitle ||
          product.description ||
          product.title ||
          "Christmas product from Hecten",
        sku: product.id || handle,
        category: "Christmas pyjamas",
        brand: "Hecten",
        image,
        url: currentUrl,
        offers: {
          "@type": "Offer",
          url: currentUrl,
          sku: cheapestVariant?.sku || product.id || handle,
          price: price.toString(),
          priceCurrency: currencyCode,
          priceValidUntil: priceValidUntil.toISOString().split("T")[0],
          availability: inStock
            ? "http://schema.org/InStock"
            : "http://schema.org/OutOfStock",
          seller: { "@id": `${baseUrl}/#organization` },
        },
      },
    ],
  }
}
