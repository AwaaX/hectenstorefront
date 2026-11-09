/**
 * Sitemap Configuration
 * Centralized configuration for multi-locale sitemap generation.
 * Includes locale list from storefront (backend regions), route priorities, and change frequencies.
 */

import { defaultLocale } from "@i18n/routing"
import { getStorefrontLocales } from "@lib/util/storefront-locales"

export type Priority =
  | "0.0"
  | "0.1"
  | "0.2"
  | "0.3"
  | "0.4"
  | "0.5"
  | "0.6"
  | "0.7"
  | "0.8"
  | "0.9"
  | "1.0"
export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"

export interface SitemapRouteConfig {
  path: string
  priority: Priority
  changefreq: ChangeFreq
}

export interface SitemapConfig {
  locales: string[]
  defaultLocale: string
  baseUrl: string
  maxUrlsPerSitemap: number
  routes: Record<string, SitemapRouteConfig>
}

/**
 * Get base URL from environment or request
 */
export function getBaseUrl(host?: string): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  if (host) {
    return `https://${host}`
  }

  return "https://thechristmasfabric.com"
}

/**
 * Fetch locales from storefront (backend regions)
 * This is used at module load time to populate sitemapConfig
 */
const storefrontLocales = await getStorefrontLocales()

/**
 * Sitemap configuration with route priorities and change frequencies
 * Locales are fetched from the storefront backend (regions), not from routing config
 */
export const sitemapConfig: Omit<SitemapConfig, "baseUrl"> = {
  locales: storefrontLocales,
  defaultLocale,
  maxUrlsPerSitemap: 40000,
  routes: {
    // Home page
    "/": {
      path: "/",
      priority: "1.0",
      changefreq: "daily",
    },
    // Main collection
    "/shop": {
      path: "/shop",
      priority: "0.9",
      changefreq: "weekly",
    },
    // Product pages
    "/products/[handle]": {
      path: "/shop",
      priority: "0.8",
      changefreq: "weekly",
    },
    // Category pages (uses catch-all [...category] route)
    "/[...category]": {
      path: "/shop",
      priority: "0.7",
      changefreq: "weekly",
    },
    // Static pages
    "/customer-service": {
      path: "/customer-service",
      priority: "0.6",
      changefreq: "monthly",
    },
    "/privacy-policy": {
      path: "/privacy-policy",
      priority: "0.5",
      changefreq: "monthly",
    },
    "/legal-notice": {
      path: "/legal-notice",
      priority: "0.5",
      changefreq: "monthly",
    },
    "/general-terms-of-sale": {
      path: "/general-terms-of-sale",
      priority: "0.5",
      changefreq: "monthly",
    },
    "/terms-of-delivery": {
      path: "/terms-of-delivery",
      priority: "0.5",
      changefreq: "monthly",
    },
    "/return-and-refund": {
      path: "/return-and-refund",
      priority: "0.5",
      changefreq: "monthly",
    },
    "/measurement-guide": {
      path: "/measurement-guide",
      priority: "0.6",
      changefreq: "yearly",
    },
    "/humanitarian-project": {
      path: "/humanitarian-project",
      priority: "0.6",
      changefreq: "yearly",
    },
  },
}
