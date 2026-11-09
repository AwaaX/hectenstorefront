/**
 * Static Routes Configuration
 * Hard-coded routes that don't require data fetching.
 * Separated from async functions to avoid Server Actions restrictions.
 */

export interface StaticRoute {
  path: string
}

/**
 * Static routes that appear in every locale's sitemap
 */
export function getStaticRoutes(): StaticRoute[] {
  return [
    { path: "/" },
    { path: "/customer-service" },
    { path: "/privacy-policy" },
    { path: "/legal-notice" },
    { path: "/general-terms-of-sale" },
    { path: "/terms-of-delivery" },
    { path: "/return-and-refund" },
    { path: "/measurement-guide" },
    { path: "/humanitarian-project" },
  ]
}
