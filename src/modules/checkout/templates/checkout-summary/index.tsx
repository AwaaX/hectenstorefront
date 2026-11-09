import { convertToLocale } from "@lib/util/money"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode, {
  discountCodeCardClass,
} from "@modules/checkout/components/discount-code"
import SummaryCard from "@modules/checkout/components/summary-card"
import CartTotals from "@modules/common/components/cart-totals"
import { getLocale, getTranslations } from "next-intl/server"

const CheckoutSummary = async ({ cart }: { cart: any }) => {
  const t = await getTranslations("Checkout.Summary")
  const locale = await getLocale()

  const itemCount = (cart.items ?? []).reduce(
    (count: number, item: { quantity: number }) => count + item.quantity,
    0
  )

  return (
    <SummaryCard
      heading={t("heading")}
      itemCount={itemCount}
      total={convertToLocale({
        amount: cart.total ?? 0,
        currency_code: cart.currency_code,
        locale,
      })}
    >
      <ItemsPreviewTemplate cart={cart} />

      {/* The promo code component is shared with the cart page, so it is
          restyled from here instead of being changed. */}
      <div
        className={`border-t border-ui-border-base px-5 py-4 small:px-7 ${discountCodeCardClass}`}
      >
        <DiscountCode cart={cart} />
      </div>

      {/* hide CartTotals' own closing rule, the card provides the edge */}
      <div className="border-t border-ui-border-base bg-ui-bg-subtle px-5 py-5 small:px-7 small:py-6 [&>div>div:last-child]:hidden">
        <CartTotals totals={cart} />
      </div>
    </SummaryCard>
  )
}

export default CheckoutSummary
