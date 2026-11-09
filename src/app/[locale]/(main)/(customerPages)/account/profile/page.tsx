import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import AccountPageHeader from "@modules/account/components/page-header"

import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { getLocalizedMetadata } from "@lib/util/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Account.Profile")
}

export default async function Profile() {
  const t = await getTranslations("Account.Pages.Profile")
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <AccountPageHeader title={t("heading")} description={t("description")} />
      <div className="flex w-full flex-col divide-y divide-line rounded-xl border border-line">
        <ProfileSection>
          <ProfileName customer={customer} />
        </ProfileSection>
        <ProfileSection>
          <ProfileEmail customer={customer} />
        </ProfileSection>
        <ProfileSection>
          <ProfilePhone customer={customer} />
        </ProfileSection>
        <ProfileSection>
          <ProfileBillingAddress customer={customer} regions={regions} />
        </ProfileSection>
      </div>
    </div>
  )
}

const ProfileSection = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-5 small:p-6">{children}</div>
}
