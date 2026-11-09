import { ChevronRight, MapPin, ShoppingBag, User } from "@medusajs/icons"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import OrderStatusBadge from "@modules/account/components/order-status-badge"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { getLocale, getTranslations } from "next-intl/server"

type OverviewProps = {
  customer: HttpTypes.StoreCustomer | null
  orders: HttpTypes.StoreOrder[] | null
}

// listOrders() fetches a single page of this size, so a full page means the
// customer may have more orders than we received.
const ORDERS_PAGE_SIZE = 10

const Overview = async ({ customer, orders }: OverviewProps) => {
  const t = await getTranslations("Account.Overview")
  const tOrders = await getTranslations("Account.OrderOverview")
  const locale = await getLocale()

  const profileCompletion = getProfileCompletion(customer)
  const addressCount = customer?.addresses?.length || 0
  const orderCount = orders?.length || 0
  const recentOrders = orders?.slice(0, 5) ?? []

  return (
    <div className="flex flex-col gap-y-10" data-testid="overview-page-wrapper">
      <div className="flex flex-col gap-3 border-b border-line pb-6 small:flex-row small:items-end small:justify-between">
        <div className="flex flex-col gap-y-1.5">
          <h1
            className="text-[26px] font-semibold leading-tight text-black"
            data-testid="welcome-message"
            data-value={customer?.first_name}
          >
            {t("hello", { name: customer?.first_name || "" })}
          </h1>
          <p className="text-[15px] text-secondary">{t("subtitle")}</p>
        </div>
        <p className="min-w-0 text-sm text-secondary">
          {t("signedInAs")}{" "}
          <span
            className="break-all font-semibold text-black"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          href="/account/profile"
          icon={<User />}
          label={t("profile")}
          value={`${profileCompletion}%`}
          suffix={t("completed")}
          valueTestId="customer-profile-completion"
          dataValue={profileCompletion}
        >
          <div className="mt-4 flex flex-col gap-y-2">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface"
              role="progressbar"
              aria-valuenow={profileCompletion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("profile")}
            >
              <div
                className="h-full rounded-full bg-black transition-[width] duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <span className="text-xs font-medium text-secondary group-hover:text-black">
                {t("completeProfile")} &rarr;
              </span>
            )}
          </div>
        </StatCard>
        <StatCard
          href="/account/addresses"
          icon={<MapPin />}
          label={t("addresses")}
          value={addressCount}
          suffix={t("saved")}
          valueTestId="addresses-count"
          dataValue={addressCount}
        />
        <StatCard
          href="/account/orders"
          icon={<ShoppingBag />}
          label={t("orders")}
          value={
            orderCount >= ORDERS_PAGE_SIZE ? `${ORDERS_PAGE_SIZE}+` : orderCount
          }
          suffix={t("placed")}
          valueTestId="orders-count"
          dataValue={orderCount}
        />
      </div>

      <section className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-black">
            {t("recentOrders")}
          </h2>
          {orderCount > 0 && (
            <LocalizedClientLink
              href="/account/orders"
              className="inline-flex items-center gap-x-1 text-sm font-medium text-black underline-offset-4 hover:underline"
            >
              {t("viewAll")}
              <ChevronRight />
            </LocalizedClientLink>
          )}
        </div>

        <div data-testid="orders-wrapper">
          {recentOrders.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="hidden grid-cols-[0.8fr_1fr_1.3fr_1fr_20px] gap-x-4 bg-surface px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary medium:grid">
                <span>{t("orderNumber")}</span>
                <span>{t("datePlaced")}</span>
                <span>{t("status")}</span>
                <span className="text-right">{t("totalAmount")}</span>
                <span />
              </div>
              <ul className="divide-y divide-line">
                {recentOrders.map((order) => (
                  <li
                    key={order.id}
                    data-testid="order-wrapper"
                    data-value={order.id}
                  >
                    <LocalizedClientLink
                      href={{
                        pathname: "/account/orders/details/[id]",
                        params: { id: order.id },
                      }}
                      className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-5 py-4 transition-colors hover:bg-surface/60 medium:grid-cols-[0.8fr_1fr_1.3fr_1fr_20px]"
                    >
                      <span
                        className="order-1 text-[15px] font-semibold text-black medium:order-none"
                        data-testid="order-id"
                        data-value={order.display_id}
                      >
                        #{order.display_id}
                      </span>
                      <span
                        className="order-3 text-sm text-secondary medium:order-none"
                        data-testid="order-created-date"
                      >
                        {new Date(order.created_at).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="order-4 justify-self-end medium:order-none medium:justify-self-start">
                        <OrderStatusBadge status={order.fulfillment_status} />
                      </span>
                      <span
                        className="order-2 text-right text-[15px] font-semibold text-black medium:order-none"
                        data-testid="order-amount"
                      >
                        {convertToLocale({
                          locale,
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </span>
                      <span
                        className="hidden text-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-black medium:order-none medium:flex"
                        data-testid="open-order-button"
                      >
                        <span className="sr-only">
                          {t("goToOrder", { id: order.display_id ?? "" })}
                        </span>
                        <ChevronRight aria-hidden />
                      </span>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-y-4 rounded-xl border border-dashed border-line px-6 py-12 text-center"
              data-testid="no-orders-message"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-secondary">
                <ShoppingBag />
              </span>
              <p className="text-[15px] text-secondary">
                {t("noRecentOrders")}
              </p>
              <LocalizedClientLink
                href="/"
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green hover:text-black"
              >
                {tOrders("continueShopping")}
              </LocalizedClientLink>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

type StatCardProps = {
  href: "/account/profile" | "/account/addresses" | "/account/orders"
  icon: React.ReactNode
  label: string
  value: string | number
  suffix: string
  valueTestId: string
  dataValue: string | number
  children?: React.ReactNode
}

const StatCard = ({
  href,
  icon,
  label,
  value,
  suffix,
  valueTestId,
  dataValue,
  children,
}: StatCardProps) => {
  return (
    <LocalizedClientLink
      href={href}
      className="group flex flex-col rounded-xl border border-line bg-white p-5 transition-all hover:border-black/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-secondary">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-black transition-colors group-hover:bg-black group-hover:text-white">
          {icon}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className="text-3xl font-semibold leading-none text-black"
          data-testid={valueTestId}
          data-value={dataValue}
        >
          {value}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.08em] text-secondary">
          {suffix}
        </span>
      </div>
      {children}
    </LocalizedClientLink>
  )
}

const getProfileCompletion = (customer: HttpTypes.StoreCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
