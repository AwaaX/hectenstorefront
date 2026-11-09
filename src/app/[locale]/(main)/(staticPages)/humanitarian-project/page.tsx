import { Metadata } from "next"
import { generateStaticPageMetadata } from "@lib/seo/static-pages-metadata"
import StaticPageJsonLd from "@modules/static-pages/components/static-page-json-ld"
import HumanitarianContent from "./content"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return generateStaticPageMetadata("humanitarian-project", locale)
}

export default async function HumanitarianProjectPage(props: Props) {
  const { locale } = await props.params

  return (
    <>
      <StaticPageJsonLd pageType="humanitarian-project" locale={locale} />
      <HumanitarianContent />
    </>
  )
}
