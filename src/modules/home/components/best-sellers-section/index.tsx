import { getTranslations } from "next-intl/server"
import { getProductRatings, listBestSellingProducts } from "@lib/data/products"
import ProductCarousel from "@modules/home/components/product-carousel"

/**
 * Homepage section 3: carousel of the 8 most bought products of the week
 * (falling back to the month), with rating, colour swatches and wishlist.
 */
const BestSellersSection = async ({ countryCode }: { countryCode: string }) => {
  const t = await getTranslations("HomePage.BestSellers")
  const products = await listBestSellingProducts({ countryCode, limit: 8 })
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

export default BestSellersSection
