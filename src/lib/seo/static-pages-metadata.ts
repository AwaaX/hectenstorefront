import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { buildHreflangAlternates } from "@lib/util/metadata"
import { getCompanyInformation } from "@lib/data/information"
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from "@lib/util/jsonld-utils"
import { getSiteUrl } from "@lib/util/env"
import { pathnames } from "@i18n/routing"

export type StaticPageType =
  | "customer-service"
  | "privacy-policy"
  | "legal-notice"
  | "general-terms-of-sale"
  | "terms-of-delivery"
  | "return-and-refund"
  | "measurement-guide"
  | "humanitarian-project"

interface StaticPageConfig {
  namespace: string
  pathKey: string
  defaultTitle: string
}

const staticPageConfigs: Record<StaticPageType, StaticPageConfig> = {
  "customer-service": {
    namespace: "Metadata.CustomerService",
    pathKey: "/customer-service",
    defaultTitle: "Customer Service - Hecten",
  },
  "privacy-policy": {
    namespace: "Metadata.PrivacyPolicy",
    pathKey: "/privacy-policy",
    defaultTitle: "Privacy Policy - Hecten",
  },
  "legal-notice": {
    namespace: "Metadata.LegalNotice",
    pathKey: "/legal-notice",
    defaultTitle: "Legal Notice - Hecten",
  },
  "general-terms-of-sale": {
    namespace: "Metadata.GeneralTermsOfSale",
    pathKey: "/general-terms-of-sale",
    defaultTitle: "General Terms of Sale - Hecten",
  },
  "terms-of-delivery": {
    namespace: "Metadata.TermsOfDelivery",
    pathKey: "/terms-of-delivery",
    defaultTitle: "Terms of Delivery - Hecten",
  },
  "return-and-refund": {
    namespace: "Metadata.ReturnAndRefund",
    pathKey: "/return-and-refund",
    defaultTitle: "Return and Refund - Hecten",
  },
  "measurement-guide": {
    namespace: "Metadata.MeasurementGuide",
    pathKey: "/measurement-guide",
    defaultTitle: "Measurement Guide - Hecten",
  },
  "humanitarian-project": {
    namespace: "Metadata.HumanitarianProject",
    pathKey: "/humanitarian-project",
    defaultTitle: "Humanitarian Project - Hecten",
  },
}

async function getStaticPageText(config: StaticPageConfig) {
  const t = await getTranslations(config.namespace)
  const title = t("title") || config.defaultTitle
  const description = t("description") || title

  return { title, description }
}

export async function generateStaticPageMetadata(
  pageType: StaticPageType,
  locale: string
): Promise<Metadata> {
  const config = staticPageConfigs[pageType]
  const baseUrl = getSiteUrl()

  try {
    const { title, description } = await getStaticPageText(config)

    // Build hreflang alternates for all locales
    const alternates = await buildHreflangAlternates(
      (targetLocale) => {
        const pathConfig = pathnames[config.pathKey as keyof typeof pathnames]

        if (typeof pathConfig === "string") {
          return `/${targetLocale.toLowerCase()}${pathConfig}`
        }

        if (typeof pathConfig === "object" && pathConfig) {
          const localizedPath = pathConfig[targetLocale as keyof typeof pathConfig]
          return localizedPath ? `/${targetLocale.toLowerCase()}${localizedPath}` : null
        }

        return null
      },
      locale
    )

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/${locale.toLowerCase()}${getLocalizedPath(config.pathKey, locale)}`,
        type: "website",
        images: [
          {
            url: `${baseUrl}/og-image.jpg`,
            width: 1600,
            height: 900,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${baseUrl}/twitter-image.jpg`],
      },
      alternates,
    }
  } catch (error) {
    console.error(`Failed to generate metadata for ${pageType}:`, error)
    return {
      title: config.defaultTitle,
      description: config.defaultTitle,
    }
  }
}

function getLocalizedPath(pathKey: string, locale: string): string {
  const pathConfig = pathnames[pathKey as keyof typeof pathnames]

  if (typeof pathConfig === "string") {
    return pathConfig
  }

  if (typeof pathConfig === "object" && pathConfig) {
    const localizedPath = pathConfig[locale as keyof typeof pathConfig]
    return localizedPath || pathKey
  }

  return pathKey
}

export async function generateStaticPageJsonLd(
  pageType: StaticPageType,
  locale: string
) {
  const baseUrl = getSiteUrl()
  const localePrefix = locale && locale !== "en-gb" ? `/${locale}` : ""
  const config = staticPageConfigs[pageType]
  const currentUrl = `${baseUrl}${localePrefix}${getLocalizedPath(config.pathKey, locale)}`
  const [{ title, description }, companyInfo] = await Promise.all([
    getStaticPageText(config),
    getCompanyInformation(),
  ])

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(companyInfo, baseUrl),
      buildWebsiteJsonLd(companyInfo, baseUrl, `${baseUrl}${localePrefix}/`, locale),
      {
        "@type": "WebPage",
        "@id": currentUrl,
        url: currentUrl,
        name: title,
        description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#organization` },
        inLanguage: locale || "en-gb",
        dateModified: new Date().toISOString(),
      },
    ],
  }
}
