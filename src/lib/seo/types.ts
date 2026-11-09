/**
 * Sitemap System Types
 * Comprehensive type definitions for the multi-locale sitemap system.
 */

import { type Priority, type ChangeFreq } from "./sitemap-config"

/**
 * A single URL entry in a sitemap
 */
export interface SitemapEntry {
  /** The URL location */
  loc: string
  /** Last modification date (ISO 8601 format) */
  lastmod?: string
  /** How frequently the page changes */
  changefreq?: ChangeFreq
  /** Priority relative to other URLs on site (0.0-1.0) */
  priority?: Priority
}

/**
 * URL entry with hreflang alternates for multi-locale SEO
 */
export interface SitemapEntryWithAlternates extends SitemapEntry {
  /** Map of hreflang values to locale URLs */
  alternates: Record<string, string>
  /** x-default language alternate (points to default locale) */
  xDefault?: string
}

/**
 * Fetched entity from Medusa that will appear in sitemap
 */
export interface SitemapEntity {
  /** Unique identifier or handle */
  id?: string
  handle?: string
  /** Last update timestamp */
  updated_at?: string
}

/**
 * Product entity for sitemap
 */
export interface SitemapProduct extends SitemapEntity {
  handle: string
}

/**
 * Collection entity for sitemap
 */
export interface SitemapCollection extends SitemapEntity {
  handle: string
}

/**
 * Category entity for sitemap (supports hierarchical handles)
 */
export interface SitemapCategory extends SitemapEntity {
  handle: string
  parentHandle?: string
}

/**
 * Static route that doesn't require data fetching
 */
export interface StaticRoute {
  path: string
  lastmod?: string
}

/**
 * Result of sitemap generation
 */
export interface SitemapGenerationResult {
  /** Generated XML content */
  xml: string
  /** Total number of URLs */
  urlCount: number
  /** Locale this sitemap is for */
  locale: string
  /** Generation timestamp */
  generatedAt: Date
  /** Number of pages (if paginated) */
  pageCount: number
}

/**
 * Sitemap index entry
 */
export interface SitemapIndexEntry {
  url: string
  lastModified?: Date
}

/**
 * Configuration for a single route type in sitemap
 */
export interface RouteConfig {
  /** The path pattern (e.g., "/shop" for "/products/[handle]") */
  path: string
  /** Priority in sitemap (0.0-1.0) */
  priority: Priority
  /** How frequently the page changes */
  changefreq: ChangeFreq
}

/**
 * Complete sitemap configuration
 */
export interface SitemapSystemConfig {
  /** List of supported locales */
  locales: string[]
  /** Default/fallback locale */
  defaultLocale: string
  /** Base URL for the storefront */
  baseUrl: string
  /** Maximum URLs per sitemap file (default 40000) */
  maxUrlsPerSitemap: number
  /** Route configurations by path pattern */
  routes: Record<string, RouteConfig>
}

/**
 * Error details for sitemap generation failures
 */
export interface SitemapGenerationError {
  /** Error message */
  message: string
  /** Locale that failed */
  locale: string
  /** Error code or type */
  code?: string
  /** Original error if available */
  originalError?: Error
}
