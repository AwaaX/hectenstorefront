import { getLocale } from "@lib/data/locale-actions"
import { getRequestConfig } from "next-intl/server"
import { defaultLocale ,routing} from "./routing"


export default getRequestConfig(async () => {
  const cookieLocale = await getLocale()
  const locale = cookieLocale || defaultLocale

  // Load messages with fallback support
  // e.g., de-at falls back to de-de, then en-gb
  let messages
  const messageFallbacks = [locale]

  if (locale.includes('-')) {
    const baseLanguage = locale.split('-')[0]
    const matchingLocale = routing.locales.find(l => l.startsWith(baseLanguage))
    if (matchingLocale && matchingLocale !== locale) {
      messageFallbacks.push(matchingLocale)
    }
  }

  messageFallbacks.push(routing.defaultLocale)

  for (const fallbackLocale of messageFallbacks) {
    try {
      messages = (await import(`../../messages/${fallbackLocale}.json`)).default
      break
    } catch {
      continue
    }
  }

  if (!messages) {
    throw new Error(`Could not load messages for locale: ${locale}`)
  }

  return {
    locale,
    messages,
  }
})
