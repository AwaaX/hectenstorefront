import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLocalizedMetadata } from "@lib/util/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Cart")
}

export default async function Cart() {
  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return notFound()
  })


  const customer = await retrieveCustomer()
  const shippingOptions = cart?.id
    ? await listCartShippingMethods(cart.id).catch(() => null)
    : null

  return <CartTemplate cart={cart} customer={customer} shippingOptions={shippingOptions ?? []} />
}
