"use client"

import { useActionState } from "react"
import { createTransferRequest } from "@lib/data/orders"
import { Text, Heading, Input, Button, IconButton, Toaster } from "@medusajs/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { ArrowPath, CheckCircleMiniSolid, XCircleSolid } from "@medusajs/icons"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const t = useTranslations("Account.TransferRequest")
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex items-start gap-x-4">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-white text-black xsmall:flex">
            <ArrowPath />
          </span>
          <div className="flex flex-col gap-y-1">
            <Heading level="h3" className="text-lg font-semibold text-black">
              {t("heading")}
            </Heading>
            <Text className="text-[15px] leading-6 text-secondary">
              {t("promptLine1")}
              <br /> {t("promptLine2")}
            </Text>
          </div>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-2 w-full xsmall:flex-row">
            <div className="min-w-0 flex-1">
              <Input
                className="h-10 w-full px-3"
                name="order_id"
                placeholder={t("orderIdPlaceholder")}
              />
            </div>
            <SubmitButton
              variant="primary"
              className="w-full whitespace-nowrap xsmall:w-fit"
            >
              {t("requestTransfer")}
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-sm text-rose-600 sm:text-right">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex justify-between gap-x-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <CheckCircleMiniSolid className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              <Text className="text-medim-pl text-neutral-950">
                {t("successRequested", { id: state.order?.id ?? "" })}
              </Text>
              <Text className="text-base-regular text-neutral-600">
                {t("successEmailSent", { email: state.order?.email ?? "" })}
              </Text>
            </div>
          </div>
          <IconButton
            variant="transparent"
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <XCircleSolid className="w-4 h-4 text-neutral-500" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
