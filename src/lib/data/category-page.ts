import "server-only"

import { cache } from "react"
import {
  getCategoryByHandle,
  getCategoryTranslations,
} from "@lib/data/categories"

/** Shared by generateMetadata, the JSON-LD and the page render of one visit. */
export const getCategoryPageData = cache(getCategoryByHandle)

export const getCachedCategoryTranslations = cache(getCategoryTranslations)
