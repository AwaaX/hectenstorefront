import { HttpTypes } from "@medusajs/types";

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}

export const getDefaultProductVariant = (
    product: HttpTypes.StoreProduct
): HttpTypes.StoreProductVariant | undefined => {
    const variants = product.variants ?? [];

    return (
        variants.find((variant) => {
            if (!variant.manage_inventory) {
                return true;
            }

            if (variant.allow_backorder) {
                return true;
            }

            return (variant.inventory_quantity ?? 0) > 0;
        }) ?? variants[0]
    );
}

// Null rank sorts last. Number.MAX_SAFE_INTEGER (not Infinity) so that
// two null ranks give 0 rather than NaN in the comparator.
const rankOf = (category: HttpTypes.StoreProductCategory): number =>
    category.rank ?? Number.MAX_SAFE_INTEGER

export const getBreadcrumbCategories = (
  categories: HttpTypes.StoreProductCategory[]
) => {
  if (!categories.length) return []

  // Prefer child categories; fall back to root-only if that's all there is
  const children = categories.filter((c) => c.parent_category)
  const pool = children.length ? children : categories
  const primary = [...pool].sort((a, b) => rankOf(a) - rankOf(b))[0]

  const crumbs = []

  if (primary.parent_category) {
    const parent = categories.find((c) => c.id === primary.parent_category?.id)
    if (parent) {
      crumbs.push({
        name: parent.name,
        handle: `/${parent.handle}`,
      })

      crumbs.push({
        name: primary.name,
        handle: `/${parent.handle}/${primary.handle}`,
      })
    }
  } else {
    crumbs.push({
      name: primary.name,
      handle: `/${primary.handle}`,
    })
  }
  return crumbs
}

export const isProductInStock = (
    product: HttpTypes.StoreProduct
): boolean => {
    const variants = product.variants ?? [];

    return variants.some((variant) => {
        if (!variant.manage_inventory) {
            return true;
        }

        if (variant.allow_backorder) {
            return true;
        }

        return (variant.inventory_quantity ?? 0) > 0;
    });
}
