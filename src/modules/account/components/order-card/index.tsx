import { Button } from "@medusajs/ui"
import { useMemo } from "react"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderStatusBadge from "@modules/account/components/order-status-badge"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { useLocale, useTranslations } from "next-intl"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const VISIBLE_ITEMS = 3

const OrderCard = ({ order }: OrderCardProps) => {
  const t = useTranslations("Account.OrderCard")
  const tOverview = useTranslations("Account.Overview")
  const locale = useLocale()
  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  return (
    <div
      className="overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
      data-testid="order-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line bg-surface/60 px-5 py-4">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 xsmall:flex xsmall:flex-wrap">
          <div className="flex flex-col gap-y-0.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
              {tOverview("orderNumber")}
            </dt>
            <dd className="text-sm font-semibold text-black">
              #<span data-testid="order-display-id">{order.display_id}</span>
            </dd>
          </div>
          <div className="flex flex-col gap-y-0.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
              {tOverview("datePlaced")}
            </dt>
            <dd
              className="text-sm text-black"
              data-testid="order-created-at"
              suppressHydrationWarning
            >
              {new Date(order.created_at).toLocaleDateString(locale, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
          <div className="flex flex-col gap-y-0.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
              {tOverview("totalAmount")}
            </dt>
            <dd
              className="text-sm font-semibold text-black"
              data-testid="order-amount"
            >
              {convertToLocale({
                locale,
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </dd>
          </div>
        </dl>
        <OrderStatusBadge status={order.fulfillment_status} />
      </div>

      <div className="flex flex-col gap-5 p-5 small:flex-row small:items-end small:justify-between">
        <ul className="flex min-w-0 flex-1 flex-col gap-y-3">
          {order.items?.slice(0, VISIBLE_ITEMS).map((i) => {
            return (
              <li
                key={i.id}
                className="flex items-center gap-x-3"
                data-testid="order-item"
              >
                <Thumbnail
                  thumbnail={i.thumbnail}
                  images={[]}
                  size="square"
                  className="w-14 shrink-0 rounded-lg p-0"
                />
                <div className="flex min-w-0 flex-col text-sm">
                  <span
                    className="truncate font-medium text-black"
                    data-testid="item-title"
                  >
                    {i.title}
                  </span>
                  <span className="text-secondary">
                    x <span data-testid="item-quantity">{i.quantity}</span>
                  </span>
                </div>
              </li>
            )
          })}
          {numberOfProducts > VISIBLE_ITEMS && (
            <li className="pl-[68px] text-sm text-secondary">
              + {numberOfProducts - VISIBLE_ITEMS} {t("more")}
            </li>
          )}
        </ul>
        <div className="flex items-center justify-between gap-4 small:flex-col small:items-end">
          <span className="text-sm text-secondary">
            {t("itemCount", { count: numberOfLines })}
          </span>
          <LocalizedClientLink
            href={{
              pathname: "/account/orders/details/[id]",
              params: { id: order.id },
            }}
          >
            <Button data-testid="order-details-link" variant="secondary">
              {t("seeDetails")}
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default OrderCard
