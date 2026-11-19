"use client"

import { useActionState, useRef, useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useTranslations } from "next-intl"
import ReCAPTCHA from "react-google-recaptcha"

type Props = {
  redirectTo: string
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ redirectTo, setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const t = useTranslations("Account.Register")
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (message === "SUCCESS") {
      setShowSuccess(true)
    }
  }, [message])

  if (showSuccess) {
    return (
      <div className="max-w-[570px] w-full flex flex-col items-center bg-white border p-[30px] shadow-[0_0_30px_0_rgba(0,0,0,.05)]">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-[24px] font-medium mb-2">{t("successTitle")}</h2>
        <p className="text-[15px] text-gray-600 text-center mb-6">{t("successMessage")}</p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="w-full min-h-[48px] flex items-center justify-center bg-[#ef7a4c] hover:bg-[#e2683a] text-[16px] font-semibold text-white duration-200"
        >
          {t("goToLogin")}
        </button>
      </div>
    )
  }

  return (
     <div className="max-w-[570px] w-full flex flex-col items-start bg-white border p-[30px] shadow-[0_0_30px_0_rgba(0,0,0,.05)]" data-testid="register-page">
      <h1 className="text-large-semi text-[24px] font-medium mb-6">
        {t("heading")}
      </h1>
      <form className="w-full flex flex-col" action={formAction}>
        <input type="hidden" name="redirect_to" value={redirectTo} />
        <input type="hidden" name="recaptcha_token" value={recaptchaToken} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t("firstName")}
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label={t("lastName")}
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label={t("email")}
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          {/* <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          /> */}
          <Input
            label={t("password")}
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <div className="mt-4">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
            onChange={(token) => setRecaptchaToken(token || "")}
            onExpired={() => setRecaptchaToken("")}
          />
        </div>
        <ErrorMessage error={message !== "SUCCESS" ? message : null} data-testid="register-error" />
        <div>
        <input type="checkbox" required />
        <span className="text-center text-[15px] font-normal ml-3 mt-6 mx-auto">
          {t("consentPrefix")}{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="underline"
          >
            {t("privacyPolicy")}
          </LocalizedClientLink>{" "}
          {t("and")}{" "}
          <LocalizedClientLink
            href="/legal-notice"
            className="underline"
          >
            {t("termsOfUse")}
          </LocalizedClientLink>
          .
        </span>
        </div>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          {t("submit")}
        </SubmitButton>
      </form>
      <span className="text-center text-[15px] font-normal hover:text-christmasText duration-200 ease-in-out mt-6 mx-auto">
        {t("signInPrompt")}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          {t("signInCta")}
        </button>
        .
      </span>
    </div>
  )
}

export default Register
