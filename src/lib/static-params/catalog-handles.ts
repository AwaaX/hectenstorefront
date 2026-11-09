import { sdk } from "@lib/config"

const PAGE_SIZE = 100

type Page<Key extends string> = { count: number } & {
  [K in Key]: Array<{ handle?: string }>
}

/**
 * Lists the handles served in `locale`, following pagination.
 * Asks for `handle` only (no region, so no pricing) and lets the locale header
 * translate it, which keeps each request a few KB.
 */
async function listHandles<Key extends string>(
  endpoint: string,
  key: Key,
  locale: string
): Promise<string[]> {
  const handles: string[] = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await sdk.client.fetch<Page<Key>>(endpoint, {
      query: { fields: "handle", limit: PAGE_SIZE, offset },
      headers: { "x-medusa-locale": locale },
      next: { revalidate: 3600 },
    })

    const items = page[key] ?? []
    handles.push(
      ...items.map((item) => item.handle).filter((h): h is string => Boolean(h))
    )

    if (!items.length || handles.length >= page.count) {
      return handles
    }
  }
}

export const listProductHandles = (locale: string) =>
  listHandles("/store/products", "products", locale)

export const listCategoryHandles = (locale: string) =>
  listHandles("/store/product-categories", "product_categories", locale)
