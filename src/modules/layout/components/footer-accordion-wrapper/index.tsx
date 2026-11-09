"use client"

import { ComponentProps, useState } from "react"
import { IoChevronDown } from "react-icons/io5"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsLetterEmail from "@modules/common/components/news-letter-email"

export type FooterLink = {
  name: string
  path: ComponentProps<typeof LocalizedClientLink>["href"]
}

interface FooterAccordionWrapperProps {
  col1Title: string
  col1Text2: string
  col1Text3: string
  col1Text4: string
  col2Title: string
  col3Title: string
  col4Title: string
  col4Text2: string
  usefulLinks: FooterLink[]
  infoLinks: FooterLink[]
  contactEmail?: string
}

export default function FooterAccordionWrapper({
  col1Title,
  col1Text2,
  col1Text3,
  col1Text4,
  col2Title,
  col3Title,
  col4Title,
  col4Text2,
  usefulLinks,
  infoLinks,
  contactEmail = "customer@thechristmasfabric.com",
}: FooterAccordionWrapperProps) {
  const [openAccordions, setOpenAccordions] = useState<{
    [key: string]: boolean
  }>({
    col1: false,
    col2: false,
    col3: false,
    col4: false,
  })

  const toggleAccordion = (column: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  return (
    <>
      {/* Mobile Accordion View */}
      <div className="md:hidden w-full flex flex-col-reverse ">
        {/* Column 1 Accordion */}
        <div className="">
          <button
            onClick={() => toggleAccordion("col1")}
            className="w-full py-4 px-4 flex items-center justify-between  transition-colors duration-200"
          >
            <span className="font-medium capitalize text-left">
              {col1Title}
            </span>
            <IoChevronDown
              className={`flex-shrink-0 transition-transform duration-300 ${
                openAccordions.col1 ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordions.col1 && (
            <div className="px-4 pb-4 space-y-3 ">
              <div className="text-[#666]">
                <p className="mb-1">{col1Text2}</p>
                <LocalizedClientLink
                  href={"/customer-service"}
                  className="underline-gap hover:text-black duration-300 ease-in-out"
                >
                  {col1Text3}
                </LocalizedClientLink>
              </div>
              <div className="text-[#666]">
                <p className="mb-1">{col1Text4}</p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-black hover:text-hoverGray duration-300 ease-in-out"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Column 2 Accordion */}
        <div className="">
          <button
            onClick={() => toggleAccordion("col2")}
            className="w-full py-4 px-4 flex items-center justify-between  transition-colors duration-200"
          >
            <span className="font-medium capitalize text-left">
              {col2Title}
            </span>
            <IoChevronDown
              className={`flex-shrink-0 transition-transform duration-300 ${
                openAccordions.col2 ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordions.col2 && (
            <div className="px-4 pb-4 ">
              <ul className="space-y-2">
                {usefulLinks.map((item, index) => (
                  <li
                    key={item.name + index}
                    className="text-[#666666] hover:text-black cursor-pointer capitalize"
                  >
                    <LocalizedClientLink href={item.path}>
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Column 3 Accordion */}
        <div className="">
          <button
            onClick={() => toggleAccordion("col3")}
            className="w-full py-4 px-4 flex items-center justify-between  transition-colors duration-200"
          >
            <span className="font-medium capitalize text-left">
              {col3Title}
            </span>
            <IoChevronDown
              className={`flex-shrink-0 transition-transform duration-300 ${
                openAccordions.col3 ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordions.col3 && (
            <div className="px-4 pb-4 ">
              <ul className="space-y-2">
                {infoLinks.map((item, index) => (
                  <li
                    key={item.name + index}
                    className="text-[#666666] hover:text-black cursor-pointer capitalize"
                  >
                    <LocalizedClientLink href={item.path}>
                      {item.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Column 4 Accordion */}
        <div className="">
          <button
            onClick={() => toggleAccordion("col4")}
            className="w-full py-4 px-4 flex items-center justify-between  transition-colors duration-200"
          >
            <span className="font-medium capitalize text-left">
              {col4Title}
            </span>
            <IoChevronDown
              className={`flex-shrink-0 transition-transform duration-300 ${
                openAccordions.col4 ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordions.col4 && (
            <div className="px-4 pb-4 space-y-3 ">
              <div className="text-[#666] mb-2">{col4Text2}</div>
              <div className="text-[#666]">
                <NewsLetterEmail />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:flex justify-between items-start gap-4">
        {/* Column 1 */}
        <div className="flex-1 flex flex-col items-start justify-start gap-5">
          <div className="font-medium capitalize">{col1Title}</div>
          <div className="text-[#666]">
            <p className="mb-1">{col1Text2}</p>
            <LocalizedClientLink
              href={"/customer-service"}
              className="underline-gap hover:text-black duration-300 ease-in-out"
            >
              {col1Text3}
            </LocalizedClientLink>
          </div>
          <div className="text-[#666]">
            <p className="mb-1">{col1Text4}</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-black hover:text-hoverGray duration-300 ease-in-out"
            >
              {contactEmail}
            </a>
          </div>
        </div>

        {/* Column 2 */}
        <ul className="flex-1 flex flex-col items-start justify-start gap-3">
          <li className="font-medium capitalize mb-4">{col2Title}</li>
          {usefulLinks.map((item, index) => (
            <li
              key={item.name + index}
              className="text-[#666666] hover:text-black cursor-pointer capitalize"
            >
              <LocalizedClientLink href={item.path}>
                {item.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>

        {/* Column 3 */}
        <ul className="flex-1 flex flex-col items-start justify-start gap-3">
          <li className="font-medium capitalize mb-4">{col3Title}</li>
          {infoLinks.map((item, index) => (
            <li
              key={item.name + index}
              className="text-[#666666] hover:text-black cursor-pointer capitalize"
            >
              <LocalizedClientLink href={item.path}>
                {item.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>

        {/* Column 4 */}
        <div className="flex-1 flex flex-col justify-start gap-5">
          <div className="font-medium capitalize">{col4Title}</div>
          <div className="text-[#666] mb-2">{col4Text2}</div>
          <div className="text-[#666]">
            <NewsLetterEmail />
          </div>
        </div>
      </div>
    </>
  )
}
