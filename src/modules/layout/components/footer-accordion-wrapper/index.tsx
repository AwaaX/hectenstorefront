"use client"

import { ComponentProps, useState } from "react"
import { IoChevronDown } from "react-icons/io5"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type FooterLink = {
  name: string
  path: ComponentProps<typeof LocalizedClientLink>["href"]
}

export type FooterColumn = {
  title: string
  links: FooterLink[]
}

/**
 * Footer link columns. Side by side from md up; on mobile each column is an
 * accordion so the footer stays short.
 */
export default function FooterAccordionWrapper({
  columns,
}: {
  columns: FooterColumn[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      {columns.map((column, index) => {
        const open = openIndex === index
        return (
          <div
            key={column.title}
            className="max-md:border-b max-md:border-[#e5e5e5]"
          >
            {/* Mobile: tap the title to show the links */}
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
              className="md:hidden w-full flex items-center justify-between py-4 font-[system-ui] text-[18px] leading-[27px] font-semibold text-black text-left"
            >
              {column.title}
              <IoChevronDown
                className={`shrink-0 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Desktop title */}
            <p className="max-md:hidden mb-[12px] text-[20.8px] leading-[31.2px] font-semibold text-black">
              {column.title}
            </p>
            <ul
              className={`flex flex-col gap-y-[14px] max-md:pb-5 ${
                open ? "" : "max-md:hidden"
              }`}
            >
              {column.links.map((link) => (
                <li key={link.name}>
                  <LocalizedClientLink
                    href={link.path}
                    className="text-[13.6px] leading-[20.4px] text-black underline underline-offset-[3px] hover:text-hoverGray duration-300"
                  >
                    {link.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </>
  )
}
