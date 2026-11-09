import { Metadata } from "next"
import { generateStaticPageMetadata } from "@lib/seo/static-pages-metadata"
import StaticPageJsonLd from "@modules/static-pages/components/static-page-json-ld"
import ClientComponent from "./client-component"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return generateStaticPageMetadata("customer-service", locale)
}

export default async function CustomerServicePage(props: Props) {
  const { locale } = await props.params

  return (
    <>
      <StaticPageJsonLd pageType="customer-service" locale={locale} />
      <ClientComponent />
    </>
  )
}
