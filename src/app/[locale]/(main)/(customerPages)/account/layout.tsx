import { retrieveCustomer } from "@lib/data/customer"
import AccountLayout from "@modules/account/templates/account-layout"

// Toasts are rendered by the <Toaster /> in WishlistProvider ((main)/layout.tsx).
// Mounting a second one here makes sonner update both during render.
export default async function AccountPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return <AccountLayout customer={customer}>{children}</AccountLayout>
}
