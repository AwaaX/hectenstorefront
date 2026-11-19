import { buildCartEcommercePayload } from "@lib/analytics"
import AnalyticsEvent from "@modules/analytics/components/event"
import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
  shippingOptions = [],
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  shippingOptions?: HttpTypes.StoreCartShippingOption[]
}) => {
  const cartAnalyticsPayload = cart ? buildCartEcommercePayload(cart) : null

  return (
    <div className="plain-theme w-full bg-white">
      <div
        className="mx-auto w-full max-w-[1200px] px-4 py-6 small:py-10"
        data-testid="cart-container"
      >
        {cart?.items?.length && cartAnalyticsPayload && (
          <AnalyticsEvent
            eventName="view_cart"
            ecommerce={cartAnalyticsPayload}
          />
        )}
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 items-start gap-6 small:grid-cols-[minmax(0,1fr)_400px] small:gap-8">
            <div className="flex min-w-0 flex-col gap-y-6">
              {!customer && <SignInPrompt />}
              <ItemsTemplate cart={cart} />
            </div>

            {/* Summary sits below the items on phones, sticky beside them on desktop */}
            {cart.region && (
              <div className="small:sticky small:top-24">
                <Summary
                  cart={cart as any}
                  shippingOptions={shippingOptions}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
