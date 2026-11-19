import { Metadata } from "next"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import {
  buildHreflangAlternates,
  getLocalizedMetadata,
} from "@lib/util/metadata"
import { extractCountryCode } from "@lib/util/locale"
import { getSiteUrl } from "@lib/util/env"
import { getCompanyInformation } from "@lib/data/information"
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@lib/util/jsonld-utils"

import JsonLd from "@modules/common/components/json-ld"
import Hero from "@modules/home/components/hero"
import AudienceSection from "@modules/home/components/audience-section"
import BestSellersSection from "@modules/home/components/best-sellers-section"
import ProductCarouselSkeleton from "@modules/home/components/product-carousel/skeleton"
import FeaturedCategoriesSection from "@modules/home/components/featured-categories-section"
import StayFocusSection from "@modules/home/components/stay-focus-section"
import NewArrivalsSection from "@modules/home/components/new-arrivals-section"

async function generatePageJsonLd(locale: string, description: string) {
  const baseUrl = getSiteUrl()
  const localePrefix = locale && locale !== "en" ? `/${locale}` : ""
  const currentUrl = `${baseUrl}${localePrefix}/`
  const companyInfo = await getCompanyInformation()

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(companyInfo, baseUrl),
      buildWebsiteJsonLd(companyInfo, baseUrl, currentUrl, locale),
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/#webpage`,
        url: currentUrl,
        name: "Home - " + (companyInfo?.name || "Hecten"),
        description,
        isPartOf: { "@id": `${baseUrl}/#website` },
        about: { "@id": `${baseUrl}/#organization` },
        inLanguage: locale || "en",
        datePublished: "2022-09-06T14:23:20+02:00",
        dateModified: new Date().toISOString(),
      },
    ],
  }
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: currentLocale } = await props.params
  const alternates = await buildHreflangAlternates(
    (locale) => `/${locale.toLowerCase()}`,
    currentLocale
  )

  const baseMetadata = await getLocalizedMetadata(
    "Metadata.Home",
    undefined,
    alternates
  )
  const baseUrl = getSiteUrl()

  return {
    ...baseMetadata,
    openGraph: {
      title: baseMetadata.title as string,
      description: baseMetadata.description as string,
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
      title: baseMetadata.title as string,
      description: baseMetadata.description as string,
      images: [`${baseUrl}/twitter-image.jpg`],
    },
  }
}

export default async function Home(props: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  const countryCode = extractCountryCode(locale)

  const t = await getTranslations("Metadata.Home")
  const description = t("description")

  const jsonLd = await generatePageJsonLd(locale, description)

  return (
    <>
      <JsonLd id="homepage-jsonld" data={jsonLd} />
      <Hero />
      <AudienceSection />
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <BestSellersSection countryCode={countryCode} />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedCategoriesSection />
      </Suspense>
      <StayFocusSection />
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <NewArrivalsSection countryCode={countryCode} />
      </Suspense>
    </>
  )
}
