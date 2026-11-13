"use client"

import { useEffect, useRef, useState } from "react"
import { InstantSearch, useHits, useSearchBox } from "react-instantsearch"
import { useLocale, useTranslations } from "next-intl"

import { SEARCH_INDEX_NAME, searchClient } from "@lib/config"
import { normalizeLocaleToApi } from "@lib/util/locale"
import { useRouter } from "@i18n/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"
import { SearchIcon } from "@modules/common/icons/header-icons"
import { ProductHit } from "@modules/search/components/hit"

// Few enough rows that the "See all" button is visible without scrolling
const MAX_HITS = 5

// Fixed 55x55 thumbnail; the placeholder never grows past the row
const Thumb = ({ url, alt }: { url: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[#f2f2f2]" />}
      <Image
        src={url}
        alt={alt}
        fill
        sizes="55px"
        onLoad={() => setLoaded(true)}
        className={`object-contain duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}

const Results = ({ query, onNavigate }: { query: string; onNavigate: () => void }) => {
  const t = useTranslations("Search")
  const locale = useLocale()
  const normalizedLocale = normalizeLocaleToApi(locale)
  const { refine } = useSearchBox()
  const { hits, results } = useHits<ProductHit>()

  useEffect(() => {
    refine(query)
  }, [query, refine])

  const trimmed = query.trim()
  const isLoading = !results || results.query !== query
  const localized = (hit: ProductHit) => ({
    title:
      locale === "en-gb"
        ? hit.title
        : hit.locales?.[normalizedLocale]?.title || hit.title,
    handle:
      locale === "en-gb"
        ? hit.handle
        : hit.locales?.[normalizedLocale]?.handle || hit.handle,
  })

  if (!isLoading && trimmed && hits.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] leading-[20px] text-[#323232]">
        {t("ShowAll.noResults")}
      </p>
    )
  }

  return (
    <>
      <ul>
        {hits.slice(0, MAX_HITS).map((hit) => {
          const { title, handle } = localized(hit)
          const description = hit.description?.replace(/<[^>]*>/g, " ").trim()
          return (
            <li key={hit.id} className="border-b border-[#d6d6d6]">
              <LocalizedClientLink
                href={{ pathname: "/products/[handle]", params: { handle } }}
                onClick={onNavigate}
                className="flex p-[10px] text-[#323232]"
                data-testid="search-result"
              >
                <div className="shrink-0 w-[60px] h-[65px] py-[5px] pr-[5px]">
                  {hit.thumbnail && <Thumb url={hit.thumbnail} alt={title} />}
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center px-[10px]">
                  <h3
                    className="text-[13px] leading-[18.2px] font-bold"
                    data-testid="search-result-title"
                  >
                    {title}
                  </h3>
                  {description && (
                    <p className="text-[13px] leading-[20px] truncate">
                      {description}
                    </p>
                  )}
                </div>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
      {hits.length > 0 && (
        <LocalizedClientLink
          href={
            trimmed
              ? { pathname: "/results/[query]", params: { query: trimmed } }
              : "/shop"
          }
          onClick={onNavigate}
          className="block h-[40px] bg-[#373636] text-center text-[11px] leading-[40px] font-semibold uppercase tracking-[0.22px] text-white"
        >
          {t("Dropdown.viewAll")}
        </LocalizedClientLink>
      )}
    </>
  )
}

/**
 * Inline header search. Typing filters products in a dropdown panel under the
 * field. Search is only initialised after the first focus to avoid a request
 * on every page load.
 */
export default function HeaderSearch({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("NavBar.Main.IconMenu")
  const router = useRouter()
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [activated, setActivated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const openPanel = () => {
    setActivated(true)
    setOpen(true)
  }

  const close = () => {
    setOpen(false)
    inputRef.current?.blur()
  }

  const onNavigate = () => {
    setOpen(false)
    setValue("")
  }

  // Close on Escape or on a click outside the search field and panel
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointerDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative z-[70] w-full">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            const q = value.trim()
            if (!q) return
            router.push({ pathname: "/results/[query]", params: { query: q } })
            onNavigate()
            inputRef.current?.blur()
          }}
          className={`flex items-center gap-x-[14px] ${compact ? "h-[44px]" : "h-[55px]"} pl-[18px] pr-[10px] bg-[#f8f8f8] border border-[#f8f8f8] rounded-[4.8px] focus-within:border-[#999] focus-within:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]`}
        >
          <SearchIcon className="shrink-0 text-[#ccc]" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (!open) openPanel()
            }}
            onFocus={openPanel}
            placeholder={t("Search")}
            aria-label={t("Search")}
            autoComplete="off"
            spellCheck={false}
            className="search-input-no-clear flex-1 min-w-0 p-0 border-0 shadow-none bg-transparent font-[Arial] text-[13.33px] text-black placeholder:text-[#999] focus:outline-none"
          />
          {/* Mobile only: clears the query and closes the results */}
          {compact && (value || open) && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setValue("")
                close()
              }}
              className="shrink-0 p-1 text-[18px] text-[#666]"
            >
              <RxCross2 />
            </button>
          )}
        </form>

        {activated && (
          <div
            className={`absolute left-0 right-0 top-full bg-white border border-[#d6d6d6] font-[system-ui] ${
              open ? "" : "hidden"
            }`}
          >
            <InstantSearch
              indexName={SEARCH_INDEX_NAME}
              searchClient={searchClient}
            >
              <Results query={value} onNavigate={onNavigate} />
            </InstantSearch>
          </div>
        )}
    </div>
  )
}
