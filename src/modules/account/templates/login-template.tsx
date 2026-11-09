"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { clx } from "@medusajs/ui"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

type LoginTemplateProps = {
  className?: string
  redirectTo: string
}

const getSafeRedirectPath = (value: string | null, fallback: string) => {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value
  }

  return fallback
}

const LoginTemplate = ({ className, redirectTo }: LoginTemplateProps) => {
  const [currentView, setCurrentView] = useState("sign-in")
  const searchParams = useSearchParams()
  const resolvedRedirectTo = getSafeRedirectPath(
    searchParams.get("redirect_to"),
    redirectTo
  )

  return (
    <div className={clx("w-full flex justify-center px-8 py-8", className)}>
      {currentView === "sign-in" ? (
        <Login redirectTo={resolvedRedirectTo} setCurrentView={setCurrentView} />
      ) : (
        <Register redirectTo={resolvedRedirectTo} setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

export default LoginTemplate
