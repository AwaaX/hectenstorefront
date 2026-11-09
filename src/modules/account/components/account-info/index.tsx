import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { CheckCircleSolid, ExclamationCircle } from "@medusajs/icons"
import { useEffect } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"
import { useTranslations } from "next-intl"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage,
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const t = useTranslations("Account.AccountInfo")
  const { state, close, toggle } = useToggleState()

  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div className="text-small-regular" data-testid={dataTestid}>
      <div className="flex items-start justify-between gap-x-4">
        <div className="flex min-w-0 flex-col gap-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
            {label}
          </span>
          {typeof currentInfo === "string" ? (
            <span
              className={clx("break-words text-[15px] font-medium", {
                "text-black": currentInfo,
                "italic text-secondary2": !currentInfo,
              })}
              data-testid="current-info"
            >
              {currentInfo || t("notProvided")}
            </span>
          ) : (
            currentInfo
          )}
        </div>
        <div className="shrink-0">
          <Button
            variant="secondary"
            className="min-h-[32px] w-[100px] py-1"
            onClick={handleToggle}
            type={state ? "reset" : "button"}
            data-testid="edit-button"
            data-active={state}
          >
            {state ? t("cancel") : t("edit")}
          </Button>
        </div>
      </div>

      {/* Success state */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <Badge className="mt-4 gap-x-2 p-2" color="green">
            <CheckCircleSolid />
            <span>{t("updatedSuccessfully", { label })}</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      {/* Error state  */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <Badge className="mt-4 gap-x-2 p-2" color="red">
            <ExclamationCircle />
            <span>{errorMessage ?? t("defaultError")}</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      {/* `invisible` keeps the collapsed form out of the tab order and stops its
          (overflowing) fields from catching clicks meant for the rows below. */}
      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity,visibility] duration-300 ease-in-out overflow-visible",
            {
              "visible max-h-[1000px] opacity-100": state,
              "pointer-events-none invisible max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="mt-5 flex flex-col gap-y-2 rounded-xl border border-line bg-surface/60 p-4 small:p-5">
            <div>{children}</div>
            <div className="flex items-center justify-end">
              <Button
                isLoading={pending}
                className="w-full small:max-w-[160px]"
                type="submit"
                data-testid="save-button"
              >
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
