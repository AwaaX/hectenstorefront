import React, { Suspense } from "react"

import { buildProductAnalyticsItem, getAnalyticsValue } from "@lib/analytics"
import AnalyticsEvent from "@modules/analytics/components/event"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "../components/product-reviews"
import { ProductDetailsPanel } from "@modules/common/components/swh/panels"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  selectedVariantId?: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  selectedVariantId,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const productAnalyticsItem = buildProductAnalyticsItem({
    product,
    variantId: selectedVariantId,
  })

  return (
    <>
      <AnalyticsEvent
        eventName="view_item"
        ecommerce={{
          currency: region.currency_code?.toUpperCase(),
          value: getAnalyticsValue([productAnalyticsItem]),
          items: [productAnalyticsItem],
        }}
      />

      <div className="product-detail grouped small-container">
        <div className="featured-product underwear md:py-20 py-10">
          {/* Section 1 - Two Columns - Col1:Media - Col2:Information */}
          <div className="container flex justify-between gap-y-6 flex-wrap">
            <ProductDetailsPanel data={product} region={region} />
            <div className="product-infor md:w-1/2 w-full lg:pl-[15px] md:pl-2">
              <div className="flex flex-col  small:top-48 small:py-0  w-full  gap-y-12 ">
                <ProductActions product={product} region={region} />
              </div>

              {/* Product information */}
              <div className="flex flex-col  small:top-48 small:py-0  w-full py-8 gap-y-6">
                <ProductTabs product={product} />
              </div>
            </div>
          </div>
          {/* Section 2 - Description*/}
          <div className="mt-20  px-3">
            <div className="!text-[36px] font-normal text-center capitalize py-6">
              description
            </div>
            {
              <div
                className={"christmas-product-description"}
                dangerouslySetInnerHTML={{
                  __html: product.description?.replace(/\\n/g, "") ?? "",
                }}
              />
            }
          </div>
          {/* Section 3 - Reviews*/}
          <div className="content-container my-16 small:my-32">
            <ProductReviews productId={product.id} />
          </div>
          {/* Section 4 - Related Products*/}
          <div
            className="content-container my-16 small:my-32"
            data-testid="related-products-container"
          >
            <Suspense fallback={<SkeletonRelatedProducts />}>
              <RelatedProducts product={product} countryCode={countryCode} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate
