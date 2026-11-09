import { useTranslations } from "next-intl"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Humanitarian = () => {
  const t = useTranslations("StaticPages.HumanitarianProject")

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-around py-[20px] md:py-[35px] px-4 md:px-0 christmas-gradient gap-6 md:gap-0">
        <div className="text-[24px] md:text-[36px] font-extralight flex-1 text-center">
          {t("title")}
        </div>
        <div className="text-center flex-1">
          <p className="text-[16px] md:text-[20px] font-extralight">{t("hero.eyebrow")}</p>
          <h1 className="text-[28px] md:text-[42px] font-normal leading-relaxed">
            {t("hero.heading")}
          </h1>
          <p className="christmas-font mt-6 max-w-[492px] mx-auto text-[14px] md:text-base">
            {t("hero.description")}
          </p>
          <LocalizedClientLink href="/" className="christmas-font text-[14px] md:text-base">
            {" "}
            {t("hero.link")}{" "}
          </LocalizedClientLink>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-around py-[20px] md:py-[35px] px-4 md:px-0 gap-6 md:gap-0">
        <div className="text-center flex-1 order-2 md:order-1">
          <p className="text-[16px] md:text-[20px] font-extralight">{t("association.eyebrow")}</p>
          <h1 className="text-[28px] md:text-[42px] font-normal leading-relaxed">{t("association.heading")}</h1>
          <p className="christmas-font mt-6 px-4 md:px-[35px] text-[14px] md:text-base">
            {t("association.description")}
          </p>
        </div>
        <div className="flex-1 order-1 md:order-2 flex justify-center">
          <Image src="/images/humanitarian-project/logo.webp" alt={t("association.logoAlt")} className="mx-auto" width={250} height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 py-[20px] md:py-[35px] px-4 md:px-0 gap-6 md:gap-y-8">
        <div className="max-w-full md:max-w-[640px] mx-auto w-full">
          <Image src="/images/humanitarian-project/img1.jpg" alt={t("gallery.image1Alt")} width={640} height={480} className="w-full h-auto" />
        </div>
        <div className="max-w-full md:max-w-[640px] mx-auto w-full">
          <Image src="/images/humanitarian-project/img2.webp" alt={t("gallery.image2Alt")} width={640} height={480} className="w-full h-auto" />
        </div>
        <div className="max-w-full md:max-w-[640px] mx-auto w-full">
          <Image src="/images/humanitarian-project/img3.webp" alt={t("gallery.image3Alt")} width={640} height={480} className="w-full h-auto" />
        </div>
        <div className="max-w-full md:max-w-[640px] mx-auto w-full">
          <Image src="/images/humanitarian-project/img4.webp" alt={t("gallery.image4Alt")} width={640} height={480} className="w-full h-auto" />
        </div>
      </div>
    </>
  )
}

export default Humanitarian
