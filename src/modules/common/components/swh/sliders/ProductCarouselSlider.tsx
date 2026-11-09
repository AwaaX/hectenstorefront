
import { listProductsWithSort } from "@lib/data/products"
import SwhProductSliderUI from "@modules/layout/components/product-slider-ui"


/**
 * Product carousel slider (Server Component)
 * Fetches and displays featured products in a carousel layout
 */
const ProductCarouselSlider = async () => {
  const queryParams = {
    limit: 12,
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({ page: 1, queryParams })

  if (!products) {
    return null
  }

  return <SwhProductSliderUI products={products} />
}

export default ProductCarouselSlider
