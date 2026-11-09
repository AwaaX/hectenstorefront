import { locales } from "@i18n/routing"

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale.toLowerCase(),
  }))
}

export default function StaticPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
