import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import Login, { generateMetadata as generateLoginMetadata } from "./login"
import OverviewTemplate, {
  generateMetadata as generateOverviewMetadata,
} from "./overview"

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ redirect_to?: string | string[] }>
}

export async function generateMetadata(): Promise<Metadata> {
  const customer = await retrieveCustomer().catch(() => null)

  return customer ? generateOverviewMetadata() : generateLoginMetadata()
}

export default async function AccountPage(props: Props) {
  const customer = await retrieveCustomer().catch(() => null)

  return customer ? <OverviewTemplate /> : <Login {...props} />
}
