import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import AccountWishlistPage, {
  generateMetadata as generateAccountMetadata,
} from "./dashboard-wishlist"
import WishlistLogin, {
  generateMetadata as generateGuestMetadata,
} from "./guest-wishlist"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const customer = await retrieveCustomer().catch(() => null)

  return customer ? generateAccountMetadata() : generateGuestMetadata()
}

export default async function WishlistPage(props: Props) {
  const customer = await retrieveCustomer().catch(() => null)

  return customer ? (
    <AccountWishlistPage {...props} />
  ) : (
    <WishlistLogin {...props} />
  )
}
