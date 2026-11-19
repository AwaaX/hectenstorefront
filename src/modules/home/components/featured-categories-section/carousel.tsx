"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { useRouter } from "@i18n/navigation"
import ScrollCarousel from "@modules/common/components/scroll-carousel"

export type FeaturedCategory = {
  id: string
  name: string
  thumbnail?: string
  segments: string[]
}

// Hecten's featured-category colours, used in turn behind each card
const CARD_COLORS = ["#0693e3", "#00d084", "#ff6900", "#9b51e0", "#fcb900"]

const CategoryCard = ({
  category,
  color,
}: {
  category: FeaturedCategory
  color: string
}) => {
  const t = useTranslations("HomePage.FeaturedCategories")
  const router = useRouter()

  return (
    <article
      className="relative flex flex-col items-center justify-center gap-y-4 h-[500px] px-12 py-10 text-white text-center"
      style={{ backgroundColor: color }}
    >
      {/* 30% black dim, as on Hecten */}
      <div aria-hidden className="absolute inset-0 bg-black/30" />
      <h3 className="relative text-[24px] leading-[30px] font-semibold">
        {category.name}
      </h3>
      {category.thumbnail && (
        <div className="relative w-full max-w-[260px] aspect-square">
          <Image
            src={category.thumbnail}
            alt=""
            fill
            unoptimized
            className="object-contain"
          />
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          router.push({
            pathname: "/[...category]",
            params: { category: category.segments },
          })
        }
        className="relative px-[23.328px] py-[12.672px] rounded-full bg-[#32373c] font-[system-ui] text-[16px] leading-[24px] text-white hover:bg-black duration-300"
      >
        {t("shop")}
      </button>
    </article>
  )
}

/** 1 card (with the next peeking) on phones, 2 on tablets, 3 on desktop */
export default function FeaturedCategoriesCarousel({
  categories,
}: {
  categories: FeaturedCategory[]
}) {
  const t = useTranslations("HomePage.FeaturedCategories")

  return (
    <ScrollCarousel
      previousLabel={t("previous")}
      nextLabel={t("next")}
      trackClassName="gap-[10px]"
      itemClassName="w-[85%] md:w-[calc((100%-10px)/2)] lg:w-[calc((100%-20px)/3)]"
      items={categories.map((category, i) => ({
        key: category.id,
        node: (
          <CategoryCard
            category={category}
            color={CARD_COLORS[i % CARD_COLORS.length]}
          />
        ),
      }))}
    />
  )
}
