"use client"

import { useTranslations } from "next-intl"
import { HttpTypes } from "@medusajs/types"
import type { ProductRating } from "@lib/data/products"
import ScrollCarousel from "@modules/common/components/scroll-carousel"
import ProductCard from "@modules/products/components/product-card"

/**
 * Homepage product carousel (best sellers, new arrivals): 2 cards per view on
 * phones, 3 on tablets, 4 on desktop.
 */
export default function ProductCarousel({
  products,
  ratings,
}: {
  products: HttpTypes.StoreProduct[]
  ratings: Record<string, ProductRating>
}) {
  const t = useTranslations("HomePage.ProductCarousel")

  return (
    <ScrollCarousel
      previousLabel={t("previous")}
      nextLabel={t("next")}
      itemClassName="w-[calc((100%-20px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)]"
      items={products.map((product) => ({
        key: product.id,
        node: <ProductCard product={product} rating={ratings[product.id]} />,
      }))}
    />
  )
}
