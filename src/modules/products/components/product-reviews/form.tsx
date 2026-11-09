"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import ReCAPTCHA from "react-google-recaptcha"

import { retrieveCustomer } from "../../../../lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { Button, Input, Label, Textarea } from "@medusajs/ui"
import { Star, StarSolid } from "@medusajs/icons"
import { addProductReview } from "../../../../lib/data/products"
import { useTranslations } from "next-intl"
import { useRouter } from "@i18n/navigation"
import { extractCountryCode } from "@lib/util/locale"

type ProductReviewsFormProps = {
  productId: string
}

export default function ProductReviewsForm({
  productId,
}: ProductReviewsFormProps) {
  const t = useTranslations("Product.Reviews")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
  const formRef = useRef<HTMLDivElement>(null)

  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const localeParam = params?.locale
  const locale =
    typeof localeParam === "string"
      ? localeParam
      : Array.isArray(localeParam)
      ? localeParam[0]
      : null
  const countryCode = locale ? extractCountryCode(locale) : null

  useEffect(() => {
    retrieveCustomer()
      .then(setCustomer)
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (!authChecked || !customer) {
      return
    }

    if (searchParams.get("write_review") !== "1") {
      return
    }

    setShowForm(true)

    const frame = window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })

    const url = new URL(window.location.href)
    url.searchParams.delete("write_review")
    const cleanUrl = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState({}, "", cleanUrl)

    return () => window.cancelAnimationFrame(frame)
  }, [authChecked, customer, searchParams])

  const handleAddReviewClick = () => {
    if (customer) {
      setShowForm(true)
      return
    }

    const returnPath = `${pathname}?write_review=1`
    const loginPath = `/account?redirect_to=${encodeURIComponent(returnPath)}`

    router.push(loginPath)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!customer) {
      handleAddReviewClick()
      return
    }

    if (!content || !rating) {
      setError(t("requiredFields"))
      return
    }

    const recaptchaToken = recaptchaRef.current?.getValue()
    if (!recaptchaToken) {
      setError("Please verify reCAPTCHA")
      return
    }

    setIsLoading(true)
    addProductReview({
      title,
      content,
      rating,
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      product_id: productId,
      recaptchaToken,
    })
      .then(() => {
        setSuccess(true)
        setTitle("")
        setContent("")
        setRating(0)
        recaptchaRef.current?.reset()
        setTimeout(() => {
          setShowForm(false)
          setSuccess(false)
        }, 2000)
      })
      .catch((err) => {
        setError(err?.message || t("submitError"))
        recaptchaRef.current?.reset()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div
      ref={formRef}
      id="write-review"
      className="product-page-constraint mt-8"
    >
      {!showForm && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={handleAddReviewClick}>
            {t("addReview")}
          </Button>
        </div>
      )}
      {showForm && customer && (
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-2">
            <span className="text-xl-regular text-ui-fg-base">
              {t("addReview")}
            </span>

            {error && (
              <div className="p-4 bg-christmas/15 border border-red rounded-lg">
                <p className="text-red text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green/15 border border-success rounded-lg">
                <p className="text-success text-sm font-medium">
                  {t("successDescription")}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label>{t("title")}</Label>
                <Input
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("title")}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>{t("content")}</Label>
                <Textarea
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("content")}
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label>{t("rating")}</Label>
                <div className="flex gap-x-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Button
                      key={index}
                      variant="transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        setRating(index + 1)
                      }}
                      className="p-0"
                    >
                      {rating >= index + 1 ? (
                        <StarSolid className="text-ui-tag-orange-icon" />
                      ) : (
                        <Star />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                />
              </div>
              <Button type="submit" disabled={isLoading} variant="primary">
                {t("submit")}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
