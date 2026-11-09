import { ArrowUpRightMini } from "@medusajs/icons"
import { Metadata } from "next"
import { Link } from "@i18n/routing"
import { getTranslations } from "next-intl/server"
import { getLocalizedMetadata } from "@lib/util/metadata"
import { FaHome } from "react-icons/fa"

export async function generateMetadata(): Promise<Metadata> {
  return getLocalizedMetadata("Metadata.NotFound")
}

export default async function NotFound() {
  const t = await getTranslations("Common.NotFound")

  return (
    <div className="min-h-[calc(100vh-300px)] flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 bg-white">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-christmas mb-4">
            404
          </h1>
          <div className="h-1 w-24 bg-christmas mx-auto rounded-full"></div>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          {t("heading")}
        </h2>

        <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300 group"
          >
            <FaHome className="text-lg" />
            <span>{t("cta")}</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300"
          >
            <span>Browse Products</span>
            <ArrowUpRightMini className="group-hover:rotate-45 ease-in-out duration-150" />
          </Link>
        </div>
      </div>
    </div>
  )
}
