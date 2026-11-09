"use client"

import { ChevronDown } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import React, { useState } from "react"

type SummaryCardProps = {
  heading: string
  /** Total number of items (sum of quantities). */
  itemCount: number
  /** Already formatted order total, shown in the collapsed mobile bar. */
  total: string
  children: React.ReactNode
}

/**
 * The order summary card. From the "small" breakpoint up it is a static card
 * with a heading; below it, it collapses into a bar showing the total that
 * opens on tap, so the form stays in front on phones.
 */
const SummaryCard = ({
  heading,
  itemCount,
  total,
  children,
}: SummaryCardProps) => {
  const t = useTranslations("Checkout.Layout")
  const [open, setOpen] = useState(false)

  return (
    <div
      className="overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm"
      data-testid="checkout-summary"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="checkout-summary-content"
        className="flex w-full items-center justify-between gap-x-3 px-5 py-4 text-left small:hidden"
      >
        <span className="flex items-center gap-x-2 text-small-semi text-ui-fg-base">
          {open ? t("hideSummary") : t("showSummary")}
          <ChevronDown
            className={clx("transition-transform duration-200", {
              "rotate-180": open,
            })}
          />
        </span>
        <span className="text-base-semi text-ui-fg-base">{total}</span>
      </button>

      <div
        id="checkout-summary-content"
        className={clx(
          "border-t border-ui-border-base small:border-t-0",
          open ? "block" : "hidden small:block"
        )}
      >
        <div className="hidden items-center justify-between px-7 pb-2 pt-6 small:flex">
          <h2 className="text-xl font-semibold text-ui-fg-base">{heading}</h2>
          <span className="rounded-full bg-ui-bg-subtle px-2.5 py-0.5 text-small-semi text-ui-fg-subtle">
            {itemCount}
          </span>
        </div>

        {children}
      </div>
    </div>
  )
}

export default SummaryCard
