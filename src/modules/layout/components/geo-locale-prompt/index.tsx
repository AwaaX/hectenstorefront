"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"
import { GEO_SUGGESTION_COOKIE, GeoSuggestion } from "@lib/util/geo-suggestion"
import { extractLanguageCode } from "@lib/util/locale"

function readGeoSuggestionCookie(): GeoSuggestion | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${GEO_SUGGESTION_COOKIE}=`))

  if (!match) {
    return null
  }

  try {
    const value = match.slice(GEO_SUGGESTION_COOKIE.length + 1)
    return JSON.parse(decodeURIComponent(value)) as GeoSuggestion
  } catch {
    return null
  }
}

function clearGeoSuggestionCookie() {
  document.cookie = `${GEO_SUGGESTION_COOKIE}=; path=/; max-age=0`
}

function GeoLocalePrompt() {
  const locale = useLocale()
  const t = useTranslations("Common.GeoSuggestion")
  const [suggestion, setSuggestion] = useState<GeoSuggestion | null>(null)

  useEffect(() => {
    setSuggestion(readGeoSuggestionCookie())
  }, [])

  if (!suggestion) {
    return null
  }

  const close = () => {
    clearGeoSuggestionCookie()
    setSuggestion(null)
  }

  const confirm = () => {
    clearGeoSuggestionCookie()
    window.location.href = suggestion.path
  }

  let countryName = suggestion.country
  try {
    countryName =
      new Intl.DisplayNames([extractLanguageCode(locale)], {
        type: "region",
      }).of(suggestion.country) || suggestion.country
  } catch {
    // Intl.DisplayNames not supported / unknown region, fall back to the code
  }

  return (
    <Modal isOpen close={close} size="small">
      <Modal.Title>{t("title")}</Modal.Title>
      <Modal.Body>
        <p>{t("description", { country: countryName })}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          {t("dismiss")}
        </Button>
        <Button variant="primary" onClick={confirm}>
          {t("confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default GeoLocalePrompt
