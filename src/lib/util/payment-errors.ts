/**
 * Turns Stripe's technical payment errors into a small set of customer-facing
 * categories. Every category has translated copy under
 * `Checkout.PaymentError.<kind>` (title + body).
 */
export type PaymentErrorKind =
  | "declined"
  | "insufficient_funds"
  | "expired_card"
  | "incorrect_cvc"
  | "incorrect_number"
  | "authentication"
  | "invalid_details"
  | "processing"
  | "network"
  | "session_expired"
  | "order"
  | "generic"

type StripeErrorLike = {
  type?: string
  code?: string
  decline_code?: string
  message?: string
}

const is = (value: string | undefined, ...candidates: string[]) =>
  !!value && candidates.includes(value)

export const classifyStripeError = (
  error: StripeErrorLike | null | undefined
): PaymentErrorKind => {
  if (!error) {
    return "generic"
  }

  const { type, code, decline_code: decline } = error

  if (isStaleSessionError(error)) {
    return "session_expired"
  }

  // The Payment Element could not validate what the customer typed
  if (type === "validation_error") {
    return "invalid_details"
  }

  if (type === "api_connection_error" || type === "rate_limit_error") {
    return "network"
  }

  if (
    is(code, "insufficient_funds") ||
    is(decline, "insufficient_funds", "card_velocity_exceeded")
  ) {
    return "insufficient_funds"
  }

  if (is(code, "expired_card") || is(decline, "expired_card")) {
    return "expired_card"
  }

  if (
    is(code, "incorrect_cvc", "invalid_cvc") ||
    is(decline, "incorrect_cvc", "invalid_cvc")
  ) {
    return "incorrect_cvc"
  }

  if (
    is(code, "incorrect_number", "invalid_number") ||
    is(decline, "incorrect_number", "invalid_number")
  ) {
    return "incorrect_number"
  }

  if (
    is(
      code,
      "payment_intent_authentication_failure",
      "authentication_required",
      "setup_intent_authentication_failure"
    ) ||
    is(decline, "authentication_required", "three_d_secure_failed")
  ) {
    return "authentication"
  }

  if (is(code, "processing_error", "payment_intent_unexpected_state")) {
    return "processing"
  }

  // card_declined and every issuer decline code (do_not_honor, lost_card...).
  // Deliberately generic: the exact reason is not for the customer to see.
  if (type === "card_error") {
    return "declined"
  }

  return "generic"
}

/**
 * The PaymentIntent behind the checkout's payment session can no longer be used
 * from this page, e.g. it was created with a different Stripe account/key, or
 * it was cancelled. Creating a new payment session fixes it.
 */
export const isStaleSessionError = (
  error: StripeErrorLike | null | undefined
) =>
  error?.type === "invalid_request_error" &&
  (error.code === "resource_missing" ||
    /client_secret|payment_?intent/i.test(error.message ?? ""))

/**
 * The PaymentIntent already finished (succeeded or cancelled), so Elements
 * refuses to load it. Its status decides whether to finish the order or start
 * a new payment.
 */
export const isTerminalIntentError = (
  error: StripeErrorLike | null | undefined
) =>
  error?.code === "payment_intent_unexpected_state" ||
  /terminal state/i.test(error?.message ?? "")

/**
 * Kinds where the customer must change what they pay with (or fix the card
 * details) rather than simply retry.
 */
export const needsDifferentDetails = (kind: PaymentErrorKind) =>
  kind !== "processing" &&
  kind !== "network" &&
  kind !== "generic" &&
  kind !== "session_expired" &&
  kind !== "order"

/** Kinds where editing the same card is enough (typo, expired...). */
export const isCardDetailsIssue = (kind: PaymentErrorKind) =>
  kind === "expired_card" ||
  kind === "incorrect_cvc" ||
  kind === "incorrect_number" ||
  kind === "invalid_details"

/** Kinds that guarantee the customer has not been charged. */
export const guaranteesNoCharge = (kind: PaymentErrorKind) =>
  kind !== "order" && kind !== "processing" && kind !== "network"

/** Kinds where Stripe's own message is worth showing as extra detail. */
export const showsRawDetail = (kind: PaymentErrorKind) =>
  kind === "generic" || kind === "processing" || kind === "order"
