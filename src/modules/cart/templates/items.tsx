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
    <section className="font-[system-ui]">
      <header className="flex items-center gap-x-3 pb-4 border-b border-[#e5e5e5]">
        <h1 className="text-[22px] leading-[30px] font-semibold text-black">
          {t("heading")}
        </h1>
        <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[13px] font-semibold text-[#494949]">
          {itemCount}
        </span>
      </header>

      {items ? (
        <ul className="flex flex-col divide-y divide-[#e5e5e5] border-b border-[#e5e5e5]">
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
