import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import AddressBook from "@modules/account/components/address-book"
import AccountPageHeader from "@modules/account/components/page-header"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocalizedMetadata } from "@lib/util/metadata"
import { extractCountryCode } from "@lib/util/locale"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Account.Addresses")
}

export default async function Addresses(props: {
  params: Promise<{ locale: string }>
}) {
  const params = await props.params
  const countryCode = extractCountryCode(params.locale)
  const t = await getTranslations("Account.Pages.Addresses")
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <AccountPageHeader title={t("heading")} description={t("description")} />
      <AddressBook customer={customer} region={region} />
    </div>
  )
}
