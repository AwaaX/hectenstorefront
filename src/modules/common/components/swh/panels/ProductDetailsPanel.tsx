"use client"
import React from "react"
import { HttpTypes } from "@medusajs/types"
import type { ProductGridCardData } from "../product-previews/types"
import { SwhGallery } from "../gallery"

/** Props for ProductDetailsPanel component */
interface ProductDetailsPanelProps {
  /** Product data to display */
  data: ProductGridCardData
  /** Store region for pricing context */
  region: HttpTypes.StoreRegion
}

/**
 * Product details image carousel panel
 * Displays product images in an interactive custom gallery with thumbnail navigation
 */
const ProductDetailsPanel = ({ data: productMain, region }: ProductDetailsPanelProps) => {

  const galleryImages = [
    { url: productMain.thumbnail, alt: productMain.title },
    ...(productMain.images || []).map((img: any) => ({
      url: img.url,
      alt: productMain.title,
    })),
  ]

  return (
    <div className=" w-full md:w-1/2 md:pr-[15px]">
      <SwhGallery images={galleryImages} productTitle={productMain.title} />
    </div>
  )
}

export default ProductDetailsPanel
