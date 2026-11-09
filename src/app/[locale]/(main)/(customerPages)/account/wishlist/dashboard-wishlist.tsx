import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { retrieveCustomer } from "@lib/data/customer"
import { getWishlistDisplayItems, retrieveWishlist } from "@lib/data/wishlist"
import { WishlistShareHeader } from "@modules/wishlist/components/share-button"
import WishlistItemsGrid from "@modules/wishlist/components/items-grid"
import { getLocalizedMetadata } from "@lib/util/metadata"
import { extractCountryCode } from "@lib/util/locale"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Account.Wishlist")
}

export default async function AccountWishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const countryCode = extractCountryCode((await params).locale)
  const t = await getTranslations("Account.Pages.Wishlist")
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const wishlist = await retrieveWishlist()
  const items = await getWishlistDisplayItems({
    countryCode,
    wishlist,
  })

  return (
    <div className="flex flex-col" data-testid="account-wishlist-page">
      <WishlistShareHeader
        title={t("heading")}
        description={t("description")}
        disabled={!items.length}
      />
      <WishlistItemsGrid
        emptyMessage={t("emptyMessage")}
        interactive
        items={items}
      />
    </div>
  )
}
