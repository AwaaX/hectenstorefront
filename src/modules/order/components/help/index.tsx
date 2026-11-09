import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { getTranslations } from "next-intl/server"

const Help = async () => {
  const t = await getTranslations("Order.Help")

  return (
    <div className="flex flex-col gap-2">
      <Heading className="text-sm font-medium text-ui-fg-subtle mb-1">
        {t("heading")}
      </Heading>
      <LocalizedClientLink
        href="/customer-service"
        className="flex items-center gap-2 text-sm text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        {t("contact")}
      </LocalizedClientLink>
      <LocalizedClientLink
        href="/return-and-refund"
        className="flex items-center gap-2 text-sm text-ui-fg-interactive hover:text-ui-fg-interactive-hover transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
        {t("returns")}
      </LocalizedClientLink>
    </div>
  )
}

export default Help
