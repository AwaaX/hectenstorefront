import { listCategories } from "@lib/data/categories"
import SwhCatSliderUI from "@modules/layout/components/category-slider-ui"
import { HttpTypes } from "@medusajs/types"

interface CategoriesHorizontalSliderProps {
  category?: HttpTypes.StoreProductCategory
}

/**
 * Horizontal categories carousel slider (Server Component)
 * - On /products route: displays root categories
 * - On /[...category] route: displays child categories of current leaf node category (if any exist)
 */
const CategoriesHorizontalSlider = async ({
  category,
}: CategoriesHorizontalSliderProps = {}) => {
  return <></>
}

export default CategoriesHorizontalSlider
