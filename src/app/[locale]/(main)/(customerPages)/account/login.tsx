import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { getLocalizedMetadata } from "@lib/util/metadata"
import { getPathname } from "@i18n/routing"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.Account.Login")
}

const getSafeRedirectPath = (redirectTo: string | string[] | undefined, fallback: string) => {
  const value = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo

  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
  ) {
    return value
  }

  return fallback
}

export default async function Login({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ redirect_to?: string | string[] }>
}) {
  const { locale } = await params
  const { redirect_to } = await searchParams

  return (
    <LoginTemplate
      redirectTo={getSafeRedirectPath(
        redirect_to,
        getPathname({ href: "/account", locale })
      )}
    />
  )
}
