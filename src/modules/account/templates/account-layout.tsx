import React from "react"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  if (!customer) {
    return (
      <div className="plain-theme flex-1 small:py-12" data-testid="account-page">
        <div className="small-container flex h-full flex-1 flex-col bg-white">
          <div className="flex-1">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="plain-theme flex-1 bg-surface py-6 small:py-12"
      data-testid="account-page"
    >
      <div className="small-container">
        <div className="grid grid-cols-1 items-start gap-4 small:grid-cols-[280px_minmax(0,1fr)] small:gap-8">
          <aside className="small:sticky small:top-8">
            <AccountNav customer={customer} />
          </aside>
          <div className="min-w-0 border border-[#e1e1e1] bg-white p-5 small:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout
