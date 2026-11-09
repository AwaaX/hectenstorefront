"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { useTranslations } from "next-intl"

interface BreadcrumbsNavigationProps {
  /** Page title for the breadcrumb */
  title?: string
  localizeTitle?: boolean
  hideMainTitle?: boolean
  /** Category name (not handle) - already resolved */
  parents?: { name: string; handle: string }[]
}

/**
 * Breadcrumb navigation component
 * Displays hierarchical navigation path for user orientation
 */
const BreadcrumbsNavigation: React.FC<BreadcrumbsNavigationProps> = ({
  title,
  localizeTitle = true,
  hideMainTitle = false,
  parents,
}) => {
  const t = useTranslations("Common.Breadcrumbs")

  const currentPageTitle = localizeTitle ? t(`${title}`) : title



  return (
    <div className="breadcrumb-block style-img">
      <div className="breadcrumb-main overflow-hidden">
        <nav className="container relative">
          <div className="link flex items-center justify-center gap-2 py-[7px]  flex-wrap">
            {/* Home Link */}
            <LocalizedClientLink href={"/"}>{t("home")}</LocalizedClientLink>

            {title != "shop" && (
              <>
                <Icon.CaretRightIcon size={14} className="text-secondary2" />
                <LocalizedClientLink href={"/shop"}>
                  {t("shop")}
                </LocalizedClientLink>
              </>
            )}

            {parents?.map((parent) => {
              const segments = parent.handle.split("/").filter(Boolean)
              // "/pijamas-navidenas/familiar" -> ["pijamas-navidenas", "familiar"]

              return (
                <span
                  key={parent.handle}
                  className="flex items-center justify-center gap-2 flex-wrap"
                >
                  <Icon.CaretRightIcon size={14} className="text-secondary2" />
                  <LocalizedClientLink
                    href={{
                      pathname: "/[...category]",
                      params: { category: segments },
                    }}
                  >
                    {parent.name}
                  </LocalizedClientLink>
                </span>
              )
            })}

            {/* Category Link */}
            {currentPageTitle && (
              <>
                <Icon.CaretRightIcon size={14} className="text-secondary2" />
                <div className="text-secondary2 capitalize text-center">
                  {currentPageTitle}
                </div>
              </>
            )}
          </div>

          {/* Page Heading */}
          {!hideMainTitle && (
            <h1 className="heading2 text-center py-5">{currentPageTitle}</h1>
          )}
        </nav>
      </div>
    </div>
  )
}

export default BreadcrumbsNavigation
