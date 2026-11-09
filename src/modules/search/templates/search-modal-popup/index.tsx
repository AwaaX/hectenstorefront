"use client"

import { InstantSearch } from "react-instantsearch"
import { useSearchModal } from "@modules/search/context/search-modal-context"
import { XMark, MagnifyingGlassMini } from "@medusajs/icons"

import Hit from "@modules/search/components/hit"
import Hits from "@modules/search/components/hits"
import SearchBox from "@modules/search/components/search-box"
import { useEffect, useRef } from "react"
import { SEARCH_INDEX_NAME, searchClient } from "@lib/config"

export default function SearchModalPopup() {
  const { isOpen, close } = useSearchModal()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && event.target === modalRef.current) {
        close()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }
    }

    document.addEventListener("click", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("click", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm transition-opacity duration-200"
    >
      <div className="fixed inset-0 flex items-start justify-center pt-[100px] md:pt-[150px] px-4 sm:px-6">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-top-8 duration-300">
          <InstantSearch
            indexName={SEARCH_INDEX_NAME}
            searchClient={searchClient}
          >
            <div className="flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
              {/* Search Input Section */}
              <div className="flex items-center gap-x-3 px-4 md:px-6 py-5 border-b border-gray-100 bg-gray-50">
                <MagnifyingGlassMini className="text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <SearchBox />
                </div>
                <button
                  onClick={close}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-md"
                  aria-label="Close search"
                >
                  <XMark />
                </button>
              </div>

              {/* Search Results */}
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto no-scrollbar">
                <div className="px-4 md:px-6 py-6">
                  <Hits hitComponent={Hit} />
                </div>
              </div>
            </div>
          </InstantSearch>
        </div>
      </div>
    </div>
  )
}
