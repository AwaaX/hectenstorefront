import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"

/** Props for ProductPageBreadcrumbs component */
interface ProductPageBreadcrumbsProps {
  /** Product title */
  title?: string
  /** URL path segment */
  path?: string
  /** Route parameters including category and handle */
  params?: { category?: string; handle?: string }
  /** Localized product title */
  localizedTitle?: string
}

/**
 * Product page breadcrumb navigation
 * Displays breadcrumb trail specific to product pages
 */
const ProductPageBreadcrumbs = ({
  localizedTitle,
}: ProductPageBreadcrumbsProps) => {
  const t = useTranslations("Common.Breadcrumbs")
  return (
    <div className="breadcrumb-block style-img">
      <div className="breadcrumb-main  overflow-hidden">
        <div className="container  relative">
          <nav className="link flex items-center justify-center gap-2 py-[7px] flex-wrap">
            <LocalizedClientLink href={"/"}>{t("home")}</LocalizedClientLink>
            <Icon.CaretRightIcon size={14} className="text-secondary2" />
            <LocalizedClientLink href="/shop" className="capitalize">
              {t(`Christmas Pyjamas`)}
            </LocalizedClientLink>
            <Icon.CaretRightIcon size={14} className="text-secondary2" />
            <div className="text-secondary2 capitalize text-center">
              {localizedTitle}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default ProductPageBreadcrumbs
