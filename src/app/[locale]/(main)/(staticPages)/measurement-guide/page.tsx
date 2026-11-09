import { Metadata } from "next"
import { generateStaticPageMetadata } from "@lib/seo/static-pages-metadata"
import StaticPageJsonLd from "@modules/static-pages/components/static-page-json-ld"
import ClientComponent from "./client-component"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return generateStaticPageMetadata("measurement-guide", locale)
}

export default async function MeasurementGuidePage(props: Props) {
  const { locale } = await props.params

  return (
    <>
      <StaticPageJsonLd pageType="measurement-guide" locale={locale} />
      <ClientComponent />
    </>
  )
}
