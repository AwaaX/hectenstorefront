import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"
import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import CategoryDropdown from "../category-dropdown"
import { buildCategoryPathSegments } from "@lib/util/category-path"
// import { useToggleState } from '@medusajs/ui';

const NavMenu = ({
  categories = [],
}: {
  categories?: HttpTypes.StoreProductCategory[]
}) => {
  const main = useTranslations("NavBar.Main.NavMenu")
  // const toggleState=useToggleState();

  // Highlighted nav entries are pinned to backend category ranks:
  // rank 0 → "Matching pyjamas", rank 1 → "Family pyjamas". The label is
  // fixed; the link target follows whichever category holds that rank so it
  // resolves to a localized category slug like the category filter does.
  const handleForRank = (rank: number) => {
    const targetCat = categories.find((c) => c.rank === rank)
    const parentHandle = targetCat?.parent_category?.handle ?? null
    const leafHandle = targetCat?.handle
    return [parentHandle, leafHandle]
  }

  const matchingHandle = handleForRank(2)
  const familyHandle = handleForRank(1)

  const navlinks = [
    matchingHandle && {
      name: "Matching pyjamas",
      handle: {
        pathname: "/[...category]",
        params: { category: [...matchingHandle].filter(Boolean) },
      },
    },
    familyHandle && {
      name: "Family pyjamas",
      handle: {
        pathname: "/[...category]",
        params: { category: [...familyHandle].filter(Boolean) },
      },
    },
    {
      name: "Customer service",
      handle: "/customer-service",
    },
  ].filter(Boolean) as {
    name: string
    handle: React.ComponentProps<typeof LocalizedClientLink>["href"]
  }[]

  return (
    <div className=" h-full">
      <ul className="w-full flex items-center justify-between text-[16px] text-black  h-full">
        <li className="relative h-full">
          <CategoryDropdown categories={categories} />
        </li>

        {navlinks.map((item, index) => (
          <li key={item.name + index} className="navmenulink relative">
            <LocalizedClientLink
              href={item.handle}
              className=" whitespace-nowrap  px-4"
            >
              {main(item.name)}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default NavMenu
