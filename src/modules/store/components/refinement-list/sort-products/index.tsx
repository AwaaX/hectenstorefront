"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { useTranslations } from "next-intl"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at",
  },
  {
    value: "price_asc",
  },
  {
    value: "price_desc",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const t = useTranslations("Store.Sort")
  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  return (
    <>
      {sortOptions && sortOptions.length > 0 && (
        <div>
          <div className="space-y-2">
            {sortOptions.map((sortOption) => (
              <div key={sortOption.value}>
                <button
                  onClick={() => handleChange(sortOption.value as SortOptions)}
                  className={`block text-sm transition-all duration-200 py-2 px-3 rounded-lg w-full text-left ${
                    sortBy === sortOption.value
                      ? "text-christmas font-semibold"
                      : "text-gray-700 hover:text-black hover:bg-gray-100"
                  }`}
                >
                  {t(sortOption.value)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default SortProducts
