import {
  generateStaticPageJsonLd,
  type StaticPageType,
} from "@lib/seo/static-pages-metadata"
import JsonLd from "@modules/common/components/json-ld"

type StaticPageJsonLdProps = {
  pageType: StaticPageType
  locale: string
}

export default async function StaticPageJsonLd({
  pageType,
  locale,
}: StaticPageJsonLdProps) {
  const jsonLd = await generateStaticPageJsonLd(pageType, locale)

  return <JsonLd id={`${pageType}-jsonld`} data={jsonLd} />
}
