"use client"

import { Listbox, Transition } from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"

import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams } from "next/navigation"
import { IoIosArrowDown } from "react-icons/io"
import { getPathname, usePathname } from "@i18n/routing"
import { updateRegion } from "@lib/data/cart"
import { getLocalizedProductHandle } from "@lib/data/products"
import { getLocalizedCategoryHandle } from "@lib/data/categories"
import {
  getLocaleFromRegion,
  extractCountryCode,
  hasStorefrontLocale,
} from "@lib/util/locale"

import { HttpTypes } from "@medusajs/types"

type SwitchHref = Parameters<typeof getPathname>[0]["href"]

interface Region {
  id: string
  currency_code: string
  countries: Array<{ iso_2: string }>
  metadata?: Record<string, string>
}

type CurrencyType = {
  code: string
  name: string
  symbol: string
  symbol_native: string
}

type LocaleMetadata = { [key: string]: string }

type CurrencyOption = {
  countries: string[]
  region: string
  currency: string
  locale: LocaleMetadata
}

type CurrencySelectProps = {
  toggleState: StateType
  regions: Region[] | HttpTypes.StoreRegion[]
  product: any
}

const CurrencySelect = ({
  toggleState,
  regions,
  product,
}: CurrencySelectProps) => {
  const [current, setCurrent] = useState<CurrencyOption | undefined>(undefined)
  const params = useParams()
  const locale = params.locale as string | undefined
  const countryCode = locale ? extractCountryCode(locale) : ""
  // Internal pathname template, e.g. "/products/[handle]".
  const internalPathname = usePathname()

  const { state, close } = toggleState

  const options: CurrencyOption[] | undefined = useMemo(() => {
    return regions?.map((r) => {
      // Shipping-only countries have no storefront to switch to
      const countries: string[] = (r.countries || [])
        .map((c: any) => c.iso_2)
        .filter(
          (cc: string) =>
            cc && hasStorefrontLocale(r as HttpTypes.StoreRegion, cc)
        )
      return {
        countries: countries,
        region: r.id || "",
        currency: r.currency_code || "",
        locale: (r.metadata || {}) as LocaleMetadata,
      }
    })
    //   .flat()
  }, [regions])

  useEffect(() => {
    if (countryCode) {
      let currentCountryCode: string = Array.isArray(countryCode)
        ? countryCode[0]
        : (countryCode as string)
      const option = options?.find((o) =>
        o.countries.includes(currentCountryCode)
      )
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = async (option: CurrencyOption) => {
    const targetCountry = option.countries[0]
    const targetRegion = regions?.find((r) => r.id === option.region) as
      | HttpTypes.StoreRegion
      | undefined
    const targetLocale = getLocaleFromRegion(targetRegion, targetCountry)

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

    const target = getPathname({ locale: targetLocale, href })

    await updateRegion(targetCountry, target)
    close()
  }

  return (
    <div className="relative">
      {current && (
        <Listbox
          as="span"
          onChange={handleChange}
          defaultValue={
            countryCode
              ? options?.find((o) => {
                  let currentCountryCode = Array.isArray(countryCode)
                    ? countryCode[0]
                    : (countryCode as string)
                  return o.countries.includes(currentCountryCode)
                })
              : undefined
          }
        >
          <Listbox.Button className="py-1">
            {current && (
              <span className=" flex items-center gap-x-2 hover:text-hoverGray group duration-300 ease-in-out uppercase">
                {/* {current.currency.symbol} */}
                {current?.currency}
                {/* <span>({current?.currency?.symbol})</span> */}
                <IoIosArrowDown className="group-hover:text-hoverGray " />
              </span>
            )}
          </Listbox.Button>
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
              <Listbox.Options
                className="absolute -top-[calc(100%-8px)] left-0 xsmall:left-auto xsmall:right-0 max-h-[442px] overflow-y-scroll z-[900] bg-white drop-shadow-md text-small-regular uppercase text-black no-scrollbar rounded-rounded w-full"
                static
              >
                {options?.map((o, index) => {
                  return (
                    <Listbox.Option
                      key={index}
                      value={o}
                      className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2 uppercase"
                    >
                      {o?.currency}
                    </Listbox.Option>
                  )
                })}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </div>
  )
}

export default CurrencySelect
