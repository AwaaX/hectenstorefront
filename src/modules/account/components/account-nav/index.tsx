"use client"

import { clx } from "@medusajs/ui"
import {
  ArrowRightOnRectangle,
  Heart,
  House,
  MapPin,
  ShoppingBag,
  User,
} from "@medusajs/icons"
import { ComponentProps } from "react"
import { useParams } from "next/navigation"
import { usePathname } from "@i18n/routing"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { signout } from "@lib/data/customer"
import { useTranslations } from "next-intl"
import { extractCountryCode } from "@lib/util/locale"

type NavHref = ComponentProps<typeof LocalizedClientLink>["href"]

const getInitials = (customer: HttpTypes.StoreCustomer | null) => {
  const initials = [customer?.first_name, customer?.last_name]
    .map((part) => part?.trim().charAt(0) ?? "")
    .join("")

  return (initials || customer?.email?.charAt(0) || "?").toUpperCase()
}

const AccountNav = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  // next-intl usePathname returns the internal, locale-stripped pathname
  // (e.g. "/account/profile"), so route comparisons don't need the locale prefix.
  const route = usePathname()
  const { locale } = useParams() as { locale: string }
  const countryCode = extractCountryCode(locale)
  const t = useTranslations("Account.Nav")

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const links: {
    href: NavHref
    label: string
    icon: React.ReactNode
    testId: string
  }[] = [
    {
      href: "/account",
      label: t("overview"),
      icon: <House />,
      testId: "overview-link",
    },
    {
      href: "/account/profile",
      label: t("profile"),
      icon: <User />,
      testId: "profile-link",
    },
    {
      href: "/account/addresses",
      label: t("addresses"),
      icon: <MapPin />,
      testId: "addresses-link",
    },
    {
      href: "/account/wishlist",
      label: t("wishlist"),
      icon: <Heart />,
      testId: "wishlist-link",
    },
    {
      href: "/account/orders",
      label: t("orders"),
      icon: <ShoppingBag />,
      testId: "orders-link",
    },
  ]

  const initials = getInitials(customer)
  const greeting = t("hello", { name: customer?.first_name || "" })

  return (
    <div>
      {/* Mobile: identity bar + horizontally scrollable tabs */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
          <Avatar initials={initials} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-black">
              {greeting}
            </p>
            <p className="truncate text-[13px] text-secondary">
              {customer?.email}
            </p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-secondary transition-colors hover:border-red hover:text-red"
            onClick={handleLogout}
            aria-label={t("logout")}
            title={t("logout")}
            data-testid="logout-button"
          >
            <ArrowRightOnRectangle />
          </button>
        </div>
        <nav
          aria-label={t("account")}
          className="mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex w-max gap-2 pb-1">
            {links.map((link) => (
              <li key={link.testId}>
                <AccountNavLink
                  href={link.href}
                  route={route}
                  variant="pill"
                  icon={link.icon}
                  data-testid={
                    link.href === "/account" ? "account-main-link" : link.testId
                  }
                >
                  {link.label}
                </AccountNavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Desktop: sidebar card */}
      <div
        className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] small:block"
        data-testid="account-nav"
      >
        <div className="flex items-center gap-3 border-b border-line p-5">
          <Avatar initials={initials} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-black">
              {greeting}
            </p>
            <p
              className="truncate text-[13px] text-secondary"
              title={customer?.email}
            >
              {customer?.email}
            </p>
          </div>
        </div>
        <nav aria-label={t("account")} className="p-3">
          <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary2">
            {t("account")}
          </p>
          <ul className="flex flex-col gap-y-1">
            {links.map((link) => (
              <li key={link.testId}>
                <AccountNavLink
                  href={link.href}
                  route={route}
                  icon={link.icon}
                  data-testid={link.testId}
                >
                  {link.label}
                </AccountNavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-3">
          <button
            type="button"
            className="flex w-full items-center gap-x-3 rounded-lg px-3 py-2.5 text-[15px] text-secondary transition-colors hover:bg-red/5 hover:text-red"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            <ArrowRightOnRectangle />
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const Avatar = ({ initials }: { initials: string }) => (
  <span
    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-[15px] font-semibold uppercase tracking-wide text-white"
    aria-hidden
  >
    {initials}
  </span>
)

type AccountNavLinkProps = {
  href: NavHref
  route: string
  icon: React.ReactNode
  variant?: "sidebar" | "pill"
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  icon,
  variant = "sidebar",
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  // `route` is the internal pathname from next-intl's usePathname and `href` is
  // the internal target, so they can be compared directly. Nested pages (e.g.
  // order details) keep their parent section highlighted.
  const active =
    route === href ||
    (typeof href === "string" &&
      href !== "/account" &&
      route.startsWith(`${href}/`))

  return (
    <LocalizedClientLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={clx(
        "flex items-center transition-colors",
        variant === "sidebar" && "gap-x-3 rounded-lg px-3 py-2.5 text-[15px]",
        variant === "pill" &&
          "gap-x-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm",
        variant === "sidebar" && {
          "bg-black font-medium text-white": active,
          "text-secondary hover:bg-surface hover:text-black": !active,
        },
        variant === "pill" && {
          "border-black bg-black font-medium text-white": active,
          "border-line bg-white text-secondary hover:border-black hover:text-black":
            !active,
        }
      )}
      data-testid={dataTestId}
    >
      <span className="flex shrink-0 items-center" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </LocalizedClientLink>
  )
}

export default AccountNav
