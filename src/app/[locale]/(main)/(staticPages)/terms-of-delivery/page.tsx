import { Metadata } from "next"
import { generateStaticPageMetadata } from "@lib/seo/static-pages-metadata"
import StaticContentPage from "@modules/static-pages/templates/static-content-page"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return generateStaticPageMetadata("terms-of-delivery", locale)
}

export default async function TermsOfDeliveryPage(props: Props) {
  const { locale } = await props.params

  return (
    <StaticContentPage
      pageType="terms-of-delivery"
      namespace="StaticPages.TermsOfDelivery"
      locale={locale}
    />
  )
}
