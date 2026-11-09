import React from "react"
import { Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"
import { getTotalProductCount } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import productImg1 from "@lib/img/christmas-pyjamas-original2-min-370x500.png"
import productImg2 from "@lib/img/family-original2-min-300x300.png"
import productImg3 from "@lib/img/couples-original-min-300x300.png"
import DiscoveryProductsList from "./products-list"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { buildCategoryPathSegments } from "@lib/util/category-path"

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

const DiscoverySection = async () => {
  const categories = await listCategories({
    fields:"name,handle,products.id,rank",
  })
  const t = await getTranslations("HomePage.Discovery")

  // Map categories to discovery items using ranks
  // rank 0 → special item (matching), rank 1 → family, rank 2 → couples
  const getRankCategory = (rank: number) =>
    categories.find((c) => c.rank === rank)

  const buildProductItem = (
    category: HttpTypes.StoreProductCategory | undefined,
    itemNum: 1 | 2 | 3,
    image: any,
    reverse: boolean,
    special: boolean,
    handle?: React.ComponentProps<typeof LocalizedClientLink>["href"],
    quantity?: number
  ): DiscoveryProduct | null => {
    if (!category || !category.handle) return null

    return {
      heading: t(`Item${itemNum}.heading`),
      brief: t(`Item${itemNum}.brief`),
      title: t(`Item${itemNum}.title`),
      image,
      imageAlt: t(`Item${itemNum}.imageAlt`),
      quantity:
        quantity !== undefined ? quantity : category.products?.length || 0,
      handle: handle || {
        pathname: "/[...category]",
        params: { category: buildCategoryPathSegments(category) },
      },
      reverse,
      special,
    }
  }

  const totalProducts = await getTotalProductCount()

  const products: DiscoveryProduct[] = [
    buildProductItem(
      getRankCategory(2),
      1,
      productImg1,
      true,
      true,
      "/shop",
      totalProducts
    ),
    buildProductItem(getRankCategory(1), 2, productImg2, false, false),
    buildProductItem(getRankCategory(0), 3, productImg3, true, false),
  ].filter((p): p is DiscoveryProduct => p !== null)

  if (products.length === 0) {
    return null
  }

  return (
    <div className="w-full relative">
      <div className="max-w-[1200px] w-full mx-auto py-[35px] md:py-[70px] px-3">
        <div className="text-center max-w-[500px] mx-auto">
          <Heading
            level="h2"
            className="text-2xl md:text-[42px] leading-normal  font-normal "
          >
            {t("heading")}
          </Heading>
          <Text className="text-base leading-[28px]  font-normal text-[#666] ">
            {t("description")}
          </Text>
        </div>

        <DiscoveryProductsList products={products} />
      </div>
    </div>
  )
}

export default DiscoverySection
