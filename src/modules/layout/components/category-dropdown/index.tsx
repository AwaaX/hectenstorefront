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

  return (
    <div
      onMouseEnter={toggleState.open}
      onMouseLeave={toggleState.close}
      className="relative  z-50 flex items-center justify-center h-full"
    >
      <Popover className=" text-[16px]">
        <Popover.Button
          className={`capitalize relative navmenulink ${
            toggleState.state && "open"
          } h-full`}
        >
          <LocalizedClientLink
            className="flex items-center justify-center gap-2 whitespace-nowrap"
            onClick={toggleState.close}
            // @ts-expect-error
            href={mainMenu?.handle ? `/${mainMenu.handle}` : "/shop"}
            data-testid="nav-cart-link"
          >
            {main("all pyjamas")}
            <MdKeyboardArrowDown />
          </LocalizedClientLink>
        </Popover.Button>
        <Transition
          show={toggleState.state}
          as={Fragment}
          enter="transition ease-in duration-150"
          enterFrom="opacity-0 translate-y-10"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-10"
        >
          <Popover.Panel
            onMouseLeave={toggleState.close}
            static
            className="absolute top-[100%] -left-8 z-10 bg-white w-[240px] shadow-[0_0_30px_0_rgba(0,0,0,0.06)]"
          >
            <div className="px-4 py-5 flex flex-col items-center justify-center">
              {subMenuLinks.map((c, index) => (
                <LocalizedClientLink
                  key={"category" + index}
                  onClick={toggleState.close}
                  href={{
                    pathname: "/[...category]",
                    params: { category: c.segments },
                  }}
                  className="w-full py-2 px-3 hover:bg-[#eee] text-[#aaa] hover:text-black text-[16px] duration-200 ease-linear capitalize "
                >
                  {main(c.name)}
                </LocalizedClientLink>
              ))}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CategoryDropdown
