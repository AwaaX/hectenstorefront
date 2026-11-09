"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import ReCAPTCHA from "react-google-recaptcha"

type Props = {
  redirectTo: string
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ redirectTo, setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const t = useTranslations("Account.Login")
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState("")

  useEffect(() => {
    if (message) {
      recaptchaRef.current?.reset()
      setRecaptchaToken("")
    }
  }, [message])

  return (
    <div className="max-w-[570px] w-full flex flex-col items-start bg-white border p-4 xsmall:p-[30px] shadow-[0_0_30px_0_rgba(0,0,0,.05)]" data-testid="login-page">
      <h1 className="text-large-semi text-[24px] font-medium mb-6">
        {t("heading")}
      </h1>
      <form className="w-full" action={formAction}>
        <input type="hidden" name="redirect_to" value={redirectTo} />
        <input type="hidden" name="recaptcha_token" value={recaptchaToken} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label={t("email")}
            name="email"
            type="email"
            title={t("emailTitle")}
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label={t("password")}
            name="password"
            type="password"
            autoComplete="current-password"
            required
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
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {t("submit")}
        </SubmitButton>
      </form>
      <span className="text-center text-[15px] font-normal hover:text-christmasText duration-200 ease-in-out mt-6 mx-auto">
        {t("registerPrompt")}{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          {t("registerCta")}
        </button>
        .
      </span>
    </div>
  )
}

export default Login
