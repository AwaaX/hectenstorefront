import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

/** Plain, square info box, matching the cart summary panel */
const SignInPrompt = () => {
  const t = useTranslations("Cart.SignInPrompt")

  return (
    <div className="flex flex-col gap-4 border border-[#e1e1e1] bg-[#fafafa] px-5 py-4 font-[system-ui] xsmall:flex-row xsmall:items-center xsmall:justify-between small:px-6">
      <div>
        <h2 className="text-[16px] leading-[24px] font-semibold text-black">
          {t("heading")}
        </h2>
        <p className="mt-[2px] text-[14px] leading-[21px] text-[#666]">
          {t("description")}
        </p>
      </div>
      <LocalizedClientLink
        href="/account"
        className="flex shrink-0 items-center justify-center h-[40px] w-full px-5 border border-[#ccc] bg-white text-[14px] font-semibold text-black hover:border-black duration-200 xsmall:w-auto"
        data-testid="sign-in-button"
      >
        {t("cta")}
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
