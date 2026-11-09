/**
 * Field sets sent to the Medusa store API. Keeping them here makes payload size a
 * deliberate, reviewable decision instead of something buried in a query.
 *
 * Translations reach these queries through the `x-medusa-locale` header. Never add an
 * unsuffixed `custom_translation` field to them: it overrides the header and returns
 * untranslated content.
 */

/** Everything a product card (grid, list, slider) renders, plus what `sortProducts` needs. */
export const PRODUCT_CARD_FIELDS = [
  "id",
  "title",
  "subtitle",
  "handle",
  "thumbnail",
  "created_at",
  "collection.title",
  "variants.id",
  "variants.sku",
  "variants.title",
  "variants.manage_inventory",
  "variants.allow_backorder",
  "variants.inventory_quantity",
  "variants.calculated_price.calculated_amount",
  "variants.calculated_price.original_amount",
  "variants.calculated_price.currency_code",
  "variants.calculated_price.calculated_price.price_list_type",
].join(",")

/** Everything the product detail page renders (gallery, actions, tabs, JSON-LD) in one request. */
export const PRODUCT_PAGE_FIELDS = [
  "*variants.calculated_price",
  "+variants.inventory_quantity",
  "*sizeguides",
  // "+categories.name",
  // "+categories.rank",
  // "+categories.handle",
  // "+categories.parent_category",
  "+categories.*",
].join(",")

/** Lookup of every locale's handle for one product or category (hreflang alternates). */
export const TRANSLATION_LOOKUP_FIELDS = "handle,custom_translation"
