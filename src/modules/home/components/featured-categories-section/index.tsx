import { getTranslations } from "next-intl/server"
import { ExtendedProductCategory, listCategories } from "@lib/data/categories"
import { buildCategoryPathSegments } from "@lib/util/category-path"
import FeaturedCategoriesCarousel, { FeaturedCategory } from "./carousel"

const MAX_CATEGORIES = 8
const MIN_CATEGORIES = 3

// Set `featured: true` in a category's metadata (Medusa admin) to show it here
const isFeatured = (category: ExtendedProductCategory) => {
  const flag = category.metadata?.featured
  return flag === true || flag === "true"
}

/**
 * Homepage section 4: carousel of up to 8 featured categories, in category
 * rank order. When no category is featured yet, the top 8 categories by rank
 * are shown instead. Hidden when fewer than 3 would show.
 */
const FeaturedCategoriesSection = async () => {
  const [t, categories] = await Promise.all([
    getTranslations("HomePage.FeaturedCategories"),
    listCategories() as Promise<ExtendedProductCategory[]>,
  ])

  const flagged = categories.filter(isFeatured)
  const featured: FeaturedCategory[] = (flagged.length ? flagged : categories)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, MAX_CATEGORIES)
    .map((category) => ({
      id: category.id,
      name: category.name,
      thumbnail: category.product_category_image?.find(
        (image) => (image as { type?: string }).type === "thumbnail"
      )?.url,
      segments: buildCategoryPathSegments(category),
    }))

  if (featured.length < MIN_CATEGORIES) return null

  return (
    <section className="content-container py-[30px] font-[system-ui]">
      <h2 className="mb-4 text-center text-[24px] leading-[36px] font-semibold text-[#494949]">
        {t("title")}
      </h2>
      <FeaturedCategoriesCarousel categories={featured} />
    </section>
  )
}

export default FeaturedCategoriesSection
