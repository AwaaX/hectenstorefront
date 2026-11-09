"use client"
import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import "swiper/css/bundle"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { DynamicImage } from "@modules/common/components/swh/utilities"
import { HttpTypes } from "@medusajs/types"
import { buildCategoryPathSegments } from "@lib/util/category-path"

const SwhCatSliderUI = ({
  categories,
  parentCategoryHandle,
}: {
  categories: HttpTypes.StoreProductCategory[]
  parentCategoryHandle: string
}) => {
  if (categories && categories.length > 0){

    return (
      <>
        <div className=" py-[50px]">
          <div className="container">
            <div className="list-trending section-swiper-navigation style-small-border style-outline  mx-auto">
              <Swiper
                spaceBetween={12}
                slidesPerView={2}
                navigation
                loop={true}
                modules={[Navigation, Autoplay]}
                breakpoints={{
                  576: {
                    slidesPerView: 3,
                    spaceBetween: 12,
                  },
                  768: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                  },
                  992: {
                    slidesPerView: 4,
                    spaceBetween: 20,
                  },
                  1290: {
                    slidesPerView: 5,
                    spaceBetween: 20,
                  },
                }}
                className="h-full"
              >
                {categories.map(
                  (c: HttpTypes.StoreProductCategory, i: number) => (
                    <SwiperSlide key={`slide_${i}`}>
                      <LocalizedClientLink
                        className="flex flex-col items-center justify-center"
                        href={{
                          pathname: "/[...category]",
                          params: { category: [parentCategoryHandle, c.handle] },
                        }}
                      >
                        <div className="bg-white rounded-full w-[140px] h-[140px] overflow-hidden">
                          <DynamicImage
                            url={
                              (c as any)?.product_category_image?.[0]?.url &&
                              (c as any)?.product_category_image?.[0]?.url !==
                                ""
                                ? (c as any)?.product_category_image?.[0]?.url
                                : "/logo.jpg"
                            }
                            alt={"item-picture"}
                            className="w-full h-full object-center object-cover "
                          />
                        </div>
                        <div className="trending-name text-center mt-5 duration-500">
                          <h3 className="text-title">{c.name}</h3>
                          <div className="caption2">
                            {c.products?.length ?? 0} items
                          </div>
                        </div>
                      </LocalizedClientLink>
                    </SwiperSlide>
                  )
                )}
              </Swiper>
            </div>
          </div>
        </div>
      </>
    )
  }else{
    return;
  }
}

export default SwhCatSliderUI
