"use client"
import React from "react"
import { ProductSliderCard } from "@modules/common/components/swh/product-previews"
import { HttpTypes } from "@medusajs/types"
import SwhSwiper from "./swh-swiper"

const SwhProductSliderUI = ({ products }: { products: HttpTypes.StoreProduct[] }) => {
  const slides = products.map((p: HttpTypes.StoreProduct) => (
    <ProductSliderCard key={p.id} data={p} type={"grid"} />
  ))

  return (
    <div className="trending-block style-six mt-[60px] max-md:mx-4">
      <div className="container">
        <div className="list-trending section-swiper-navigation style-small-border style-outline mx-auto">
          {products && products.length > 0 && (
            <SwhSwiper items={slides} enableNavigation={true} />
          )}
        </div>
      </div>
    </div>
  )
}

export default SwhProductSliderUI
