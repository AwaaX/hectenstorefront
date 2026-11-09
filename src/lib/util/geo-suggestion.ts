/**
 * Shared between the middleware (which writes this cookie) and the client-side
 * geo-switch prompt (which reads it). Kept dependency-free so it can be
 * imported from both server and client code without pulling in Node-only or
 * Next.js server APIs.
 */
export const GEO_SUGGESTION_COOKIE = "_medusa_geo_suggestion"

export type GeoSuggestion = {
  /** The visitor's geolocated locale, e.g. "fr-fr" */
  locale: string
  /** The visitor's geolocated country code, e.g. "FR" */
  country: string
  /** The homepage path in the suggested locale, e.g. "/fr-fr" */
  path: string
}
