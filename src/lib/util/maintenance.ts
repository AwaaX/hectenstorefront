import { defaultLocale, locales } from "@i18n/routing"

/**
 * Shared constants and pure helpers for maintenance mode. Kept free of Next.js
 * server imports so they can run in the Edge runtime (middleware).
 */

export type MaintenanceState = {
  enabled: boolean
  title: string | null
  message: string | null
  expected_end_at: string | null
}

export const MAINTENANCE_DISABLED: MaintenanceState = {
  enabled: false,
  title: null,
  message: null,
  expected_end_at: null,
}

// Bypass for developers: visit `/?maintenance_bypass=<token>` once to set a
// cookie, or send the token in the `x-maintenance-bypass` header (scripts, CI).
export const MAINTENANCE_BYPASS_PARAM = "maintenance_bypass"
export const MAINTENANCE_BYPASS_HEADER = "x-maintenance-bypass"
export const MAINTENANCE_BYPASS_COOKIE = "_maintenance_bypass"
export const MAINTENANCE_BYPASS_MAX_AGE = 60 * 60 * 24 // 24h
const MIN_BYPASS_TOKEN_LENGTH = 16

// Request headers the middleware uses to hand the state to the maintenance page.
export const MAINTENANCE_ACTIVE_HEADER = "x-maintenance-active"
export const MAINTENANCE_STATE_HEADER = "x-maintenance-state"
export const MAINTENANCE_LOCALE_HEADER = "x-maintenance-locale"

// Retry-After bounds, in seconds. Used when no usable end time is set.
const DEFAULT_RETRY_AFTER = 60 * 60
const MIN_RETRY_AFTER = 60
const MAX_RETRY_AFTER = 60 * 60 * 24

export const normalizeMaintenanceState = (raw: unknown): MaintenanceState => {
  const value = (raw ?? {}) as Partial<Record<keyof MaintenanceState, unknown>>
  const text = (field: unknown) =>
    typeof field === "string" && field.trim() ? field.trim() : null
  const endAt = text(value.expected_end_at)

  return {
    enabled: value.enabled === true,
    title: text(value.title),
    message: text(value.message),
    expected_end_at:
      endAt && !Number.isNaN(new Date(endAt).getTime()) ? endAt : null,
  }
}

/**
 * Value for the Retry-After header: seconds until the expected end, clamped to
 * a sane window, or one hour when there is no end time or it already passed.
 */
export const getRetryAfterSeconds = (
  expectedEndAt: string | null,
  now: number = Date.now()
): number => {
  if (!expectedEndAt) {
    return DEFAULT_RETRY_AFTER
  }

  const seconds = Math.ceil((new Date(expectedEndAt).getTime() - now) / 1000)
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return DEFAULT_RETRY_AFTER
  }

  return Math.min(MAX_RETRY_AFTER, Math.max(MIN_RETRY_AFTER, seconds))
}

// ---------------------------------------------------------------------------
// Bypass token
// ---------------------------------------------------------------------------

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

// Both sides are fixed-length hex digests, so a plain loop is enough.
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false
  }
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

let expectedHashPromise: Promise<string | null> | null = null
let warnedShortToken = false

/**
 * SHA-256 of MAINTENANCE_BYPASS_TOKEN, or null when bypass isn't configured.
 * The cookie stores this hash rather than the token itself.
 */
export const getBypassHash = (): Promise<string | null> => {
  expectedHashPromise ??= (async () => {
    const token = process.env.MAINTENANCE_BYPASS_TOKEN?.trim()
    if (!token) {
      return null
    }
    if (token.length < MIN_BYPASS_TOKEN_LENGTH) {
      if (!warnedShortToken) {
        warnedShortToken = true
        console.warn(
          `[MAINTENANCE] MAINTENANCE_BYPASS_TOKEN is shorter than ${MIN_BYPASS_TOKEN_LENGTH} characters and is ignored. Bypass is disabled.`
        )
      }
      return null
    }
    return sha256Hex(token)
  })()
  return expectedHashPromise
}

/** True when `candidate` is the configured bypass token. */
export const isBypassToken = async (
  candidate: string | null | undefined
): Promise<boolean> => {
  const expected = await getBypassHash()
  if (!expected || !candidate) {
    return false
  }
  return safeEqual(await sha256Hex(candidate), expected)
}

/** True when `value` is the hashed token stored in the bypass cookie. */
export const isBypassCookie = async (
  value: string | null | undefined
): Promise<boolean> => {
  const expected = await getBypassHash()
  if (!expected || !value) {
    return false
  }
  return safeEqual(value, expected)
}

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

const localeSet = new Set<string>(locales)

const matchLocale = (tag: string): string | null => {
  const normalized = tag.trim().toLowerCase()
  if (localeSet.has(normalized)) {
    return normalized
  }

  const language = normalized.split("-")[0]
  if (!language) {
    return null
  }
  if (language === defaultLocale.split("-")[0]) {
    return defaultLocale
  }
  return locales.find((locale) => locale.startsWith(`${language}-`)) ?? null
}

const parseAcceptLanguage = (header: string): string[] =>
  header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
      return { tag, q: q ? parseFloat(q.slice(2)) : 1 }
    })
    .filter((entry) => entry.tag && entry.tag !== "*" && entry.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag)

/**
 * Picks the language of the maintenance page. Maintenance short-circuits the
 * regular locale detection, so this uses the URL, then the saved locale
 * cookie, then the browser's Accept-Language, then the default locale.
 */
export const resolveMaintenanceLocale = (
  pathname: string,
  cookieLocale: string | null | undefined,
  acceptLanguage: string | null | undefined
): string => {
  const urlSegment = pathname.split("/")[1]?.toLowerCase()
  if (urlSegment && localeSet.has(urlSegment)) {
    return urlSegment
  }

  const fromCookie = cookieLocale ? matchLocale(cookieLocale) : null
  if (fromCookie) {
    return fromCookie
  }

  if (acceptLanguage) {
    for (const tag of parseAcceptLanguage(acceptLanguage)) {
      const match = matchLocale(tag)
      if (match) {
        return match
      }
    }
  }

  return defaultLocale
}
