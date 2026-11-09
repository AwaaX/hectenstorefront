"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export const contactSupport = async (input: {
  firstName?: string
  orderNumber: string
  reason?: string
  email: string
  message: string
  recaptchaToken: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch(`/store/contact`, {
    method: "POST",
    headers,
    body: input,
    cache: "no-store",
  })
}
