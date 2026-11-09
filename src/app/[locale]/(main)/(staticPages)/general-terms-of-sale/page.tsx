import { Metadata } from "next"
import { generateStaticPageMetadata } from "@lib/seo/static-pages-metadata"
import StaticContentPage from "@modules/static-pages/templates/static-content-page"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params
  return generateStaticPageMetadata("general-terms-of-sale", locale)
}

export default async function GeneralTermsOfSalePage(props: Props) {
  const { locale } = await props.params

  return (
    <StaticContentPage
      pageType="general-terms-of-sale"
      namespace="StaticPages.GeneralTermsOfSale"
      locale={locale}
      showBreadcrumb={false}
    />
  )
}
