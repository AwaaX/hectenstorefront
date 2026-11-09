"use client"

import React from "react"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import clsx from "clsx"

interface StickyFilterBarProps {
  onSortClick: () => void
  onFilterClick: () => void
  activeFiltersCount?: number
  sortLabel?: string
}

/**
 * Sticky filter bar that displays above products grid
 * Shows Sort and Filter buttons with active filter count badge
 */
const StickyFilterBar: React.FC<StickyFilterBarProps> = ({
  onSortClick,
  onFilterClick,
  activeFiltersCount = 0,
  sortLabel,
}) => {

  return (
    <div className="">
      <div className="flex items-center justify-between py-3 gap-4">
        <div className="flex items-center gap-3">
          {/* Sort Button */}
          <button
            onClick={onSortClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-line hover:bg-gray-50 transition-colors duration-200"
            aria-label="Sort products"
          >
            <Icon.FunnelSimple size={18} weight="bold" />
            <span className="text-sm font-medium">Sort</span>
          </button>

          {/* Filter Button */}
          <button
            onClick={onFilterClick}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors duration-200",
              activeFiltersCount > 0
                ? "border-black bg-black text-white hover:bg-gray-800"
                : "border-line hover:bg-gray-50"
            )}
            aria-label="Filter products"
          >
            <Icon.SlidersHorizontal size={18} weight="bold" />
            <span className="text-sm font-medium">Filter</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-white text-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default StickyFilterBar
