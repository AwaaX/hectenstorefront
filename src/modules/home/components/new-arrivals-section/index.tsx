import { getTranslations } from "next-intl/server"
import { getProductRatings, listNewestProducts } from "@lib/data/products"
import ProductCarousel from "@modules/home/components/product-carousel"

/**
 * Homepage section 6: carousel of the 10 most recently added products, with
 * rating, colour swatches and wishlist.
 */
const NewArrivalsSection = async ({ countryCode }: { countryCode: string }) => {
  const t = await getTranslations("HomePage.NewArrivals")
  const products = await listNewestProducts({ countryCode, limit: 10 })
  if (!products.length) return null

  const ratings = await getProductRatings(products.map((p) => p.id))

  return (
    <section className="content-container py-[30px] font-[system-ui]">
      <h2 className="mb-4 text-center text-[24px] leading-[36px] font-semibold text-[#494949]">
        {t("title")}
      </h2>
      <ProductCarousel products={products} ratings={ratings} />
    </section>
  )
}

export default NewArrivalsSection
