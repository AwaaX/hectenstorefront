"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

const REGION_CACHE_TTL = 3600 * 1000 // 1 hour

interface RegionMapCache {
  regionMap: Map<string, HttpTypes.StoreRegion>
  lastUpdated: number
}

const regionMapCache: RegionMapCache = {
  regionMap: new Map(),
  lastUpdated: 0,
}

const isCacheValid = () => {
  return (
    regionMapCache.regionMap.size > 0 &&
    regionMapCache.lastUpdated > Date.now() - REGION_CACHE_TTL
  )
}

const updateRegionMapCache = (regions: HttpTypes.StoreRegion[]) => {
  regionMapCache.regionMap.clear()
  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMapCache.regionMap.set(c?.iso_2 ?? "", region)
    })
  })
  regionMapCache.lastUpdated = Date.now()
}

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: { revalidate: 5 },
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

export const getOrBuildRegionMap = async () => {
  if (isCacheValid()) {
    return regionMapCache.regionMap
  }

  try {
    const regions = await listRegions()
    if (!regions) {
      return regionMapCache.regionMap
    }
    updateRegionMapCache(regions)
  } catch (error) {
    console.error("Failed to build region map cache:", error)
  }

  return regionMapCache.regionMap
}

export const getRegion = async (countryCode: string) => {
  try {
    const regionMap = await getOrBuildRegionMap()

    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    return regionMap.get("gb") ?? null
  } catch (e: any) {
    return null
  }
}
