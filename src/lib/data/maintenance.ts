import { sdk } from "@lib/config"
import {
  MAINTENANCE_DISABLED,
  MaintenanceState,
  normalizeMaintenanceState,
} from "@lib/util/maintenance"

// Read on (almost) every request by the middleware, so it is cached in memory.
// Toggling in the admin therefore takes effect within CACHE_TTL_MS.
const CACHE_TTL_MS = 10_000
const FETCH_TIMEOUT_MS = 2_500

let cache: { state: MaintenanceState; fetchedAt: number } | null = null
let inflight: Promise<MaintenanceState> | null = null

const fetchMaintenanceState = async (): Promise<MaintenanceState> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const { maintenance } = await sdk.client.fetch<{
      maintenance: MaintenanceState
    }>("/store/maintenance", {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })
    return normalizeMaintenanceState(maintenance)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Current maintenance state from the Medusa backend.
 *
 * Concurrent callers share one request. If the backend can't be reached the
 * last known state is kept (and retried after the TTL) so a blip never flips
 * the storefront; with no known state it fails open. The middleware already
 * answers with its own 503 when the backend is down.
 */
export const getMaintenanceState = async (): Promise<MaintenanceState> => {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.state
  }

  inflight ??= fetchMaintenanceState()
    .then((state) => {
      cache = { state, fetchedAt: Date.now() }
      return state
    })
    .catch((error) => {
      console.warn(
        `[MAINTENANCE] Could not read maintenance state: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      const state = cache?.state ?? MAINTENANCE_DISABLED
      cache = { state, fetchedAt: Date.now() }
      return state
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}
