"use client"

import { useSearchModal } from "@modules/search/context/search-modal-context"
import { IoSearch } from "react-icons/io5"
import { useTranslations } from "next-intl"

export default function SearchButton() {
  const { open } = useSearchModal()
  const t = useTranslations("NavBar.Main.IconMenu")

  return (
    <button
      onClick={open}
      className="hover:text-hoverGray text-black font-medium duration-300 ease-in-out text-[20px] md:text-[24px] relative tag-action-ctrl transition-colors"
      aria-label={t("Search")}
    >
      <IoSearch />
      <div className="tag-action-swh bg-black text-white caption2">
        {t("Search")}
      </div>
    </button>
  )
}
