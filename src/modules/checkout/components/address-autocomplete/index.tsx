import { Label } from "@medusajs/ui"
import React, { useEffect, useRef, useState } from "react"
import { useGooglePlacesAutocomplete } from "../../../../hooks/useGooglePlacesAutocomplete"

type AutocompleteAddressInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: string
  name: string
  topLabel?: string
  onAddressSelect?: (address: {
    address_1: string
    city: string
    postal_code: string
    province: string
    country_code: string
  }) => void
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
}

const AddressAutocomplete = React.forwardRef<
  HTMLInputElement,
  AutocompleteAddressInputProps
>(
  (
    {
      label,
      name,
      onAddressSelect,
      topLabel,
      onChange,
      value,
      required,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSelectingPlace, setIsSelectingPlace] = useState(false)
    const { suggestions, fetchSuggestions, clearSuggestions, isLoading } =
      useGooglePlacesAutocomplete()

    React.useImperativeHandle(ref, () => inputRef.current!)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      onChange?.(e)

      if (inputValue.length >= 2) {
        fetchSuggestions(inputValue)
        setShowSuggestions(true)
      } else {
        clearSuggestions()
        setShowSuggestions(false)
      }
    }

    const handleSuggestionClick = async (suggestion: any) => {
      setShowSuggestions(false)
      clearSuggestions()

      if (!suggestion.placeId || !onAddressSelect) {
        onAddressSelect?.({
          address_1: suggestion.text,
          city: "",
          postal_code: "",
          province: "",
          country_code: "",
        })
        return
      }

      setIsSelectingPlace(true)
      try {
        const response = await fetch("/api/places/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ placeId: suggestion.placeId }),
        })

        if (response.ok) {
          const address = await response.json()
          onAddressSelect({
            address_1: address.address_1 || suggestion.text,
            city: address.city || "",
            postal_code: address.postal_code || "",
            province: address.province || "",
            country_code: address.country_code || "",
          })
        } else {
          onAddressSelect({
            address_1: suggestion.text,
            city: "",
            postal_code: "",
            province: "",
            country_code: "",
          })
        }
      } catch {
        onAddressSelect({
          address_1: suggestion.text,
          city: "",
          postal_code: "",
          province: "",
          country_code: "",
        })
      } finally {
        setIsSelectingPlace(false)
      }
    }

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setShowSuggestions(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
      <div ref={wrapperRef} className="flex flex-col w-full mb-[21px] relative z-50">
        <Label className="mb-2 text-[16px] font-normal flex items-center">
          {label}
          {required && <span className="text-christmas ml-1 h-5">*</span>}
        </Label>
        <div className="flex relative w-full text-[15px] font-normal">
          <input
            ref={inputRef}
            type="text"
            name={name}
            placeholder=" "
            className="py-2 block w-full h-11 px-4 mt-0 border rounded-md appearance-none focus:outline-none border-[#d2d2d2]"
            onChange={handleInputChange}
            value={value}
            {...props}
          />
          {(isLoading || isSelectingPlace) && (
            <div className="absolute right-4 top-3 text-gray-400 text-sm">
              Loading...
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d2d2d2] rounded-md shadow-lg z-50">
            {suggestions.map((suggestion: any, index: number) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
              >
                <div className="font-medium">{suggestion.mainText}</div>
                {suggestion.secondaryText && (
                  <div className="text-gray-500 text-xs">
                    {suggestion.secondaryText}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

AddressAutocomplete.displayName = "AddressAutocomplete"

export default AddressAutocomplete
