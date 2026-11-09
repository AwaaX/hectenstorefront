import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Table } from "@medusajs/ui"
import { getTranslations } from "next-intl/server"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = async ({ cart }: ItemsTemplateProps) => {
  const t = await getTranslations("Cart.Items")
  const items = cart?.items

  const itemCount = (items ?? []).reduce(
    (count, item) => count + item.quantity,
    0
  )

  return (
    <section className="rounded-2xl border border-ui-border-base bg-white shadow-sm">
      <header className="flex items-center gap-x-3 border-b border-ui-border-base px-5 py-4 small:px-7 small:py-5">
        <h1 className="text-lg font-semibold text-ui-fg-base small:text-xl">
          {t("heading")}
        </h1>
        <span className="rounded-full bg-ui-bg-subtle px-2.5 py-0.5 text-small-semi text-ui-fg-subtle">
          {itemCount}
        </span>
      </header>

      {items ? (
        <ul className="flex flex-col divide-y divide-ui-border-base px-5 small:px-7">
          {[...items]
            .sort((a, b) =>
              (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            )
            .map((item) => (
              <Item
                key={item.id}
                item={item}
                currencyCode={cart?.currency_code}
              />
            ))}
        </ul>
      ) : (
        <Table>
          <Table.Body>
            {repeat(5).map((i) => (
              <SkeletonLineItem key={i} />
            ))}
          </Table.Body>
        </Table>
      )}
    </section>
  )
}

export default ItemsTemplate
