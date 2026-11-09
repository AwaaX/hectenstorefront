"use client"

import { PaymentErrorKind } from "@lib/util/payment-errors"
import {
  CheckCircleSolid,
  ClockSolid,
  LockClosedSolid,
  XCircleSolid,
} from "@medusajs/icons"
import { Button, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export type ReturnStatus = "checking" | "received" | "pending" | "failed"

type PaymentReturnViewProps = {
  status: ReturnStatus
  /** Formatted amount of the payment (e.g. "$48.90"). */
  amount?: string | null
  /** Stripe-hosted page with voucher / bank transfer instructions, when one exists. */
  instructionsUrl?: string | null
  /** Why the payment failed, used for the failed state. */
  failureKind?: PaymentErrorKind
  /** True when the check is taking longer than expected. */
  slow?: boolean
}

const TONE: Record<
  ReturnStatus,
  { bar: string; icon: string; pill: string; dot: string }
> = {
  checking: {
    bar: "bg-ui-tag-blue-icon",
    icon: "bg-ui-tag-blue-bg text-ui-tag-blue-icon",
    pill: "bg-ui-tag-blue-bg text-ui-tag-blue-text",
    dot: "bg-ui-tag-blue-icon",
  },
  received: {
    bar: "bg-ui-tag-green-icon",
    icon: "bg-ui-tag-green-bg text-ui-tag-green-icon",
    pill: "bg-ui-tag-green-bg text-ui-tag-green-text",
    dot: "bg-ui-tag-green-icon",
  },
  pending: {
    bar: "bg-ui-tag-orange-icon",
    icon: "bg-ui-tag-orange-bg text-ui-tag-orange-icon",
    pill: "bg-ui-tag-orange-bg text-ui-tag-orange-text",
    dot: "bg-ui-tag-orange-icon",
  },
  failed: {
    bar: "bg-ui-tag-red-icon",
    icon: "bg-ui-tag-red-bg text-ui-tag-red-icon",
    pill: "bg-ui-tag-red-bg text-ui-tag-red-text",
    dot: "bg-ui-tag-red-icon",
  },
}

const Spinner = () => (
  <svg
    className="h-8 w-8 motion-safe:animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      d="M22 12a10 10 0 0 0-10-10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

const StatusIcon = ({ status }: { status: ReturnStatus }) => {
  const className = "h-8 w-8"

  switch (status) {
    case "received":
      return <CheckCircleSolid className={className} />
    case "pending":
      return <ClockSolid className={className} />
    case "failed":
      return <XCircleSolid className={className} />
    default:
      return <Spinner />
  }
}

const NextSteps = () => {
  const t = useTranslations("Checkout.PaymentReturn")
  const steps = ["step1", "step2", "step3"] as const

  return (
    <div className="mt-8 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5 text-left">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ui-fg-subtle">
        {t("nextTitle")}
      </h2>
      <ol className="flex flex-col gap-y-5">
        {steps.map((step, index) => (
          <li key={step} className="relative flex gap-x-4">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-4 top-9 h-[calc(100%-0.5rem)] w-px -translate-x-1/2 bg-ui-border-strong"
              />
            )}
            <span
              className={clx(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                index === 0
                  ? "border-ui-tag-orange-border bg-ui-tag-orange-bg text-ui-tag-orange-text"
                  : "border-ui-border-strong bg-white text-ui-fg-subtle"
              )}
            >
              {index + 1}
            </span>
            <div className="pt-0.5">
              <p className="font-medium text-ui-fg-base">
                {t(`${step}Title`)}
              </p>
              <p className="mt-0.5 text-sm text-ui-fg-subtle">
                {t(`${step}Body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Presentational part of the payment-return page: one card with a clear icon,
 * message, payment summary and next actions for each state.
 */
const PaymentReturnView = ({
  status,
  amount,
  instructionsUrl,
  failureKind = "generic",
  slow = false,
}: PaymentReturnViewProps) => {
  const t = useTranslations("Checkout.PaymentReturn")
  const tError = useTranslations("Checkout.PaymentError")
  const tone = TONE[status]

  // Small fade-in on mount (skipped for visitors who prefer reduced motion)
  const [entered, setEntered] = useState(false)
  useEffect(() => setEntered(true), [])

  const title =
    status === "failed" ? tError(`${failureKind}.title`) : t(`${status}Title`)
  const body =
    status === "failed" ? tError(`${failureKind}.body`) : t(`${status}Body`)

  const statusLabel = {
    checking: t("statusChecking"),
    received: t("statusPaid"),
    pending: t("statusPending"),
    failed: t("statusFailed"),
  }[status]

  return (
    <div className="flex justify-center px-4 py-10 small:py-16">
      <div
        data-testid={`payment-return-${status}`}
        className={clx(
          "w-full max-w-[560px] overflow-hidden rounded-2xl border border-ui-border-base bg-white shadow-sm",
          "motion-safe:transition motion-safe:duration-500 motion-safe:ease-out",
          entered
            ? "opacity-100 translate-y-0"
            : "motion-safe:translate-y-2 motion-safe:opacity-0"
        )}
        role={status === "failed" ? "alert" : "status"}
        aria-live={status === "failed" ? "assertive" : "polite"}
      >
        <div className={clx("h-1.5 w-full", tone.bar)} aria-hidden="true" />

        <div className="px-6 py-8 text-center small:px-10 small:py-10">
          <div
            className={clx(
              "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full",
              tone.icon
            )}
            aria-hidden="true"
          >
            <StatusIcon status={status} />
          </div>

          <h1 className="text-2xl font-semibold text-ui-fg-base small:text-3xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-ui-fg-subtle">
            {body}
          </p>

          {status === "checking" && (
            <div className="mt-6 flex flex-col items-center gap-y-2">
              <p className="inline-flex items-center gap-x-2 text-sm text-ui-fg-muted">
                <LockClosedSolid className="h-4 w-4" aria-hidden="true" />
                {t("secureNote")}
              </p>
              {slow && (
                <p className="text-sm text-ui-tag-orange-text">{t("slowNote")}</p>
              )}
            </div>
          )}

          {status === "failed" && (
            <p className="mt-4 inline-flex rounded-lg bg-ui-tag-green-bg px-3 py-1.5 text-sm text-ui-tag-green-text">
              {t("notCharged")}
            </p>
          )}

          {status !== "checking" && (amount || status === "pending") && (
            <dl className="mt-8 grid grid-cols-1 divide-y divide-ui-border-base rounded-xl border border-ui-border-base text-left xsmall:grid-cols-2 xsmall:divide-x xsmall:divide-y-0">
              <div className="flex items-center justify-between px-5 py-4 xsmall:block">
                <dt className="text-xs uppercase tracking-wide text-ui-fg-muted">
                  {t("amountLabel")}
                </dt>
                <dd className="text-lg font-semibold text-ui-fg-base xsmall:mt-1">
                  {amount ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-5 py-4 xsmall:block">
                <dt className="text-xs uppercase tracking-wide text-ui-fg-muted">
                  {t("statusLabel")}
                </dt>
                <dd className="xsmall:mt-1.5">
                  <span
                    className={clx(
                      "inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-sm font-medium",
                      tone.pill
                    )}
                  >
                    <span
                      className={clx(
                        "h-1.5 w-1.5 rounded-full",
                        tone.dot,
                        status === "pending" && "motion-safe:animate-pulse"
                      )}
                      aria-hidden="true"
                    />
                    {statusLabel}
                  </span>
                </dd>
              </div>
            </dl>
          )}

          {status === "pending" && <NextSteps />}

          {status !== "checking" && (
            <div className="mt-8 flex flex-col gap-3 xsmall:flex-row xsmall:justify-center">
              {status === "pending" && instructionsUrl && (
                <Button
                  variant="secondary"
                  size="large"
                  className="w-full xsmall:w-auto"
                  asChild
                >
                  <a
                    href={instructionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("viewInstructions")}
                  </a>
                </Button>
              )}

              {status === "failed" ? (
                <Button
                  variant="primary"
                  size="large"
                  className="w-full xsmall:w-auto"
                  asChild
                >
                  <LocalizedClientLink
                    href={{ pathname: "/checkout", query: { step: "payment" } }}
                  >
                    {t("backToPayment")}
                  </LocalizedClientLink>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="large"
                  className="w-full xsmall:w-auto"
                  asChild
                >
                  <LocalizedClientLink href="/">
                    {t("continueShopping")}
                  </LocalizedClientLink>
                </Button>
              )}
            </div>
          )}
        </div>

        {status !== "checking" && (
          <div className="border-t border-ui-border-base bg-ui-bg-subtle px-6 py-4 text-center text-sm text-ui-fg-subtle">
            {t("needHelp")}{" "}
            <LocalizedClientLink
              href="/customer-service"
              className="font-medium text-ui-fg-base underline underline-offset-2 hover:text-ui-fg-subtle"
            >
              {t("contactUs")}
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentReturnView
