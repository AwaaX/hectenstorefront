import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
// import TransferRequestForm from "@modules/account/components/transfer-request-form"
import AccountPageHeader from "@modules/account/components/page-header"
import { getTranslations } from "next-intl/server"
import { getLocalizedMetadata } from "@lib/util/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Account.Orders")
}

export default async function Orders() {
  const t = await getTranslations("Account.Pages.Orders")
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <AccountPageHeader title={t("heading")} description={t("description")} />
      <div className="flex flex-col gap-y-10">
        <OrderOverview orders={orders} />
        {/* Order transfers temporarily disabled
        <div className="rounded-xl border border-line bg-surface/60 p-5 small:p-6">
          <TransferRequestForm />
        </div> */}
      </div>
    </div>
  )
}
