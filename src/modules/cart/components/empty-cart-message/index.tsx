import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EmptyCartIcon from "@modules/common/icons/empty-cart"
import { getTranslations } from "next-intl/server"

const EmptyCartMessage = async () => {
  const t = await getTranslations("Cart.Empty")

  return (
    <div className="flex py-16 flex-col items-center justify-center text-center font-[system-ui]">
      <EmptyCartIcon className="w-[200px] small:w-[260px] mb-10" />

      <h1 className="text-[28px] leading-[36px] small:text-[40px] small:leading-[48px] font-semibold text-[#111]">
        {t("heading")}
      </h1>
      <p className="mt-3 text-[16px] leading-[24px] text-[#666] px-5">
        {t("description")}
      </p>

      {/* CTA Button */}
      <LocalizedClientLink
        href={"/shop"}
        className="inline-flex items-center justify-center h-[52px] px-11 mt-10 rounded-[6px] bg-[#ef7a4c] hover:bg-[#e2683a] text-[17px] font-semibold text-white duration-200"
      >
        {t("cta")}
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
