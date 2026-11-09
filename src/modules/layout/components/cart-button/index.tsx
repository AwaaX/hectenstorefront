import { retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import CartDropdown from "../cart-dropdown"

export default async function CartButton() {
  const cart = await retrieveCart().catch(() => null)

  const shippingOptions = cart?.id
    ? await listCartShippingMethods(cart.id).catch(() => null)
    : null

  return <CartDropdown cart={cart as any} shippingOptions={shippingOptions ?? []} />
}
