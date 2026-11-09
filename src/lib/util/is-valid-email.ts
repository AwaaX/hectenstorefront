// Pragmatic shape check (local@domain.tld, no whitespace). Medusa re-validates
// the email server side, this only keeps half-typed values from being sent.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isValidEmail = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length <= 254 &&
  EMAIL_PATTERN.test(value.trim())
