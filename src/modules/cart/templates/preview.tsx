"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table, clx } from "@medusajs/ui"

import SummaryItem from "@modules/checkout/components/summary-item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  if (!items) {
    return (
      <Table>
        <Table.Body data-testid="items-table">
          {repeat(5).map((i) => (
            <SkeletonLineItem key={i} />
          ))}
        </Table.Body>
      </Table>
    )
  }

  return (
    <ul
      data-testid="items-table"
      className={clx(
        "flex flex-col divide-y divide-ui-border-base px-5 pt-2 small:px-7",
        {
          "no-scrollbar max-h-[420px] overflow-y-auto overflow-x-hidden":
            hasOverflow,
        }
      )}
    >
      {[...items]
        .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
        .map((item) => (
          <SummaryItem
            key={item.id}
            item={item}
            currencyCode={cart.currency_code}
          />
        ))}
    </ul>
  )
}

export default ItemsPreviewTemplate
