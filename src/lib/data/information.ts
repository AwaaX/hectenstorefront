"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { COMPANY_INFO_CACHE_TAG, SITE_BRAND_CACHE_TAG } from "@lib/constants"

export interface CompanyInformation {
  name?: string
  address?: string
  phone?: string
  email?: string
  logo?: string
  zip?: string
  city?: string
  country?: string
}

export interface SiteBrandInformation {
  name?: string
  logo?: string
}

export const retrieveCompanyInformation = async (): Promise<CompanyInformation | null> => {
  const tags = [COMPANY_INFO_CACHE_TAG]

  return sdk.client
    .fetch<{ company_information: CompanyInformation | null }>(
      `/store/company-information`,
      {
        method: "GET",
        next: { tags, revalidate: 3600 }, // tags + 1h fallback
        cache: "force-cache",
      }
    )
    .then(({ company_information }) => company_information)
    .catch(medusaError)
}

export const retrieveSiteBrandInformation = async (): Promise<SiteBrandInformation | null> => {
  const tags = [SITE_BRAND_CACHE_TAG]

  return sdk.client
    .fetch<{ site_brand_information: SiteBrandInformation | null }>(
      `/store/site-brand-information`,
      {
        method: "GET",
        next: { tags, revalidate: 3600 }, // tags + 1h fallback
        cache: "force-cache",
      }
    )
    .then(({ site_brand_information }) => site_brand_information)
    .catch(medusaError)
}

export const getCompanyInformation = async (): Promise<CompanyInformation> => {
  try {
    const info = await retrieveCompanyInformation()
    return info as CompanyInformation
  } catch (error) {
    console.error("Failed to retrieve company information:", error)
   return {} as CompanyInformation
  }
}

export const getSiteBrandInformation = async (): Promise<SiteBrandInformation> => {
  try {
    const info = await retrieveSiteBrandInformation()
    return info as SiteBrandInformation
  } catch (error) {
    console.error("Failed to retrieve site brand information:", error)
    return {} as SiteBrandInformation
  }
}




