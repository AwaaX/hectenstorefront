"use client"

import { useState, useEffect, Fragment, type ComponentProps } from "react"
import { Popover, Transition } from "@headlessui/react"
import { RxCross2 } from "react-icons/rx"
import { HiBars3 } from "react-icons/hi2"
import { FaRegStar, FaRegUser } from "react-icons/fa"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { IoChevronDown, IoChevronUp } from "react-icons/io5"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"

// Fixed submenu slots pinned to backend category `rank`. The label stays
// constant; only the link target follows whichever category holds the rank.
// Ranks mirror NavMenu/CategoryDropdown so mobile and desktop point to the
// same categories.
const RANKED_SUBMENU: { name: string; rank: number }[] = [
  { name: "baby", rank: 6 },
  { name: "kid", rank: 5 },
  { name: "women", rank: 3 },
  { name: "men", rank: 4 },
]

const MobileMenu = ({
  categories = [],
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const navMenu = useTranslations("NavBar.Main.NavMenu")
  const iconMenu = useTranslations("NavBar.Main.IconMenu")
  const mobileMenu = useTranslations("NavBar.Main.MobileMenu")

  // Highlighted nav entries are pinned to backend category ranks, matching
  // NavMenu: rank 2 → "Matching pyjamas", rank 1 → "Family pyjamas". The link
  // includes the parent category's handle (if any) so nested categories
  // resolve to their full path.
  const handleForRank = (rank: number) => {
    const targetCat = categories.find((c) => c.rank === rank)
    const parentHandle = targetCat?.parent_category?.handle ?? null
    const leafHandle = targetCat?.handle
    return [parentHandle, leafHandle]
  }

  const matchingHandle = handleForRank(2)
  const familyHandle = handleForRank(1)

  const navlinks = [
    matchingHandle[1] && {
      name: navMenu("Matching pyjamas"),
      handle: {
        pathname: "/[...category]",
        params: { category: [...matchingHandle].filter(Boolean) },
      },
    },
    familyHandle[1] && {
      name: navMenu("Family pyjamas"),
      handle: {
        pathname: "/[...category]",
        params: { category: [...familyHandle].filter(Boolean) },
      },
    },
    {
      name: navMenu("Customer service"),
      handle: "/customer-service",
    },
  ].filter(Boolean) as {
    name: string
    handle: ComponentProps<typeof LocalizedClientLink>["href"]
  }[]

  const subMenuLinks = RANKED_SUBMENU.map(({ name, rank }) => {
    const category = categories.find((c) => c.rank === rank)
    if (!category?.handle) return null
    const parentHandle = category.parent_category?.handle ?? null
    return {
      name: navMenu(name),
      segments: [parentHandle, category.handle].filter(Boolean) as string[],
    }
  }).filter(
    (link): link is { name: string; segments: string[] } => link !== null
  )

  const mainMenu = categories.find((c) => c.parent_category_id === null)

  const [menuOpen, setMenuOpen] = useState(false)
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const openMenu = () => setMenuOpen(true)
  const closeMenu = () => setMenuOpen(false)
  const toggleSubmenu = () => setSubmenuOpen(!submenuOpen)

  // Disable scroll on body when menu is open
  useEffect(() => {
    if (!menuOpen) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  // Close menu on escape key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])

  return (
    <div className={`relative ${menuOpen ? "z-[100]" : "z-10"}`}>
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-[100] h-[100dvh] w-screen bg-black/50 text-ui-fg-base transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "hidden opacity-0 pointer-events-none"
        }`}
      ></div>
      <Popover className="h-full">
        <Popover.Button
          onClick={openMenu}
          aria-label="Open menu"
          className="p-2 hover:text-hoverGray text-black duration-300 ease-in-out text-[20px] md:text-[32px] cursor-pointer relative tag-action-ctrl lg:hidden"
        >
          <HiBars3 />
        </Popover.Button>

        <Transition
          show={menuOpen}
          as={Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 -translate-x-full"
          enterTo="opacity-100 translate-x-0"
          leave="transition ease-in duration-300"
          leaveFrom="opacity-100 translate-x-0"
          leaveTo="opacity-0 -translate-x-full"
        >
          <Popover.Panel
            static
            className="fixed top-0 left-0 z-[110] w-screen h-[100dvh] bg-white flex flex-col"
          >
            {/* Header with Back Button */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {mobileMenu("menu")}
              </h3>
              <button
                onClick={closeMenu}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                aria-label="Close menu"
              >
                <RxCross2 className="text-2xl" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <ul className="w-full text-[16px] text-gray-900 p-0">
                <li className="border-b border-gray-100">
                  <div className="w-full py-4 px-4 md:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                    <LocalizedClientLink
                      // @ts-expect-error
                      href={mainMenu?.handle ? `/${mainMenu.handle}` : "/shop"}
                      onClick={closeMenu}
                      className="flex-1 text-left text-lg font-medium capitalize"
                    >
                      {navMenu("all pyjamas")}
                    </LocalizedClientLink>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSubmenu()
                      }}
                      className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                      aria-label="Toggle submenu"
                    >
                      {submenuOpen ? <IoChevronUp /> : <IoChevronDown />}
                    </button>
                  </div>

                  {/* Submenu */}
                  {submenuOpen && (
                    <ul className="bg-gray-50 border-t border-gray-100">
                      {subMenuLinks.map((c, index) => (
                        <li
                          key={"category" + index}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <LocalizedClientLink
                            onClick={closeMenu}
                            href={{
                              pathname: "/[...category]",
                              params: { category: c.segments },
                            }}
                            className="block w-full py-3 px-6 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium capitalize"
                          >
                            {c.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {navlinks.map((item, index) => (
                  <li
                    key={item.name + index}
                    className="border-b border-gray-100"
                  >
                    <LocalizedClientLink
                      href={item.handle}
                      onClick={closeMenu}
                      className="block w-full py-4 px-4 md:px-6 hover:bg-gray-50 transition-colors duration-200 font-medium"
                    >
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-100 bg-gray-50">
              <LocalizedClientLink
                href="/account/wishlist"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100"
              >
                <FaRegStar className="text-xl text-gray-600" />
                <h3 className="font-medium text-gray-900">
                  {iconMenu("Wishlist")}
                </h3>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/account"
                onClick={closeMenu}
                className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <FaRegUser className="text-xl text-gray-600" />
                <h3 className="font-medium text-gray-900">
                  {iconMenu("Account")}
                </h3>
              </LocalizedClientLink>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  )
}

export default MobileMenu
