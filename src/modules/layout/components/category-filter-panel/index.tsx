'use client'

import React from 'react'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { HttpTypes } from '@medusajs/types'
import { buildCategoryPathSegments } from '@lib/util/category-path'

interface SwhCategoryFilterProps {
  /** List of product categories to display */
  categories: HttpTypes.StoreProductCategory[]
  /** Currently selected category (already resolved from params) */
  category?: string
}

/**
 * Category filter component for product navigation
 * Displays a list of categories with active state highlighting
 */
const SwhCategoryFilter: React.FC<SwhCategoryFilterProps> = ({ categories, category }) => {
  if (!categories || categories.length === 0) {
    return null
  }

  const isActiveCategory = (itemHandle: string): boolean => {
    if (!category) return false
    return decodeURIComponent(category) === itemHandle
  }

  return (
    <div className="filter-type pb-8 mt-10 border-b border-line">
      <div className="list-type">
        {categories.map((item, index) => (
          <LocalizedClientLink
            key={`category-${item.id || index}`}
            href={{
              pathname: "/[...category]",
              params: { category: buildCategoryPathSegments(item) },
            }}
            className={`item flex items-center justify-between cursor-pointer capitalize text-[16px] text-black font-normal hover:text-hoverGray duration-200 ease-in-out ${
              isActiveCategory(item.handle) ? 'text-red pointer-events-none' : ''
            }`}

          >
            {item.name}
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

export default SwhCategoryFilter
