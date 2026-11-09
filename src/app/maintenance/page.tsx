import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { createTranslator } from "next-intl"
import { cache } from "react"
import { FaInstagram, FaSnowflake, FaTiktok } from "react-icons/fa6"
import { defaultLocale, locales } from "@i18n/routing"
import {
  getCompanyInformation,
  getSiteBrandInformation,
} from "@lib/data/information"
import {
  MAINTENANCE_ACTIVE_HEADER,
  MAINTENANCE_LOCALE_HEADER,
  MAINTENANCE_STATE_HEADER,
  MaintenanceState,
  normalizeMaintenanceState,
} from "@lib/util/maintenance"
import ExpectedBack from "@modules/maintenance/components/expected-back"
import RefreshButton from "@modules/maintenance/components/refresh-button"

// Rendered per request: the middleware serves this page with a 503, so it must
// never be prerendered or cached as a regular page.
export const dynamic = "force-dynamic"

const FALLBACK_BRAND_NAME = "Hecten"
const FALLBACK_LOGO = "/logo.jpg"
const FALLBACK_EMAIL = "customer@thechristmasfabric.com"
// The page must render even when the backend is slow or down.
const BACKEND_TIMEOUT_MS = 2000

const INSTAGRAM_URL = "https://www.instagram.com/thechristmasfabric/"
const TIKTOK_URL = "https://www.tiktok.com/@thechristmasfabric"

const withTimeout = async <T,>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
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

const parseState = (raw: string | null): MaintenanceState => {
  try {
    return normalizeMaintenanceState(
      raw ? JSON.parse(decodeURIComponent(raw)) : null
    )
  } catch {
    return normalizeMaintenanceState(null)
  }
}

// Shared by generateMetadata and the page. Returns null unless the request
// came through the middleware's maintenance gate.
const getContext = cache(async () => {
  const requestHeaders = await headers()
  if (requestHeaders.get(MAINTENANCE_ACTIVE_HEADER) !== "1") {
    return null
  }

  const requestedLocale = requestHeaders.get(MAINTENANCE_LOCALE_HEADER)?.toLowerCase()
  const locale =
    locales.find((candidate) => candidate === requestedLocale) ?? defaultLocale

  const messages = (await import(`../../../messages/${locale}.json`)).default

  return {
    locale,
    state: parseState(requestHeaders.get(MAINTENANCE_STATE_HEADER)),
    t: createTranslator({ locale, messages, namespace: "Maintenance" }),
    tFooter: createTranslator({ locale, messages, namespace: "Footer.Bottom" }),
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

export default async function MaintenancePage() {
  const context = await getContext()
  if (!context) {
    notFound()
  }

  const { locale, state, t, tFooter } = context
  const [brand, company] = await Promise.all([
    withTimeout(getSiteBrandInformation(), BACKEND_TIMEOUT_MS, {}),
    withTimeout(getCompanyInformation(), BACKEND_TIMEOUT_MS, {}),
  ])

  const brandName = brand?.name || FALLBACK_BRAND_NAME
  const email = company?.email || FALLBACK_EMAIL
  const currentYear = new Date().getFullYear()

  return (
    <div lang={locale} className="flex min-h-screen flex-col bg-christmasBg">
      <div className="h-[40px] bg-christmas">
        <p
          role="status"
          className="content-container flex h-full items-center justify-center text-[12px] font-medium text-white md:text-[15px]"
        >
          {t("banner")}
        </p>
      </div>

      <header className="border-b border-gray-200 bg-white">
        <div className="content-container flex h-[70px] items-center justify-center">
          {/* Plain <img>: a backend-provided logo URL must never break this page. */}
          <img
            src={brand?.logo || FALLBACK_LOGO}
            alt={brandName}
            width={156}
            height={100}
            className="h-[24px] w-auto  object-contain"
          />
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[720px] rounded-[16px] border border-line bg-white px-6 py-10 text-center shadow-sm md:px-14 md:py-14">
          <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-christmas/10 text-christmas">
            <FaSnowflake className="text-[34px]" aria-hidden="true" />
          </div>

          <h1 className="text-[30px] font-medium leading-tight text-black md:text-[44px] md:leading-[1.15]">
            {state.title ?? t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] whitespace-pre-line text-[16px] leading-[1.7] text-christmasText md:text-[18px]">
            {state.message ?? t("message")}
          </p>

          {state.expected_end_at && (
            <ExpectedBack
              label={t("expectedBack")}
              iso={state.expected_end_at}
              locale={locale}
            />
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <RefreshButton label={t("refreshButton")} />
            <p className="text-[14px] text-secondary">{t("refreshNote")}</p>
          </div>

          <hr className="my-9 border-line" />

          <h2 className="text-[18px] font-medium text-black">
            {t("contactTitle")}
          </h2>
          <p className="mt-2 text-christmasText">
            {t("contactText")}{" "}
            <a
              href={`mailto:${email}`}
              className="break-all text-black underline underline-offset-4 duration-300 hover:text-hoverGray"
            >
              {email}
            </a>
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="text-[15px] text-christmasText">
              {t("followUs")}
            </span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 text-black duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <FaInstagram className="text-[18px]" />
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 text-black duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <FaTiktok className="text-[18px]" />
            </a>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-black bg-[#f5f5f5] py-6">
        <p className="content-container text-center text-[14px] tracking-[0.7px]">
          {currentYear} &copy; {tFooter("text1")}
          <br /> {tFooter("text2")}
        </p>
      </footer>
    </div>
  )
}
