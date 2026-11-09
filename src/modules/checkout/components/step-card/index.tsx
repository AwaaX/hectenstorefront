import { CheckMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import React from "react"

/** Shared style for the small "Edit" action shown on a completed step. */
export const stepEditButtonClass =
  "text-small-semi text-ui-fg-base underline underline-offset-4 hover:text-ui-fg-subtle transition-colors"

type StepCardProps = {
  /** 1-based position shown in the badge. */
  number: number
  title: React.ReactNode
  /** The step is the one the customer is currently filling in. */
  isOpen: boolean
  /** The step was finished (shows a tick instead of the number). */
  isComplete?: boolean
  /** The step can't be reached yet (shown muted, no content). */
  isDisabled?: boolean
  /** Whether anything in the body is visible. Children are always rendered. */
  showBody?: boolean
  /** Right-aligned action, e.g. the "Edit" button. */
  action?: React.ReactNode
  children?: React.ReactNode
  "data-testid"?: string
}

/**
 * One numbered section of the checkout. Purely presentational: the step
 * components keep all their own state and behaviour and only render inside it.
 */
const StepCard = ({
  number,
  title,
  isOpen,
  isComplete = false,
  isDisabled = false,
  showBody = true,
  action,
  children,
  "data-testid": dataTestId,
}: StepCardProps) => {
  return (
    <section
      data-testid={dataTestId}
      aria-current={isOpen ? "step" : undefined}
      className={clx(
        "rounded-2xl border bg-white transition-all duration-200",
        isOpen
          ? "border-ui-border-strong shadow-md"
          : "border-ui-border-base shadow-sm",
        isDisabled && "bg-ui-bg-subtle shadow-none"
      )}
    >
      <header className="flex items-center gap-x-3 px-5 py-4 small:px-7 small:py-5">
        <span
          aria-hidden="true"
          className={clx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-small-semi transition-colors",
            isComplete
              ? "bg-ui-tag-green-icon text-white"
              : isOpen
              ? "bg-ui-fg-base text-white"
              : "border border-ui-border-strong text-ui-fg-muted"
          )}
        >
          {isComplete ? <CheckMini /> : number}
        </span>

        <h2
          className={clx("text-lg font-semibold small:text-xl", {
            "text-ui-fg-muted": isDisabled,
            "text-ui-fg-base": !isDisabled,
          })}
        >
          {title}
        </h2>

        {action && <div className="ml-auto shrink-0">{action}</div>}
      </header>

      {children && (
        <div
          className={clx({
            "border-t border-ui-border-base px-5 pb-6 pt-5 small:px-7 small:pb-7":
              showBody && isOpen,
            "px-5 pb-5 small:px-7 small:pb-6": showBody && !isOpen,
            hidden: !showBody,
          })}
        >
          {children}
        </div>
      )}
    </section>
  )
}

export default StepCard
