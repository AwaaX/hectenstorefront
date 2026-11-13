import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { listCategories } from "@lib/data/categories"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
// import WishlistNavLink from "@modules/layout/components/wishlist-nav-link"

import { getTranslations } from "next-intl/server"
import Link from "next/link"
import {
  AccountIcon,
  HelpIcon,
  OrderIcon,
} from "@modules/common/icons/header-icons"
import Image from "next/image"

import NavMenu from "@modules/layout/components/nav-menu"
import MobileMenu from "./MobileMenu"
import StickyCategoryBar from "./StickyCategoryBar"
import CountrySelect from "@modules/layout/components/country-select"
import { ArrowRightMini } from "@medusajs/icons"
import { RegionSelector } from "@modules/common/components/swh/selectors"
import SearchModalPopup from "@modules/search/templates/search-modal-popup"
import HeaderSearch from "@modules/search/templates/header-search"
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
      {/* Top Bar */}
      <div className="max-md:hidden bg-[#f8f8f8] text-black font-[system-ui] text-[14px] leading-[21px]">
        <div className="content-container flex items-center justify-between h-[33px] gap-x-6">
          <p role="banner" aria-label={top("alert")} className="truncate text-[14px] leading-[21px]">
            {top("alert")}
          </p>
          {/* Region Selection */}
          <div className="shrink-0">
            <RegionSelector regions={regions} variant="native" />
          </div>
        </div>
      </div>
      {/* Main Header */}
      <header
        id="header"
        className="sticky lg:static top-0 inset-x-0 z-50 bg-white font-[system-ui] max-lg:shadow-[0_1px_15px_0_rgba(0,0,0,0.08)]"
        suppressHydrationWarning
      >
        <nav className="content-container flex items-center h-[40px] lg:h-[77px] gap-x-4">
          {/* Mobile Menu */}
          <div className="flex-1 basis-0 flex items-center lg:hidden">
            <MobileMenu categories={categories} />
          </div>

          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="shrink-0"
            data-testid="nav-store-link"
          >
            <Image
              src={siteBrandInfo?.logo as string}
              alt={siteBrandInfo?.name as string}
              priority={true}
              width={156}
              height={100}
              className="w-[104.52px] h-auto"
            />
          </LocalizedClientLink>

          {/* Search Bar */}
          <div className="max-lg:hidden flex-1 ml-[31px] mr-2">
            <HeaderSearch />
          </div>

          {/* Icons */}
          <div className="flex-1 basis-0 lg:flex-none lg:basis-auto flex items-center justify-end h-full gap-x-3 lg:gap-x-0">
            {/* Account */}
            <LocalizedClientLink
              className="flex flex-col items-center justify-center text-black hover:text-hoverGray duration-300 lg:h-[56px] lg:px-[17px]"
              href="/account"
              data-testid="nav-account-link"
              aria-label={main("Account")}
            >
              <AccountIcon className="max-lg:w-[24px] max-lg:h-[24px]" />
              <span className="max-lg:hidden mt-1 text-[14px] leading-[21px] whitespace-nowrap">
                {main("Account")}
              </span>
            </LocalizedClientLink>

            {/* WishList (hidden for now) */}
            {/* <WishlistNavLink label={main("Wishlist")} /> */}

            {/* Get help */}
            <LocalizedClientLink
              className="max-lg:hidden flex flex-col items-center justify-center text-black hover:text-hoverGray duration-300 h-[56px] px-[17px] border-l border-[#eee]"
              href="/customer-service"
              aria-label={main("Help")}
            >
              <HelpIcon />
              <span className="mt-1 text-[14px] leading-[21px] whitespace-nowrap">
                {main("Help")}
              </span>
            </LocalizedClientLink>

            {/* Order */}
            <LocalizedClientLink
              className="max-lg:hidden flex flex-col items-center justify-center text-black hover:text-hoverGray duration-300 h-[56px] px-[17px] border-l border-[#eee]"
              href="/checkout"
              aria-label={main("Order")}
            >
              <OrderIcon />
              <span className="mt-1 text-[14px] leading-[21px] whitespace-nowrap">
                {main("Order")}
              </span>
            </LocalizedClientLink>

            {/* Cart */}
            <div className="flex items-center h-full lg:ml-5">
              <CartButton />
            </div>
          </div>
        </nav>
        {/* Mobile search: second row of the sticky header, so the header
            shadow sits below it */}
        <div className="lg:hidden content-container pb-[10px]">
          <HeaderSearch compact />
        </div>
      </header>
      {/* Category Navigation */}
      <StickyCategoryBar
        alt={siteBrandInfo?.name as string}
      >
        <NavMenu categories={categories} />
      </StickyCategoryBar>
      {/* Promo Bar */}
      <div className="bg-[#f8f8f8] text-black font-[system-ui] text-[14px] leading-[21px]">
        <div className="content-container min-h-[45px] py-3 flex items-center justify-center text-center">
          <LocalizedClientLink
            href="/shop"
            className="hover:text-hoverGray duration-300"
          >
            {middle("alert", { year: currentYear })}
          </LocalizedClientLink>
        </div>
      </div>
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
