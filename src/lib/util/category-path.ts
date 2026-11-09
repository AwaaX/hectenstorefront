import { HttpTypes } from "@medusajs/types"

/**
 * Builds a full category path including all ancestor handles
 * Example: "grandparent-slug/parent-slug/category-slug"
 */
export function buildCategoryPath(
  category: HttpTypes.StoreProductCategory
): string {
  const handles: string[] = []

  function collectHandles(cat: HttpTypes.StoreProductCategory) {
    if ((cat as any).parent_category) {
      collectHandles((cat as any).parent_category as HttpTypes.StoreProductCategory)
    }
    if (cat.handle) {
      handles.push(cat.handle)
    }
  }

  collectHandles(category)
  return handles.join("/")
}

/**
 * Builds category path segments as an array
 * Example: ["grandparent-slug", "parent-slug", "category-slug"]
 */
export function buildCategoryPathSegments(
  category: HttpTypes.StoreProductCategory
): string[] {
  const handles: string[] = []

  function collectHandles(cat: HttpTypes.StoreProductCategory) {
    if ((cat as any).parent_category) {
      collectHandles((cat as any).parent_category as HttpTypes.StoreProductCategory)
    }
    if (cat.handle) {
      handles.push(cat.handle)
    }
  }

  collectHandles(category)
  return handles
}
