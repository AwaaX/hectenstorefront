import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { getGuestWishlistDisplayItems } from "@lib/data/wishlist"
import WishlistItemsGrid from "@modules/wishlist/components/items-grid"
import GuestWishlistNotice from "@modules/wishlist/components/guest-notice"
import GuestWishlistSignIn, {
  GUEST_WISHLIST_SIGN_IN_ID,
} from "@modules/wishlist/components/guest-sign-in"
import AccountPageHeader from "@modules/account/components/page-header"
import { getLocalizedMetadata } from "@lib/util/metadata"
import { extractCountryCode } from "@lib/util/locale"
import { getPathname } from "@i18n/routing"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Account.LoginWishlist")
}

export default async function WishlistLogin({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const countryCode = extractCountryCode(locale)
  const t = await getTranslations("Account.Pages.Wishlist")
  const noticeT = await getTranslations("Wishlist.GuestNotice")

  const items = await getGuestWishlistDisplayItems({ countryCode })

  return (
    <div
      className="px-3 py-6 small:px-0 small:py-0"
      data-testid="guest-wishlist-page"
    >
      <AccountPageHeader
        title={t("heading")}
        description={t("guestDescription")}
      />
      <div className="flex flex-col gap-y-10">
        {items.length > 0 && (
          <GuestWishlistNotice
            heading={noticeT("heading")}
            description={noticeT("description")}
            actionHref={`#${GUEST_WISHLIST_SIGN_IN_ID}`}
            actionLabel={noticeT("cta")}
          />
        )}
        <WishlistItemsGrid
          emptyMessage={t("emptyMessage")}
          interactive
          items={items}
        />
        <GuestWishlistSignIn
          redirectTo={getPathname({ href: "/account/wishlist", locale })}
        />
      </div>
    </div>
  )
}
