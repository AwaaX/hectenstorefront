import { HttpTypes } from "@medusajs/types"

/**
 * Generates a URL-safe slug from a string
 * Examples: "Size" → "size", "Baby 3-4M" → "baby-3-4m"
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

/**
 * Creates a bidirectional mapping between option/value IDs and their slugs
 * Returns both ID→slug and slug→ID mappings
 */
export const createOptionSlugMappings = (
  options: HttpTypes.StoreProductOption[]
) => {
  const optionIdToSlug = new Map<string, string>()
  const optionSlugToId = new Map<string, string>()
  const valueIdToSlug = new Map<string, string>()
  const valueSlugToId = new Map<string, string>()

  options.forEach((option) => {
    // Map option ID to slug
    const optionSlug = generateSlug(option.title)
    optionIdToSlug.set(option.id, optionSlug)
    optionSlugToId.set(optionSlug, option.id)

    // Map each value ID to slug
    if (option.values) {
      option.values.forEach((value) => {
        const valueSlug = generateSlug(value.value)
        // Store with unique key to handle values with same slug from different options
        valueIdToSlug.set(value.id, valueSlug)
        // For reverse mapping, store: slug → array of value IDs
        // This handles cases where multiple values might have same slug
        const existingIds = valueSlugToId.get(valueSlug)
        if (existingIds) {
          valueSlugToId.set(valueSlug, existingIds + "," + value.id)
        } else {
          valueSlugToId.set(valueSlug, value.id)
        }
      })
    }
  })

  return {
    optionIdToSlug,
    optionSlugToId,
    valueIdToSlug,
    valueSlugToId,
  }
}

/**
 * Converts URL slug-based params to ID-based params
 * Example input: { size: "large,medium", color: "red" }
 * Example output: { option_opt_123abc: "optval_456def,optval_789ghi" }
 */
export const convertSlugsToIds = (
  slugParams: Record<string, string | string[] | undefined>,
  options: HttpTypes.StoreProductOption[]
): Record<string, string> => {
  const mappings = createOptionSlugMappings(options)
  const idParams: Record<string, string> = {}

  Object.entries(slugParams).forEach(([paramKey, paramValue]) => {
    // Skip non-option params (like page, sortBy, etc)
    if (paramKey === "page" || paramKey === "sortBy" || !paramValue) {
      return
    }

    // Try to find the option ID from the slug
    const optionId = mappings.optionSlugToId.get(paramKey)
    if (!optionId) return // Not an option filter

    const valueIds: string[] = []
    const values = Array.isArray(paramValue) ? paramValue : paramValue.split(",")

    values.forEach((valueSlug) => {
      const ids = mappings.valueSlugToId.get(valueSlug)
      if (ids) {
        // ids might be comma-separated if there are duplicates
        valueIds.push(...ids.split(","))
      }
    })

    if (valueIds.length > 0) {
      idParams[`option_${optionId}`] = valueIds.join(",")
    }
  })

  return idParams
}

/**
 * Converts ID-based URL params to slug-based params for cleaner URLs
 * Example input: { option_opt_123abc: "optval_456def,optval_789ghi" }
 * Example output: { size: "large,medium" }
 */
export const convertIdsToSlugs = (
  idParams: Record<string, string | string[] | undefined>,
  options: HttpTypes.StoreProductOption[]
): Record<string, string> => {
  const mappings = createOptionSlugMappings(options)
  const slugParams: Record<string, string> = {}

  Object.entries(idParams).forEach(([paramKey, paramValue]) => {
    if (!paramKey.startsWith("option_") || !paramValue) return

    const optionId = paramKey.replace("option_", "")
    const optionSlug = mappings.optionIdToSlug.get(optionId)
    if (!optionSlug) return

    const valueSlugs: string[] = []
    const valueIds = Array.isArray(paramValue) ? paramValue : paramValue.split(",")

    valueIds.forEach((valueId) => {
      const slug = mappings.valueIdToSlug.get(valueId)
      if (slug) {
        valueSlugs.push(slug)
      }
    })

    if (valueSlugs.length > 0) {
      slugParams[optionSlug] = valueSlugs.join(",")
    }
  })

  return slugParams
}
