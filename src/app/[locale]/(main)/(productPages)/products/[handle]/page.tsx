import { Metadata } from "next"
import { permanentRedirect, redirect } from "@i18n/routing"
import {
  getCachedProductTranslations,
  getProductPageData,
} from "@lib/data/product-page"
import {
  generateProductJsonLd,
  generateProductMetadata,
} from "@lib/seo/product-page"
import { getProductStaticParams } from "@lib/static-params"
import { extractCountryCode } from "@lib/util/locale"
import { resolveLocalizedHandle } from "@lib/util/localized-handle"
import { getBreadcrumbCategories } from "@lib/util/product"
import JsonLd from "@modules/common/components/json-ld"
import { BreadcrumbsNavigation } from "@modules/common/components/swh/navigation"
import ProductTemplate from "@modules/products/templates"

type Props = {
  params: Promise<{ locale: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export function generateStaticParams() {
  return getProductStaticParams()
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  return generateProductMetadata(await props.params)
}

export default async function ProductPage(props: Props) {
  const { locale, handle } = await props.params
  const { v_id: selectedVariantId } = await props.searchParams
  const countryCode = extractCountryCode(locale)

  const [data, translations] = await Promise.all([
    getProductPageData(countryCode, handle),
    getCachedProductTranslations(handle),
  ])

  if (!data) {
    return redirect({ href: "/", locale })
  }

  // Products resolve by any locale's handle; send visitors to this locale's one
  const localizedHandle = translations
    ? resolveLocalizedHandle({
        handle: translations.handle,
        customTranslation: translations.custom_translation,
        locale,
      })
    : null

  if (localizedHandle && localizedHandle !== decodeURIComponent(handle)) {
    return permanentRedirect({
      href: {
        pathname: "/products/[handle]",
        params: { handle: localizedHandle },
        query: selectedVariantId ? { v_id: selectedVariantId } : undefined,
      },
      locale,
    })
  }

  const { product, region } = data
  const jsonLd = await generateProductJsonLd({
    product,
    region,
    locale,
    handle,
  })

  return (
    <>
      <JsonLd id="product-jsonld" data={jsonLd} />
      <BreadcrumbsNavigation
        title={product.title}
        hideMainTitle={true}
        localizeTitle={false}
        parents={getBreadcrumbCategories(product.categories ?? [])}
      />
      <ProductTemplate
        product={product}
        region={region}
        countryCode={countryCode}
        selectedVariantId={selectedVariantId}
      />
    </>
  )
}
