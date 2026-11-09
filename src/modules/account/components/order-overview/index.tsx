"use client"

import { ShoppingBag } from "@medusajs/icons"
import { Button } from "@medusajs/ui"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { useTranslations } from "next-intl"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  const t = useTranslations("Account.OrderOverview")

  if (orders?.length) {
    return (
      <div className="flex w-full flex-col gap-y-4">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col items-center gap-y-3 rounded-xl border border-dashed border-line px-6 py-14 text-center"
      data-testid="no-orders-container"
    >
      <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-surface text-secondary">
        <ShoppingBag />
      </span>
      <h2 className="text-lg font-semibold text-black">{t("emptyTitle")}</h2>
      <p className="max-w-sm text-[15px] text-secondary">
        {t("emptyDescription")}
      </p>
      <div className="mt-3">
        <LocalizedClientLink href="/" passHref>
          <Button data-testid="continue-shopping-button" size="large">
            {t("continueShopping")}
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
