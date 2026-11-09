import { getSiteBrandInformation } from "@lib/data/information"
import { ArrowLeft, LockClosedSolid } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "next-intl/server"
import Image from "next/image"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteBrandInfo = await getSiteBrandInformation()
  const t = await getTranslations("Checkout.Layout")

  return (
    <div className="min-h-screen w-full bg-surface">
      <header className="border-b border-ui-border-base bg-white">
        <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between gap-x-4 px-4">
          <LocalizedClientLink href="/">
            <Image
              src={siteBrandInfo?.logo as string}
              alt={siteBrandInfo?.name as string}
              width={201}
              height={100}
              className="h-auto w-[140px] small:w-[170px]"
            />
          </LocalizedClientLink>

          <div className="flex items-center gap-x-5">
            <LocalizedClientLink
              href="/cart"
              className="hidden items-center gap-x-1.5 text-small-regular text-ui-fg-subtle transition-colors hover:text-ui-fg-base xsmall:inline-flex"
            >
              <ArrowLeft />
              {t("backToCart")}
            </LocalizedClientLink>
            <span className="inline-flex items-center gap-x-1.5 text-small-semi text-ui-fg-subtle">
              <LockClosedSolid />
              {t("secureCheckout")}
            </span>
          </div>
        </div>
      </header>

      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
