import { Metadata } from "next"
import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { retrieveWishlist } from "@lib/data/wishlist"
import { WishlistProvider } from "@lib/context/wishlist-context"
import { getBaseURL } from "@lib/util/env"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import GeoLocalePrompt from "@modules/layout/components/geo-locale-prompt"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const [customer, cart] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
  ])

  const [wishlist, shippingOptions] = await Promise.all([
    customer ? retrieveWishlist() : null,
    cart ? listCartOptions().then(({ shipping_options }) => shipping_options) : [],
  ])

  return (
    <WishlistProvider
      initialHasCustomer={Boolean(customer)}
      initialWishlist={wishlist}
    >
      <Nav />
      <GeoLocalePrompt />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
    </WishlistProvider>
  )
}
