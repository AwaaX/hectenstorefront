"use client"

import React, { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

interface ProductOptionsFilterProps {
  /** List of product options to display as filters */
  options?: HttpTypes.StoreProductOption[]
  /** Current category for building filter URLs */
  category?: string
}

/**
 * Product Options filter component
 * Displays product options (size, color, etc.) as expandable filter sections
 * Applies filters via URL query parameters
 */
const ProductOptionsFilter: React.FC<ProductOptionsFilterProps> = ({
  options = [],
  category = "",
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({})

  if (!options || options.length === 0) {
    return null
  }

  // Parse currently selected option values from URL params
  const selectedOptions = useMemo(() => {
    const result: Record<string, string[]> = {}

    options.forEach((option) => {
      const param = searchParams.get(`option_${option.id}`)
      if (param) {
        result[option.id] = param.split(",").filter(Boolean)
      }
    })

    return result
  }, [searchParams, options])

  const toggleExpanded = (optionId: string) => {
    setExpandedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }))
  }

  const handleOptionSelect = (optionId: string, valueId: string) => {
    const currentValues = selectedOptions[optionId] || []
    const newValues = currentValues.includes(valueId)
      ? currentValues.filter((v) => v !== valueId)
      : [...currentValues, valueId]

    // Build new URL with updated filters
    const params = new URLSearchParams(searchParams)

    if (newValues.length > 0) {
      params.set(`option_${optionId}`, newValues.join(","))
    } else {
      params.delete(`option_${optionId}`)
    }

    // Build the new URL
    const baseUrl = category ? `/christmas-pyjamas/${category}` : "/christmas-pyjamas"
    const queryString = params.toString()
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl

    router.push(newUrl)
  }

  return (
    <div className="product-options-filter">
      {options.map((option) => {
        const hasValues = option.values && option.values.length > 0

        return (
          <div
            key={option.id}
            className="filter-option pb-8 border-b border-line mt-8"
          >
            <div
              className="heading6 flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpanded(option.id)}
            >
              <span className="capitalize">{option.title}</span>
              <span className="text-sm">
                {expandedOptions[option.id] ? "−" : "+"}
              </span>
            </div>

            {expandedOptions[option.id] && (
              <div className="option-values mt-4">
                {hasValues ? (
                  <div className="space-y-3">
                    {option.values!.map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          id={`option-${option.id}-${value.id}`}
                          checked={
                            selectedOptions[option.id]?.includes(value.id) ||
                            false
                          }
                          onChange={() =>
                            handleOptionSelect(option.id, value.id)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-0 cursor-pointer"
                        />
                        <label
                          htmlFor={`option-${option.id}-${value.id}`}
                          className="text-sm capitalize cursor-pointer hover:text-gray-600 duration-200 ease-in-out"
                        >
                          {value.value}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No values available</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ProductOptionsFilter
