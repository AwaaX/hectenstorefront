"use client"

import { Link } from "@i18n/routing"
import React from "react"

/**
 * Client component wrapper for localized links.
 * The Link component from next-intl/routing automatically handles locale prefixing
 * based on the configured pathnames and current locale.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: React.ComponentProps<typeof Link> & {
  children?: React.ReactNode
}) => {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
