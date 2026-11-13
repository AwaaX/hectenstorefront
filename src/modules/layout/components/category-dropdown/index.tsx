"use client"
import { Popover, Transition } from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React, { Fragment } from "react"
import { MdKeyboardArrowDown } from "react-icons/md"
import { useToggleState } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"

/**
 * Fixed submenu slots, each pinned to a backend category `rank`.
 * The display label stays constant no matter which category currently
 * occupies that rank; only the link target follows whatever the backend
 * ranks into that position. This keeps the menu stable while letting
 * merchandising reorder categories from the Medusa admin.
 * The link includes the parent category's handle (if any) so nested
 * categories resolve to their full path, matching NavMenu's behavior.
 */
const RANKED_SUBMENU: { name: string; rank: number }[] = [
  { name: "baby", rank: 6 },
  { name: "kid", rank: 5 },
  { name: "women", rank: 3 },
  { name: "men", rank: 4 },
]

const CategoryDropdown = ({
  categories = [],
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const main = useTranslations("NavBar.Main.NavMenu")

  const subMenuLinks = RANKED_SUBMENU.map(({ name, rank }) => {
    const category = categories.find((c) => c.rank === rank)
    if (!category?.handle) return null
    const parentHandle = category.parent_category?.handle ?? null
    return {
      name,
      segments: [parentHandle, category.handle].filter(Boolean) as string[],
    }
  }).filter((link): link is { name: string; segments: string[] } => link !== null)

  const mainMenu = categories.find((c) => c.parent_category_id === null)

  const toggleState = useToggleState()

  // The panel is positioned against the full-width category bar (the nearest
  // positioned ancestor), so this wrapper must not be `relative`.
  return (
    <div
      onMouseEnter={toggleState.open}
      onMouseLeave={toggleState.close}
      className="flex items-center h-full"
    >
      <Popover className="h-full text-[16px]">
        <Popover.Button className="h-full outline-none">
          <LocalizedClientLink
            className="flex items-center h-full gap-x-[6px] whitespace-nowrap capitalize"
            onClick={toggleState.close}
            // @ts-expect-error
            href={mainMenu?.handle ? `/${mainMenu.handle}` : "/shop"}
            data-testid="nav-cart-link"
          >
            <span className="nav-underline">{main("all pyjamas")}</span>
            <MdKeyboardArrowDown
              className={`text-[14px] transition-transform duration-300 ${
                toggleState.state ? "rotate-180" : ""
              }`}
            />
          </LocalizedClientLink>
        </Popover.Button>
        <Transition
          show={toggleState.state}
          as={Fragment}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Panel
            static
            className="absolute top-full left-0 right-0 z-10 bg-white border-t border-[#eee]"
          >
            {/* Dims the page below the panel; ignores the pointer so moving
                onto it still closes the menu */}
            <div
              aria-hidden
              className="absolute top-full left-0 right-0 h-screen bg-black/70 pointer-events-none"
            />
            <ul className="flex justify-center py-10">
              <li className="w-[294px] px-[25px] py-[4.8px] border-x border-[#eee]">
                <span className="block mb-1 py-[2.4px] text-[16px] leading-[24px] font-semibold text-[#111]">
                  {main("whoFor")}
                </span>
                <ul>
                  {subMenuLinks.map((c, index) => (
                    <li key={"category" + index} className="mb-1">
                      <LocalizedClientLink
                        onClick={toggleState.close}
                        href={{
                          pathname: "/[...category]",
                          params: { category: c.segments },
                        }}
                        className="inline-block py-[2.4px] text-[16px] leading-[24px] text-black capitalize hover:underline"
                      >
                        {main(c.name)}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CategoryDropdown
