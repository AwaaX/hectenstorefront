import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { listCategories } from "@lib/data/categories"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import WishlistNavLink from "@modules/layout/components/wishlist-nav-link"

import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { FaInstagram, FaRegUser, FaTiktok } from "react-icons/fa"
import Image from "next/image"

import NavMenu from "@modules/layout/components/nav-menu"
import MobileMenu from "./MobileMenu"
import CountrySelect from "@modules/layout/components/country-select"
import { ArrowRightMini } from "@medusajs/icons"
import { RegionSelector } from "@modules/common/components/swh/selectors"
import SearchButton from "@modules/search/components/search-button"
import SearchModalPopup from "@modules/search/templates/search-modal-popup"
import { getSiteBrandInformation } from "@lib/data/information"

export default async function Nav() {
  const top = await getTranslations("NavBar.Top")
  const middle = await getTranslations("NavBar.Middle")
  const main = await getTranslations("NavBar.Main.IconMenu")
  const currentYear = new Date().getFullYear()
  const [regions, locales, currentLocale, categories, siteBrandInfo] =
    await Promise.all([
      listRegions().then((regions: StoreRegion[]) => regions),
      listLocales(),
      getLocale(),
      listCategories({fields:"name,handle,rank,parent_category_id,parent_category.handle"}),
      getSiteBrandInformation(),
    ])

  return (
    <>
      {/* Top Banner */}
      <div className="relative h-[40px] mx-auto  duration-200 bg-christmas">
        <p
          role="banner"
          aria-label={top("alert")}
          className="content-container text-[12px] md:text-[15px] flex items-center justify-center h-full text-white font-medium"
        >
          {top("alert")}
        </p>
      </div>
      {/* Middle Header */}
      <div className="max-md:hidden relative h-[40px] mx-auto  duration-200 bg-white border-b border-b-gray-200 text-[15px]">
        <div className="content-container flex items-center justify-between h-full">
          <div className="flex-1 h-full flex items-center">
            <div className="flex items-center justify-start gap-6">
              <Link
                href={"https://www.instagram.com/thechristmasfabric/"}
                target="_blank"
                className=" font-normal flex items-center justify-center gap-[10px] group  hover:text-hoverGray cursor-pointer duration-300"
              >
                <FaInstagram className="text-base" />
                <p> {middle("Instagram")}</p>
              </Link>
              <Link
                href={"https://www.tiktok.com/@thechristmasfabric"}
                target="_blank"
                className=" font-normal flex items-center justify-center gap-[10px] group  hover:text-hoverGray cursor-pointer duration-300"
              >
                <FaTiktok className="text-base" />
                <p> {middle("Tiktok")}</p>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <LocalizedClientLink
              href="/shop"
              className="hover:text-hoverGray cursor-pointer duration-300 underline-gap whitespace-nowrap"
            >
              {middle("alert", { year: currentYear })}
            </LocalizedClientLink>
          </div>
          {/* Region Selection */}
          <div className="relative flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <RegionSelector regions={regions} />
          </div>
        </div>
      </div>
      {/* Main Navigation */}
      <header
        id="header"
        className="top-0 inset-x-0 z-50 group duration-500 sticky"
        suppressHydrationWarning
      >
        <div className="h-[70px] mx-auto  duration-200 bg-white ">
          <nav className="content-container flex items-center justify-between h-full px-2">
            {/* Logo */}
            <div className="flex-1 flex items-center justify-start gap-x-2">
              {/* Mobile Menu Icon */}
              <MobileMenu categories={categories} />
              <div>
                <LocalizedClientLink
                  href="/"
                  className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
                  data-testid="nav-store-link"
                >
                  <Image
                    src={siteBrandInfo?.logo as string}
                    alt={siteBrandInfo?.name as string}
                    priority={true}
                    width={156}
                    height={100}
                  />
                </LocalizedClientLink>
              </div>
            </div>

            {/* Custom NavLinks */}
            <div className="max-lg:hidden flex-1 h-full">
              <NavMenu categories={categories} />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-x-4 md:gap-x-6 h-full flex-1 basis-0 justify-end">
              {/* Account */}
              <LocalizedClientLink
                className="hover:text-hoverGray text-black font-medium duration-300 ease-in-out text-[24px] relative tag-action-ctrl max-md:hidden"
                href="/account"
                data-testid="nav-account-link"
              >
                <FaRegUser />
                <div className="tag-action-swh bg-black text-white caption2 ">
                  {main("Account")}
                </div>
              </LocalizedClientLink>

              {/* Search */}
              <SearchButton />

              {/* WishList */}
              <WishlistNavLink label={main("Wishlist")} />

              {/* Cart */}
              <CartButton />
            </div>
          </nav>
        </div>
      </header>
      <SearchModalPopup />
    </>
  )

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              Medusa Store
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            {/* <SearchModal /> */}
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
