"use client"

import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react"
import {
  guaranteesNoCharge,
  isCardDetailsIssue,
  needsDifferentDetails,
  PaymentErrorKind,
  showsRawDetail,
} from "@lib/util/payment-errors"
import { ExclamationCircleSolid, ShieldCheck, XMark } from "@medusajs/icons"
import { Button, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslations } from "next-intl"

type PaymentErrorDialogProps = {
  open: boolean
  kind: PaymentErrorKind
  /** Raw message from Stripe / the order flow, shown only for unexpected errors. */
  detail?: string | null
  onClose: () => void
  /** Takes the customer back to the payment step to edit or switch method. */
  onChangeMethod: () => void
}

/**
 * Modal alert for payment problems (declined card, expired card, failed order
 * placement...). Replaces the red text that used to sit under "Place order".
 */
const PaymentErrorDialog = ({
  open,
  kind,
  detail,
  onClose,
  onChangeMethod,
}: PaymentErrorDialogProps) => {
  const t = useTranslations("Checkout.PaymentError")

  const isOrderProblem = kind === "order"
  const isSessionExpired = kind === "session_expired"
  const detailsFirst = needsDifferentDetails(kind)

  // What the primary button does depends on whether retrying can ever help
  const primary = isSessionExpired
    ? { label: t("actions.reloadForm"), onClick: onChangeMethod }
    : detailsFirst
    ? {
        label: isCardDetailsIssue(kind)
          ? t("actions.editDetails")
          : t("actions.changeMethod"),
        onClick: onChangeMethod,
      }
    : { label: t("actions.tryAgain"), onClick: onClose }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      role="alertdialog"
      className="relative z-[80]"
      data-testid="payment-error-dialog"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-end justify-center p-4 xsmall:items-center">
        <DialogPanel
          transition
          className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 transition duration-200 ease-out data-[closed]:translate-y-3 data-[closed]:scale-95 data-[closed]:opacity-0 small:p-8"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("actions.close")}
            className="absolute right-4 top-4 rounded-full p-1.5 text-ui-fg-muted transition hover:bg-ui-bg-subtle hover:text-ui-fg-base focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive"
          >
            <XMark />
          </button>

          <div className="flex flex-col items-center text-center">
            <div
              className={clx(
                "mb-4 flex h-14 w-14 items-center justify-center rounded-full",
                isOrderProblem
                  ? "bg-ui-tag-orange-bg text-ui-tag-orange-icon"
                  : "bg-ui-tag-red-bg text-ui-tag-red-icon"
              )}
              aria-hidden="true"
            >
              <ExclamationCircleSolid className="h-7 w-7" />
            </div>

            <DialogTitle
              as="h2"
              className="text-xl font-semibold text-ui-fg-base"
            >
              {t(`${kind}.title`)}
            </DialogTitle>

            <Description className="mt-2 text-base text-ui-fg-subtle">
              {t(`${kind}.body`)}
            </Description>

            {guaranteesNoCharge(kind) && (
              <p className="mt-4 inline-flex items-center gap-x-2 rounded-lg bg-ui-tag-green-bg px-3 py-2 text-sm text-ui-tag-green-text">
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t("notCharged")}
              </p>
            )}

            {detail && showsRawDetail(kind) && (
              <p className="mt-4 w-full rounded-lg bg-ui-bg-subtle px-3 py-2 text-left text-xs text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">
                  {t("detailsLabel")}:
                </span>{" "}
                {detail}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 xsmall:flex-row xsmall:justify-center">
            {isOrderProblem ? (
              <Button
                variant="secondary"
                size="large"
                className="w-full xsmall:w-auto"
                asChild
              >
                <LocalizedClientLink href="/customer-service">
                  {t("actions.contactSupport")}
                </LocalizedClientLink>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="large"
                className="w-full xsmall:w-auto"
                onClick={
                  detailsFirst || isSessionExpired ? onClose : onChangeMethod
                }
                data-testid="payment-error-secondary"
              >
                {detailsFirst || isSessionExpired
                  ? t("actions.close")
                  : t("actions.changeMethod")}
              </Button>
            )}

            <Button
              variant="primary"
              size="large"
              className="w-full xsmall:w-auto"
              onClick={primary.onClick}
              autoFocus
              data-testid="payment-error-primary"
            >
              {primary.label}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default PaymentErrorDialog
