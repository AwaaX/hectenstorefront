"use client"

import DescriptionCard from "./DescriptionCard"
import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface DiscoveryProduct {
  heading: string
  brief: string
  title: string
  image: any
  imageAlt: string
  quantity: number
  handle: React.ComponentProps<typeof LocalizedClientLink>["href"]
  reverse: boolean
  special: boolean
}

interface DiscoveryProductsListProps {
  products: DiscoveryProduct[]
}

export default function DiscoveryProductsList({
  products,
}: DiscoveryProductsListProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-16 mt-16">
      {products.map((product, index) => (
        <DescriptionCard key={product.title + index} {...product} />
      ))}
    </div>
  )
}
