import { defaultLocale } from "@i18n/routing"
import {
  getLocaleVariations,
  normalizeLocaleToStorefront,
} from "@lib/util/locale"

export type CustomTranslation = Record<string, { handle?: string } | undefined>

/**
 * Picks the handle a product or category uses in `locale`.
 * The default locale uses the base handle; other locales use their
 * `custom_translation` entry, falling back to the base handle.
 */
export function resolveLocalizedHandle({
  handle,
  customTranslation,
  locale,
}: {
  handle?: string | null
  customTranslation?: CustomTranslation | null
  locale: string
}): string | null {
  const normalizedLocale = normalizeLocaleToStorefront(locale)

  if (normalizedLocale === normalizeLocaleToStorefront(defaultLocale)) {
    return handle ?? null
  }

  if (customTranslation) {
    for (const variation of getLocaleVariations(normalizedLocale)) {
      const translatedHandle = customTranslation[variation]?.handle
      if (translatedHandle) {
        return translatedHandle
      }
    }
  }

  return handle ?? null
}
