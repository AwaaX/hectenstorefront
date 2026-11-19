import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { createTranslator } from "next-intl"
import { cache } from "react"
import { defaultLocale, locales } from "@i18n/routing"
import {
  getCompanyInformation,
  getSiteBrandInformation,
} from "@lib/data/information"
import {
  STORE_UNAVAILABLE_HEADER,
  STORE_UNAVAILABLE_LOCALE_HEADER,
} from "@lib/util/store-unavailable"

// Served by the middleware with a 503 when no region is configured, so it must
// be rendered per request and never cached as a regular page.
export const dynamic = "force-dynamic"

const FALLBACK_BRAND_NAME = "Hecten"
// The page must render even when the backend is slow or down.
const BACKEND_TIMEOUT_MS = 2000

const withTimeout = async <T,>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise.catch(() => fallback),
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms)
      }),
    ])
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

// Null unless the request came through the middleware's no-region check.
const getContext = cache(async () => {
  const requestHeaders = await headers()
  if (requestHeaders.get(STORE_UNAVAILABLE_HEADER) !== "1") {
    return null
  }

  const requested = requestHeaders
    .get(STORE_UNAVAILABLE_LOCALE_HEADER)
    ?.toLowerCase()
  const locale = locales.find((l) => l === requested) ?? defaultLocale
  const messages = (await import(`../../../messages/${locale}.json`)).default

  return {
    locale,
    t: createTranslator({ locale, messages, namespace: "StoreUnavailable" }),
  }
})

export async function generateMetadata(): Promise<Metadata> {
  const context = await getContext()
  if (!context) {
    return {}
  }
  return {
    title: context.t("metaTitle"),
    robots: { index: false, follow: false },
  }
}

/** Hecten-styled page shown to visitors while no store region is set up */
export default async function StoreUnavailablePage() {
  const context = await getContext()
  if (!context) {
    notFound()
  }

  const { locale, t } = context
  const [brand, company] = await Promise.all([
    withTimeout(getSiteBrandInformation(), BACKEND_TIMEOUT_MS, {}),
    withTimeout(getCompanyInformation(), BACKEND_TIMEOUT_MS, {}),
  ])
  const brandName = brand?.name || FALLBACK_BRAND_NAME
  const email = company?.email

  return (
    <div
      lang={locale}
      className="flex min-h-screen flex-col bg-white font-[system-ui] text-black"
    >
      {/* Full logo only when the backend has one; the icon below covers the rest */}
      {brand?.logo && (
        <header className="border-b border-[#eee]">
          <div className="content-container flex h-[77px] items-center justify-center">
            {/* Plain <img>: a backend-provided logo URL must never break this page */}
            <img
              src={brand.logo}
              alt={brandName}
              className="h-[16px] w-auto object-contain"
            />
          </div>
        </header>
      )}

      <main className="flex flex-1 items-center justify-center bg-[linear-gradient(0deg,#fff_0%,rgba(0,0,0,0.07)_100%)] px-5 py-16">
        <div className="flex max-w-[560px] flex-col items-center text-center">
          <img
            src="/hecten-icon.svg"
            alt=""
            width={100}
            height={69}
            className="mb-8 h-auto w-[90px]"
          />
          <p className="pl-[12.8px] text-[12.8px] leading-[19.2px] font-bold uppercase tracking-[12.8px]">
            {brandName}
          </p>
          <h1 className="mt-4 text-[28px] leading-[38px] md:text-[34px] md:leading-[44px]">
            {t("title")}
          </h1>
          <p className="mt-4 text-[16px] leading-[26px] text-[#666]">
            {t("message")}
          </p>

          {/* Plain link reloads the visitor's own URL, no JavaScript needed */}
          <a
            href=""
            className="mt-8 inline-flex h-[50px] items-center justify-center rounded-[6px] bg-[#ef7a4c] px-10 text-[16px] font-semibold text-white duration-200 hover:bg-[#e2683a]"
          >
            {t("retry")}
          </a>

          {email && (
            <p className="mt-10 text-[14px] leading-[22px] text-[#666]">
              {t("contact")}{" "}
              <a
                href={`mailto:${email}`}
                className="break-all text-black underline underline-offset-4"
              >
                {email}
              </a>
            </p>
          )}
        </div>
      </main>

      <footer className="border-t border-[#eee] py-5 text-center text-[13.6px] text-[#666]">
        &copy; {new Date().getFullYear()} {brandName}
      </footer>
    </div>
  )
}
