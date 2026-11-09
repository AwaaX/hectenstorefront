"use server"

import { sdk } from "@lib/config"

export const subscribeToNewsletter = async (input: {
  email: string
  country: string
  recaptchaToken: string
}) => {
  try {
    return await sdk.client.fetch(`/store/newsletter`, {
      method: "POST",
      body: {
        email: input.email,
        country: input.country.toLowerCase(),
        recaptchaToken: input.recaptchaToken,
      },
      cache: "no-store",
    })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    throw new Error("Failed to subscribe to newsletter")
  }
}
