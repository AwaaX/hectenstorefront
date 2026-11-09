"use client"

import { useRouter } from "@i18n/navigation"
import { PaymentErrorKind } from "@lib/util/payment-errors"
import { useState } from "react"
import PaymentErrorDialog from "./index"

type PaymentErrorState = { kind: PaymentErrorKind; detail: string | null }

/**
 * Keeps the last payment error and whether the alert is open, and renders the
 * dialog. The error stays set while the dialog animates out so its content
 * doesn't blank mid-fade. Shared by every "place order" button.
 */
export const usePaymentErrorAlert = () => {
  const router = useRouter()
  const [error, setError] = useState<PaymentErrorState | null>(null)
  const [open, setOpen] = useState(false)

  const show = (kind: PaymentErrorKind, detail?: string | null) => {
    setError({ kind, detail: detail ?? null })
    setOpen(true)
  }

  const close = () => setOpen(false)

  const alert = error ? (
    <PaymentErrorDialog
      open={open}
      kind={error.kind}
      detail={error.detail}
      onClose={close}
      onChangeMethod={() => {
        close()
        router.push(
          { pathname: "/checkout", query: { step: "payment" } },
          { scroll: false }
        )
      }}
    />
  ) : null

  return { show, alert }
}
