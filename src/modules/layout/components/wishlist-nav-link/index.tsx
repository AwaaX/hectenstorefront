"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { WishlistIcon } from "@modules/common/icons/header-icons"

type WishlistNavLinkProps = {
  label: string
}

const WishlistNavLink = ({ label }: WishlistNavLinkProps) => {
  const { wishlistCount } = useWishlist()

  return (
    <LocalizedClientLink
      className="max-md:hidden flex flex-col items-center justify-center text-black hover:text-hoverGray duration-300 lg:h-[56px] lg:px-[17px] lg:border-l lg:border-[#eee]"
      href="/account/wishlist"
      data-testid="nav-cart-link"
      aria-label={label}
    >
      <span className="relative">
        <WishlistIcon />
        <span className="w-[18px] h-[18px] rounded-full bg-[#444] text-white text-[10px] leading-none flex items-center justify-center absolute -top-1.5 -right-2.5">
          {wishlistCount}
        </span>
      </span>
      <span className="max-lg:hidden mt-1 text-[14px] leading-[21px] whitespace-nowrap">
        {label}
      </span>
    </LocalizedClientLink>
  )
}

export default WishlistNavLink
