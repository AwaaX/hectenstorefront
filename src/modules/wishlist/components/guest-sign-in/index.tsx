import { Check } from "@medusajs/icons"
import { getTranslations } from "next-intl/server"

import LoginTemplate from "@modules/account/templates/login-template"

export const GUEST_WISHLIST_SIGN_IN_ID = "wishlist-sign-in"

type GuestWishlistSignInProps = {
  redirectTo: string
}

export default async function GuestWishlistSignIn({
  redirectTo,
}: GuestWishlistSignInProps) {
  const t = await getTranslations("Wishlist.GuestSignIn")

  const benefits = [
    t("benefitDevices"),
    t("benefitShare"),
    t("benefitKeep"),
  ]

  return (
    <section
      id={GUEST_WISHLIST_SIGN_IN_ID}
      aria-labelledby={`${GUEST_WISHLIST_SIGN_IN_ID}-heading`}
      className="grid scroll-mt-28 grid-cols-1 gap-8 border-t border-line pt-10 medium:grid-cols-[minmax(0,1fr)_minmax(0,570px)] medium:gap-12"
      data-testid="guest-wishlist-sign-in"
    >
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col gap-y-1.5">
          <h2
            id={`${GUEST_WISHLIST_SIGN_IN_ID}-heading`}
            className="text-[22px] font-semibold leading-tight text-black"
          >
            {t("heading")}
          </h2>
          <p className="max-w-lg text-[15px] leading-6 text-secondary">
            {t("description")}
          </p>
        </div>
        <ul className="flex flex-col gap-y-3">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-x-3 text-[15px] text-black"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green">
                <Check />
              </span>
              <span className="pt-0.5">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
      <LoginTemplate redirectTo={redirectTo} className="p-0" />
    </section>
  )
}
