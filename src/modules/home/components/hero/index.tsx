import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { getSiteBrandInformation } from "@lib/data/information"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Homepage section 1: brand icon, site name, marketing line and a link to all
 * products, on Hecten's light grey-to-white gradient.
 */
const Hero = async () => {
  const [t, siteBrandInfo] = await Promise.all([
    getTranslations("HomePage.Hero"),
    getSiteBrandInformation(),
  ])
  const siteName = siteBrandInfo?.name || "Hecten"

  return (
    <section className="mb-[10px] p-5 bg-[linear-gradient(0deg,#fff_0%,rgba(0,0,0,0.07)_100%)] font-[system-ui] text-black text-center">
      <div className="flex flex-col items-center gap-y-[10px]">
        {/* Site icon */}
        <div className="flex items-center justify-center h-[150px]">
          <Image
            src="/hecten-icon.svg"
            alt=""
            width={157}
            height={109}
            unoptimized
            priority
            className="w-[100px] h-auto"
          />
        </div>

        {/* Site name; the left padding offsets the trailing letter spacing so
            the word sits truly centred */}
        <h1 className="pl-[12.8px] text-[12.8px] leading-[19.2px] font-bold tracking-[12.8px] uppercase">
          {siteName}
        </h1>

        <p className="text-[26px] md:text-[32px] leading-[39px] md:leading-[48px]">
          {t("marketingText")}
        </p>

        <LocalizedClientLink
          href="/shop"
          className="inline-flex items-center h-[51px] px-[23.328px] border border-[#333] rounded-full text-[16px] leading-[24px] underline hover:bg-black hover:text-white duration-300"
        >
          {t("discover")}
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default Hero
