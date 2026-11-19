import { ReactNode } from "react"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { getSiteBrandInformation } from "@lib/data/information"
import ShopButton from "./shop-button"

const Card = ({
  siteName,
  title,
  text,
  image,
  imagePosition,
  overlay,
  children,
}: {
  siteName: string
  title: string
  text: string
  image?: string
  imagePosition?: string
  /** Tint over the photo, as on Hecten */
  overlay: string
  children: ReactNode
}) => (
  <div className="relative flex items-center justify-center min-h-[320px] p-5 overflow-hidden bg-[#1f1f1f] text-white text-center">
    {image && (
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
        style={{ objectPosition: imagePosition }}
      />
    )}
    <div aria-hidden className={`absolute inset-0 ${overlay}`} />
    <div className="relative max-w-[680px]">
      {/* Site name (thin, widely spaced) above the audience title */}
      <p className="pl-[24px] text-[24px] leading-[36px] font-thin tracking-[24px] uppercase">
        {siteName}
      </p>
      <h2 className="mb-[15px] text-[24px] leading-[36px] font-semibold">
        {title}
      </h2>
      <p className="mb-[15px] text-[16px] leading-[24px] font-semibold">
        {text}
      </p>
      {children}
    </div>
  </div>
)

/**
 * Homepage section 2: men and women cards side by side, kids card below with
 * extra boy / girl shortcuts. Each button opens the shop filtered by gender.
 */
const AudienceSection = async () => {
  const [t, siteBrandInfo] = await Promise.all([
    getTranslations("HomePage.Audience"),
    getSiteBrandInformation(),
  ])
  const siteName = siteBrandInfo?.name || "Hecten"

  return (
    // Same side margins as the header and footer
    <section className="content-container mb-[10px] font-[system-ui] grid lg:grid-cols-2 gap-[10px]">
      <Card
        siteName={siteName}
        title={t("menTitle")}
        text={t("menText")}
        image="/images/home/hecten-men.webp"
        imagePosition="50% 50%"
        overlay="opacity-50 bg-[linear-gradient(90deg,rgba(227,104,7,0.5)_0%,rgba(0,0,0,0.5)_100%)]"
      >
        <ShopButton genders={["men", "unisex"]}>{t("menCta")}</ShopButton>
      </Card>
      <Card
        siteName={siteName}
        title={t("womenTitle")}
        text={t("womenText")}
        image="/images/home/hecten-women.webp"
        imagePosition="56% 43%"
        overlay="bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(227,104,7,0.5)_100%)]"
      >
        <ShopButton genders={["women", "unisex"]}>
          {t("womenCta")}
        </ShopButton>
      </Card>
      <div className="lg:col-span-2">
        {/* No kids photo on Hecten yet: dark base with the women card's tint */}
        <Card
          siteName={siteName}
          title={t("kidTitle")}
          text={t("kidText")}
          overlay="bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(227,104,7,0.5)_100%)]"
        >
          <div className="flex flex-col items-center gap-y-[10px]">
            <ShopButton genders={["kid"]}>{t("kidCta")}</ShopButton>
            <div className="flex flex-wrap justify-center gap-[10px]">
              <ShopButton genders={["boy"]}>{t("boyCta")}</ShopButton>
              <ShopButton genders={["girl"]}>{t("girlCta")}</ShopButton>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default AudienceSection
