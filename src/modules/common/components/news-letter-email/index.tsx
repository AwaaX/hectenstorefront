"use client"
import { useRef, useState } from "react"
import { HiOutlineEnvelope } from "react-icons/hi2"
import { IoMdArrowForward } from "react-icons/io"
import LocalizedClientLink from "../localized-client-link"
import { TailSpin } from "react-loader-spinner"
import { useTranslations, useLocale } from "next-intl"
import { subscribeToNewsletter } from "@lib/data/newsletter"
import { captureCartEmail } from "@lib/data/cart"
import useDebouncedCallback from "@lib/hooks/use-debounced-callback"
import { isValidEmail } from "@lib/util/is-valid-email"
import { rememberPendingCartEmail } from "@lib/util/pending-cart-email"
import ReCAPTCHA from "react-google-recaptcha"

const NewsLetterEmail = ({
  placeholder = "",
  className = "",
  isFooter = true,
}) => {
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [showRecaptcha, setShowRecaptcha] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const capturedEmailRef = useRef<string | undefined>(undefined)
  const t = useTranslations("Footer.NewsLetter")
  const locale = useLocale()

  // Attach the email to the visitor's cart as soon as it looks complete, so a
  // cart abandoned before checkout can still be followed up.
  const captureEmail = useDebouncedCallback((value: string) => {
    const nextEmail = value.trim()

    if (!isValidEmail(nextEmail) || nextEmail === capturedEmailRef.current) {
      return
    }

    // Kept in the browser too, for when the visitor has no cart yet.
    rememberPendingCartEmail(nextEmail)
    captureCartEmail(nextEmail, capturedEmailRef.current)
    capturedEmailRef.current = nextEmail
  }, 1000)

  const handleSubscribe = async (event: any) => {
    event.preventDefault()
    setError("")

    if (!recaptchaToken) {
      setError("Please verify reCAPTCHA")
      return
    }

    setSending(true)

    try {
      await subscribeToNewsletter({
        email,
        country: locale,
        recaptchaToken,
      })
      setSending(false)
      setSubmitted(true)
      setEmail("")
      setShowRecaptcha(false)
      setRecaptchaToken("")
      recaptchaRef.current?.reset()
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      setSending(false)
      setError("Failed to subscribe. Please try again.")
      recaptchaRef.current?.reset()
      setRecaptchaToken("")
      console.error("Newsletter subscription error:", err)
    }
  }

  // Footer: labelled field with a full-width "Sign up" button below it
  if (isFooter) {
    return (
      <div className="w-full max-w-[354px]">
        {submitted ? (
          <p className="text-[16px] leading-[24px] text-black">
            {t("successMessage")}
          </p>
        ) : (
          <form onSubmit={handleSubscribe}>
            <label
              htmlFor="footer-newsletter-email"
              className="block mb-0 text-[16px] leading-[24px] text-black"
            >
              {t("emailLabel")} *
            </label>
            <input
              id="footer-newsletter-email"
              required
              type="email"
              autoComplete="email"
              className="w-full h-[44px] px-[13px] bg-[#fafafa] border border-[#d2d2d2] rounded-[6px] text-[15px] text-black placeholder:text-[#999] outline-none focus:border-[#999]"
              placeholder={placeholder || t("emailPlaceholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                captureEmail(e.target.value)
              }}
              onBlur={() => captureEmail.flush()}
              onFocus={() => setShowRecaptcha(true)}
            />
            {showRecaptcha && (
              <div className="mt-3">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setRecaptchaToken(token || "")}
                  onExpired={() => setRecaptchaToken("")}
                />
              </div>
            )}
            {error && (
              <div className="text-christmas text-[13px] mt-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center w-full h-[47px] mt-[20px] bg-black rounded-[7px] font-[system-ui] text-[18px] font-bold text-white hover:bg-[#333] duration-300 disabled:opacity-70"
            >
              {sending ? (
                <TailSpin
                  visible={true}
                  height="22"
                  width="22"
                  color="#fff"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                />
              ) : (
                t("signUp")
              )}
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className=" md:max-w-[500px] w-full md:mx-auto">
      {!submitted && (
        <form onSubmit={handleSubscribe}>
          <div
            className={`bg-white flex items-center  px-3  text-black ${
              isFooter ? "rounded-full py-4" : "rounded-md py-3"
            }`}
          >
            {/* Email Icon */}
            {isFooter && <HiOutlineEnvelope />}
            {/* Input Box */}
            <input
              required
              type="email"
              className="flex-1 text-[15px] placeholder:text-black px-4 outline-none"
              placeholder={placeholder || t("Placeholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                captureEmail(e.target.value)
              }}
              onBlur={() => captureEmail.flush()}
              onFocus={() => setShowRecaptcha(true)}
            />
            {/* Arrow Button */}
            {!sending && (
              <button type="submit" aria-label="Submit" style={{fontSize: "24px"}}>
                <IoMdArrowForward />
              </button>
            )}
            {sending && (
              <TailSpin
                visible={true}
                height="25"
                width="25"
                color="#666"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              />
            )}
          </div>
          {showRecaptcha && (
            <div className="mt-3">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onChange={(token) => setRecaptchaToken(token || "")}
                onExpired={() => setRecaptchaToken("")}
              />
            </div>
          )}
          <div
            className={`text-white text-[15px] mt-3 items-start md:items-center justify-start gap-3 ${
              isFooter ? "hidden" : "flex"
            }`}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              required={!isFooter}
              id="acceptTerms"
              className="mb-4 w-4 h-4 cursor-pointer accent-white"
            />
            {/* Text */}
            <label htmlFor="acceptTerms" className="cursor-pointer flex-1">
              <p className="flex flex-wrap items-center justify-start gap-1">
                {t("txt1")}{" "}
                <LocalizedClientLink
                  href="/general-terms-of-sale"
                  className="cursor-pointer underline-gap whitespace-nowrap"
                >
                  {t("txt2")}
                </LocalizedClientLink>{" "}
                {t("and")}{" "}
                <LocalizedClientLink
                  href="/privacy-policy"
                  className="cursor-pointer underline-gap whitespace-nowrap"
                >
                  {t("txt3")}
                </LocalizedClientLink>
              </p>
            </label>
          </div>
          {error && (
            <div className="text-christmas text-[13px] mt-2">{error}</div>
          )}
        </form>
      )}

      {submitted && (
        <div className={`${isFooter ? "text-[#666]" : "text-white"}`}>
          {/* Thank you Message */}
          {t("successMessage")}
        </div>
      )}
    </div>
  )
}

export default NewsLetterEmail
