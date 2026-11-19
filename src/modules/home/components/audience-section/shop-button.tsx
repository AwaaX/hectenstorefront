"use client"

import { ReactNode } from "react"
import { useRouter } from "@i18n/navigation"

/**
 * Dark Hecten-style button that opens the shop filtered by the product
 * "Gender" option, e.g. /shop?gender=men,unisex. Values with no matching
 * products are ignored by the shop.
 */
export default function ShopButton({
  genders,
  children,
}: {
  genders: string[]
  children: ReactNode
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() =>
        router.push({ pathname: "/shop", query: { gender: genders.join(",") } })
      }
      className="inline-flex items-center justify-center min-h-[36px] px-[10px] py-[5px] bg-[#32373c] border border-[#333] font-[system-ui] text-[16px] leading-[24px] font-semibold text-white hover:bg-black duration-300"
    >
      {children}
    </button>
  )
}
