import { PRODUCT_CARD_FIELDS } from "@lib/data/product-fields"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { getTranslations } from "next-intl/server"
import Product from "../product-preview"
import { ProductGridCard } from "@modules/common/components/swh/product-previews"
import SwhProductSliderUI from "@modules/layout/components/product-slider-ui"
import { Heading } from "@medusajs/ui"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }


  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.categories && product.categories.length > 0) {
    queryParams.category_id = product.categories
      .map((c) => c.id)
      .filter(Boolean) as string[]
  } else if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false
  queryParams.fields = PRODUCT_CARD_FIELDS

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  const t = await getTranslations("Product.Related")

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
           <div className="text-center">
            <Heading
              level="h2"
              className="text-[24px] md:text-[42px] leading-normal  font-normal "
            >
              {t("heading")}
            </Heading>
            <p className="christmas-font ">{t("description")}</p>
          </div>
      </div>

      <SwhProductSliderUI products={products} />
    </div>
  )
}
