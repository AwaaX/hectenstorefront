"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams } from "next/navigation"
import { getPathname, usePathname } from "@i18n/routing"
import { updateRegion } from "@lib/data/cart"
import { getLocalizedProductHandle } from "@lib/data/products"
import { getLocalizedCategoryHandle } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import { IoIosArrowDown } from "react-icons/io"
import {
  getLocaleFromRegion,
  extractCountryCode,
  hasStorefrontLocale,
} from "@lib/util/locale"

type SwitchHref = Parameters<typeof getPathname>[0]["href"]

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ toggleState, regions }: CountrySelectProps) => {
  const [current, setCurrent] = useState<CountryOption | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const params = useParams()
  const locale = params.locale as string | undefined
  const countryCode = locale ? extractCountryCode(locale) : ""
  // next-intl's usePathname returns the INTERNAL pathname template
  // (e.g. "/products/[handle]"), regardless of the localized URL shown in the
  // browser ("/es-es/productos/…"). Combined with useParams() we can rebuild the
  // equivalent URL for any other locale.
  const internalPathname = usePathname()

  const { state, close, open, toggle } = toggleState

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        // Shipping-only countries have no storefront to switch to
        return r.countries
          ?.filter((c) => c.iso_2 && hasStorefrontLocale(r, c.iso_2))
          .map((c) => ({
            country: c.iso_2 || "",
            region: r.id || "",
            label: c.display_name || "",
          }))
      })
      .flat()
      .filter((o) => o?.country && o?.region && o?.label)
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
  }, [regions])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((o) => o?.country === countryCode)
      if (option) {
        setCurrent(option)
      }
    }
  }, [options, countryCode])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close()
      }
    }

    if (state) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [state, close])

  const handleChange = async (option: CountryOption) => {
    const targetCountry = option.country
    const targetRegion = regions?.find((r) => r.id === option.region)
    const targetLocale = getLocaleFromRegion(targetRegion, targetCountry)

    // Default: keep the same page. For dynamic routes, carry the current route
    // params across (they're locale-independent, e.g. order ids) unless a
    // translation is resolved below.
    const { locale: _currentLocale, ...routeParams } = params
    let href: SwitchHref = internalPathname.includes("[")
      ? ({ pathname: internalPathname, params: routeParams } as SwitchHref)
      : (internalPathname as SwitchHref)

    try {
      if (
        internalPathname === "/products/[handle]" &&
        typeof params.handle === "string"
      ) {
        const localizedHandle = await getLocalizedProductHandle({
          currentHandle: decodeURIComponent(params.handle),
          sourceCountryCode: countryCode || "",
          targetCountryCode: targetCountry,
          locale: targetLocale,
        })

        href = localizedHandle
          ? {
              pathname: "/products/[handle]",
              params: { handle: localizedHandle },
            }
          : "/shop"
      } else if (
        internalPathname === "/[...category]" &&
        Array.isArray(params.category)
      ) {
        // Localize every segment of the category path (parent handles
        // included), not just the leaf, so nested categories resolve to
        // their fully localized path in the target locale.
        const localizedSegments = await Promise.all(
          params.category.map((segment) =>
            getLocalizedCategoryHandle({
              currentHandle: decodeURIComponent(segment),
              locale: targetLocale,
              targetCountryCode: targetCountry,
            })
          )
        )

        href = localizedSegments.every(
          (segment): segment is string => !!segment
        )
          ? {
              pathname: "/[...category]",
              params: {
                category: localizedSegments,
              },
            }
          : "/shop"
      }
    } catch (error) {
      console.error(
        "Failed to resolve the localized path while switching region:",
        error
      )
      href = "/shop"
    }

    await updateRegion(option.region, href, targetLocale)
  }

  return (
    <div className="relative" ref={containerRef}>
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={
          countryCode
            ? options?.find((o) => o?.country === countryCode)
            : undefined
        }
      >
        <ListboxButton className="py-1 focus:outline-none" onClick={toggle}>
          {current && (
            <span className="txt-compact-small flex items-center gap-x-2">
              {/* @ts-ignore */}
              <ReactCountryFlag
                svg
                style={{
                  width: "16px",
                  height: "16px",
                }}
                countryCode={current.country ?? ""}
                alt={current.country}
              />
              {current.label}
              <IoIosArrowDown className="group-hover:text-hoverGray " />
            </span>
          )}
        </ListboxButton>
        <div className="flex absolute right-0 w-full min-w-[180px]">
          <Transition
            show={state}
            as={Fragment}
            enter="transition ease-in duration-150"
            enterFrom="opacity-0 translate-y-10"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-10"
          >
            <ListboxOptions
              className="absolute -top-[calc(100%-8px)] left-0 xsmall:left-auto xsmall:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-full focus:outline-none"
              static
            >
              {options?.map((o, index) => {
                return (
                  <ListboxOption
                    key={index}
                    value={o}
                    className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
                  >
                    {/* @ts-ignore */}
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      countryCode={o?.country ?? ""}
                    />{" "}
                    {o?.label}
                  </ListboxOption>
                )
              })}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default CountrySelect
