import { Button, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

const SignInPrompt = () => {
  const t = useTranslations("Cart.SignInPrompt")

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-ui-border-base bg-white px-5 py-4 shadow-sm xsmall:flex-row xsmall:items-center xsmall:justify-between small:px-7 small:py-5">
      <div>
        <h2 className="text-base-semi text-ui-fg-base">{t("heading")}</h2>
        <Text className="txt-medium mt-1 text-ui-fg-subtle">
          {t("description")}
        </Text>
      </div>
      <LocalizedClientLink href="/account" className="shrink-0">
        <Button
          variant="secondary"
          className="h-10 w-full xsmall:w-auto"
          data-testid="sign-in-button"
        >
          {t("cta")}
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
