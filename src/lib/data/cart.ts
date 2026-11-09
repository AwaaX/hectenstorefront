"use server"

import { sdk } from "@lib/config"
import {
  isMedusaEntityNotFoundError,
  throwNormalizedMedusaError,
} from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { ComponentProps } from "react"

import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  getPendingCartEmail,
  removeAuthToken,
  removeCartId,
  removePendingCartEmail,
  setCartId,
} from "./cookies"
import { getRegion } from "./regions"
import { getLocale, updateLocale, setLocaleCookie } from "@lib/data/locale-actions"
import { isValidEmail } from "@lib/util/is-valid-email"
import { PAYMENT_PENDING_METADATA_KEY } from "@lib/util/stripe"
import { redirect, Link } from "@i18n/routing"

type Href = ComponentProps<typeof Link>['href']

const revalidateCartState = async () => {
  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  const fulfillmentCacheTag = await getCacheTag("fulfillment")
  revalidateTag(fulfillmentCacheTag)
}

const clearCartState = async () => {
  await removeCartId()
  await revalidateCartState()
}

const clearCustomerState = async () => {
  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)
}

const isStaleCartSessionError = (error: unknown) =>
  isMedusaEntityNotFoundError(error, "cart") ||
  isMedusaEntityNotFoundError(error, "customer")

const addLineItemToCart = async ({
  cartId,
  quantity,
  variantId,
}: {
  cartId: string
  quantity: number
  variantId: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart.createLineItem(
    cartId,
    {
      variant_id: variantId,
      quantity,
    },
    {},
    headers
  )

  await revalidateCartState()
}

const addVariantToCurrentCart = async ({
  countryCode,
  quantity,
  variantId,
}: {
  countryCode: string
  quantity: number
  variantId: string
}) => {
  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  await addLineItemToCart({
    cartId: cart.id,
    quantity,
    variantId,
  })
}

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to retrieve.
 * @returns The cart object if found, or null if not found.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

  if (!id) {
    return null
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("carts")),
  }

  try {
    return await sdk.client
      .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
        method: "GET",
        query: {
          fields,
        },
        headers,
        next: {
          revalidate: 5,
          ...next,
        },
        cache: "force-cache",
      })
      .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
  } catch {
    return null
  }
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  let cart = await retrieveCart(undefined, "id,region_id")

  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!cart) {
    const locale = await getLocale()
    const body = { region_id: region.id, locale: locale || undefined }

    // A guest who typed their email (e.g. in the newsletter form) before having
    // a cart gets it attached now, so the cart can be followed up even if they
    // never reach checkout. Checkout overrides it later.
    const pendingEmail =
      "authorization" in headers ? undefined : await getPendingCartEmail()
    const email = isValidEmail(pendingEmail) ? pendingEmail.trim() : undefined

    const cartResp = await sdk.store.cart
      .create(email ? { ...body, email } : body, {}, headers)
      .catch((error) => {
        // Never let a rejected email block adding to cart.
        if (!email) {
          throw error
        }

        return sdk.store.cart.create(body, {}, headers)
      })
    cart = cartResp.cart

    await setCartId(cart.id)

    if (pendingEmail !== undefined) {
      await removePendingCartEmail()
    }

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found, please create one before updating")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)

      return cart
    })
    .catch(throwNormalizedMedusaError)
}

const CAPTURED_ADDRESS_FIELDS = [
  "first_name",
  "last_name",
  "address_1",
  "company",
  "postal_code",
  "city",
  "country_code",
  "province",
  "phone",
] as const

/**
 * Saves the contact details typed into the checkout address form onto the
 * cart before the form is submitted, so an abandoned cart can still be tied
 * to an email and name in the backend. Best-effort: failures are logged and
 * never surface to the shopper.
 *
 * `shipping_address` must be a snapshot of the whole form: Medusa replaces
 * the cart's address on update, so sending only the name would wipe the rest.
 */
export async function captureCheckoutContact(input: {
  email?: string
  shipping_address?: HttpTypes.StoreAddAddress
}) {
  const data: HttpTypes.StoreUpdateCart = {}

  if (isValidEmail(input.email)) {
    data.email = input.email.trim()
  }

  if (input.shipping_address) {
    const address: HttpTypes.StoreAddAddress = {}

    for (const field of CAPTURED_ADDRESS_FIELDS) {
      const value = input.shipping_address[field]

      if (typeof value === "string") {
        address[field] = value.trim()
      }
    }

    data.shipping_address = address
  }

  if (!data.email && !data.shipping_address) {
    return
  }

  if (!(await getCartId())) {
    return
  }

  try {
    await updateCart(data)
  } catch (error) {
    console.error("Failed to capture checkout contact on cart:", error)
  }
}

/**
 * Attaches an email typed outside checkout (e.g. the newsletter form) to the
 * current cart. Only fills a cart that has no email yet, or one whose email is
 * `replaces` (the value this same form saved earlier), so it never overrides
 * an email given at checkout or one belonging to a logged-in customer.
 */
export async function captureCartEmail(email: string, replaces?: string) {
  if (!isValidEmail(email)) {
    return
  }

  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { cart } = await sdk.store.cart.retrieve(
      cartId,
      { fields: "id,email,completed_at" },
      headers
    )

    if (cart.completed_at || (cart.email && cart.email !== replaces)) {
      return
    }

    await updateCart({ email: email.trim() })
  } catch (error) {
    console.error("Failed to capture email on cart:", error)
  }
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart")
  }

  try {
    await addVariantToCurrentCart({
      countryCode,
      quantity,
      variantId,
    })
    return
  } catch (error) {
    if (!isStaleCartSessionError(error)) {
      throwNormalizedMedusaError(error)
    }
  }

  await clearCartState()

  try {
    await addVariantToCurrentCart({
      countryCode,
      quantity,
      variantId,
    })
    return
  } catch (error) {
    if (!isMedusaEntityNotFoundError(error, "customer")) {
      throwNormalizedMedusaError(error)
    }
  }

  await clearCustomerState()
  await clearCartState()

  try {
    await addVariantToCurrentCart({
      countryCode,
      quantity,
      variantId,
    })
  } catch (error) {
    throwNormalizedMedusaError(error)
  }
}

export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when updating line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when updating line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.store.cart.updateLineItem(
      cartId,
      lineId,
      { quantity },
      {},
      headers
    )

    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)

    const fulfillmentCacheTag = await getCacheTag("fulfillment")
    revalidateTag(fulfillmentCacheTag)
  } catch (err) {
    throwNormalizedMedusaError(err)
  }
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) {
    throw new Error("Missing lineItem ID when deleting line item")
  }

  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("Missing cart ID when deleting line item")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(throwNormalizedMedusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
    })
    .catch(throwNormalizedMedusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return resp
    })
    .catch(throwNormalizedMedusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()

  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)

      const fulfillmentCacheTag = await getCacheTag("fulfillment")
      revalidateTag(fulfillmentCacheTag)
    })
    .catch(throwNormalizedMedusaError)
}

export async function applyGiftCard(code: string) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[]
  // giftCards: GiftCard[]
) {
  //   const cartId = getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function submitPromotionForm(
  currentState: unknown,
  formData: FormData
) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(currentState: unknown, formData: FormData) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = getCartId()
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  const locale = (await getLocale()) as string

  redirect({
    href: {
      pathname: "/checkout",
      query: { step: "delivery" },
    },
    locale,
  })
}

/**
 * Places an order for a cart. If no cart ID is provided, it will use the cart ID from the cookies.
 * @param cartId - optional - The ID of the cart to place an order for.
 * @returns The cart object if the order was successful, or null if not.
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    throw new Error("No existing cart found when placing an order")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      const cartCacheTag = await getCacheTag("carts")
      revalidateTag(cartCacheTag)
      return cartRes
    })
    .catch(throwNormalizedMedusaError)

  if (cartRes?.type === "order") {


    const orderCacheTag = await getCacheTag("orders")
    revalidateTag(orderCacheTag)

    removeCartId()
    const locale = (await getLocale()) as string


    redirect({
      href: {
        pathname: "/order/[id]/confirmed",
        params: { id: cartRes?.order.id },
      },
      locale,
    })
  }
}

/**
 * Called when a delayed payment (SEPA, ACH, Multibanco...) is waiting for the
 * funds. The Stripe webhook completes the cart once the payment is confirmed, so
 * here we only flag it (the abandoned-cart emails skip flagged carts) and detach
 * it from the browser so the customer can't pay for it a second time.
 */
export async function markCartPaymentPending(cartId?: string) {
  const id = cartId || (await getCartId())

  if (!id) {
    return
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart
    .update(
      id,
      { metadata: { [PAYMENT_PENDING_METADATA_KEY]: new Date().toISOString() } },
      {},
      headers
    )
    .catch(() => {
      // Non-blocking: the webhook completes the order either way.
    })

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export async function updateRegion(
  regionId: string,
  redirectPath: Href,
  targetLocale: string
) {
  const cartId = await getCartId()

  const region = await getRegion(regionId)

  if (!region) {
    throw new Error(
      `Specified Region not found when switching region: ${region}`
    )
  }

  await setLocaleCookie(targetLocale)

  if (cartId) {
    await updateCart({ region_id: regionId, locale: targetLocale })
    const cartCacheTag = await getCacheTag("carts")
    revalidateTag(cartCacheTag)
  }

  const regionCacheTag = await getCacheTag("regions")
  revalidateTag(regionCacheTag)

  const productsCacheTag = await getCacheTag("products")
  revalidateTag(productsCacheTag)

  redirect({
    // @ts-expect-error
    href: redirectPath,
    locale: targetLocale,
  })
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  return await sdk.client.fetch<{
    shipping_options: HttpTypes.StoreCartShippingOption[]
  }>("/store/shipping-options", {
    query: { cart_id: cartId },
    next: {
      revalidate: 5,
      ...next,
    },
    headers,
    cache: "force-cache",
  })
}
