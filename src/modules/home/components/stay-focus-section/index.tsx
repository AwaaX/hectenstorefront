import Image from "next/image"
import { getTranslations } from "next-intl/server"

const PILLARS = ["unique", "simple", "modern"] as const

/**
 * Homepage section 5: Hecten's "Stay Focus®" brand block (icon, three
 * pillars) beside the black "History is created" panel. Stacks on phones.
 */
const StayFocusSection = async () => {
  const t = await getTranslations("HomePage.StayFocus")

  return (
    <section className="content-container mb-[10px] grid lg:grid-cols-[1fr_374px] font-[system-ui] text-black text-center">
      <div className="flex flex-col items-center px-5 py-[30px] lg:py-5">
        <div className="flex items-center justify-center h-[150px]">
          <Image
            src="/hecten-icon.svg"
            alt=""
            width={157}
            height={109}
            unoptimized
            className="w-[100px] h-auto"
          />
        </div>
        <h2 className="mt-[10px] mb-[15px] text-[24px] leading-[36px] font-semibold">
          {t("brand")}
        </h2>
        <p className="text-[17.6px] leading-[26.4px] font-light">
          {t("brandTagline")}
        </p>

        <ul className="grid md:grid-cols-3 gap-x-6 gap-y-8 w-full mt-[30px]">
          {PILLARS.map((pillar) => (
            <li key={pillar} className="flex flex-col items-center">
              <h3 className="mb-[15px] text-[24px] leading-[36px] font-semibold">
                {t(`${pillar}Title`)}
              </h3>
              <p className="max-w-[380px] text-[16px] leading-[24px] font-semibold">
                {t(`${pillar}Text`)}
              </p>
              {/* Thin, widely spaced signature line, as on Hecten; pinned to
                  the bottom so all three line up */}
              <p className="mt-auto pt-[6px] pl-[0.4em] text-[14.4px] leading-[24px] font-thin tracking-[0.4em]">
                {t(`${pillar}Tag`)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center justify-center p-[50px] bg-black text-white">
        <h2 className="mb-[30px] text-[24px] leading-[36px] font-semibold">
          {t("storyTitleLine1")}
          <br />
          {t("storyTitleLine2")}
        </h2>
        <p className="text-[17.6px] leading-[26.4px] font-semibold">
          {t("storyText")}
        </p>
      </div>
    </section>
  )
}

export default StayFocusSection
