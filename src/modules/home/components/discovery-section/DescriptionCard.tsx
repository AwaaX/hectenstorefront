"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DynamicImage } from "@modules/common/components/swh/utilities"
import React from "react"

interface DescriptionCardProps {
  heading: string
  brief: string
  title: string
  image: string
  imageAlt:string
  quantity: number
  handle: React.ComponentProps<typeof LocalizedClientLink>["href"]
  reverse: boolean
  special: boolean
}

const DescriptionCard = ({
  heading,
  brief,
  title,
  image,
  imageAlt,
  quantity,
  handle,
  reverse,
  special,
}: DescriptionCardProps) => {
  return (
    <div
      className={`flex items-center md:items-start justify-center max-md:flex-col-reverse ${
        reverse ? "md:flex-row-reverse" : ""
      }  md:gap-[70px] gap-8`}
    >
      {/* Description */}
      <div className="flex-1">
        <div className="flex flex-col items-center justify-start text-center">
          <h2 className="text-[24px] md:text-[36px] leading-normal ">
            {heading}
          </h2>
          <p className="text-[16px] leading-[28px] text-[#666]">{brief}</p>
        </div>
      </div>

      {/* Image + Title + Items Quantity */}
      <div className="flex-1 w-full">
        <div
          className={`flex flex-col items-center justify-center gap-4 ${
            special ? " flex-col-reverse relative" : ""
          }`}
        >
          {!special && (
            <LocalizedClientLink href={handle}>
              <div className="rounded-full overflow-hidden w-[160px] h-[160px] cursor-pointer">
                {/* <Image
                  src={image}
                  alt={"item image"}
                  className="w-full h-full object-center object-cover"
                /> */}
                 <DynamicImage
                  url={image}
                  alt={imageAlt}
                  className="w-full h-full object-center object-cover "
                />
              </div>
            </LocalizedClientLink>
          )}
          {special && (
            <LocalizedClientLink href={handle} className="max-md:max-w-[300px] w-full cursor-pointer">
              <div className="">
                {/* <Image
                  src={image}
                  alt={"item image"}
                  className="w-full h-full object-center object-cover"
                /> */}
                <DynamicImage
                  url={image}
                  alt={imageAlt}
                  className="w-full h-full object-center object-cover "
                />
              </div>
            </LocalizedClientLink>
          )}
          <div className={`${special ? "absolute left-8 top-0" : ""}`}>
            <LocalizedClientLink
              href={handle}
              className={`  ${
                special
                  ? " text-[22px] font-bold"
                  : "text-[20px] font-normal max-md:text-center max-md:inline-block"
              }`}
            >
              {title}
            </LocalizedClientLink>
            <div
              className={` ${
                special ? "text-base font-medium " : "text-[#666] text-center"
              } `}
            >
              {quantity} items
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DescriptionCard
