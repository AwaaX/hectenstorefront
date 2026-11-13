"use client"

import { useSearchModal } from "@modules/search/context/search-modal-context"
import { SearchIcon } from "@modules/common/icons/header-icons"
import { useTranslations } from "next-intl"

export default function SearchButton() {
  const { open } = useSearchModal()
  const t = useTranslations("NavBar.Main.IconMenu")

  // Icon only on mobile; on desktop it renders as a search field that opens
  // the search modal.
  return (
    <button
      onClick={open}
      className="flex items-center text-black hover:text-hoverGray duration-300 lg:w-full lg:h-[55px] lg:gap-x-3 lg:px-4 lg:bg-[#f8f8f8] lg:border lg:border-[#f8f8f8] lg:rounded-[5px] lg:text-[#999] lg:hover:text-black"
      aria-label={t("Search")}
    >
      <SearchIcon className="shrink-0 max-lg:w-[24px] max-lg:h-[24px] lg:text-[#ccc]" />
      <span className="max-lg:hidden text-[13px] truncate">{t("Search")}</span>
    </button>
  )
}
