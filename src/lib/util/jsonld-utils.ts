import { CompanyInformation } from "@lib/data/information"

export function buildOrganizationJsonLd(
  companyInfo: CompanyInformation | null,
  baseUrl: string
) {
  return {
    "@type": ["Store", "Organization"],
    "@id": `${baseUrl}/#organization`,
    name: companyInfo?.name || "Hecten",
    url: baseUrl,
    priceRange: "$$",
    image: `${baseUrl}/logo.jpg`,
    ...(companyInfo?.email && { email: companyInfo.email }),
    ...(companyInfo?.phone && { telephone: companyInfo.phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: companyInfo?.address || "19 Allée de Brienne",
      addressLocality: companyInfo?.city || "Toulouse",
      addressRegion: "Occitanie",
      postalCode: companyInfo?.zip || "31000",
      addressCountry: companyInfo?.country || "FR",
    },
    openingHours: [
      "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday 09:00-17:00",
    ],
  }
}

export function buildWebsiteJsonLd(
  companyInfo: CompanyInformation | null,
  baseUrl: string,
  currentUrl: string,
  locale: string
) {
  return {
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: currentUrl,
    name: companyInfo?.name || "Hecten",
    publisher: { "@id": `${baseUrl}/#organization` },
    inLanguage: locale || "en",
  }
}

export function buildBreadcrumbJsonLd(
  id: string,
  items: Array<{ name: string; url: string }>
) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@id": item.url,
        name: item.name,
      },
    })),
  }
}

export function buildWebPageJsonLd(
  baseUrl: string,
  currentUrl: string,
  name: string,
  description: string,
  locale: string
) {
  return {
    "@type": "WebPage",
    "@id": currentUrl,
    url: currentUrl,
    name,
    description,
    isPartOf: { "@id": `${baseUrl}/#website` },
    about: { "@id": `${baseUrl}/#organization` },
    inLanguage: locale || "en",
    dateModified: new Date().toISOString(),
  }
}
