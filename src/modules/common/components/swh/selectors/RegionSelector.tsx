"use client"
import { useToggleState } from "@medusajs/ui"
import CountrySelect from "@modules/layout/components/country-select"
import React from "react"
import { HttpTypes } from "@medusajs/types"

/** Props for RegionSelector component */
interface RegionSelectorProps {
  /** Available regions for selection */
  regions: HttpTypes.StoreRegion[]
  /** "native" renders a plain <select> (header top bar) */
  variant?: "listbox" | "native"
}

/**
 * Region/country selector dropdown wrapper
 * Displays available regions for user selection
 */
const RegionSelector = ({ regions, variant }: RegionSelectorProps) => {
  const toggleState = useToggleState()

  return (
    <div className="flex justify-between">
      {regions && (
        <CountrySelect
          toggleState={toggleState}
          regions={regions}
          variant={variant}
        />
      )}
    </div>
  )
}

export default RegionSelector
