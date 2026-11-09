import { clx } from "@medusajs/ui"
import { useTranslations } from "next-intl"

const STATUS_TONES: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  partially_delivered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  shipped: "bg-sky-50 text-sky-700 ring-sky-600/20",
  partially_shipped: "bg-sky-50 text-sky-700 ring-sky-600/20",
  fulfilled: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  partially_fulfilled: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  not_fulfilled: "bg-amber-50 text-amber-800 ring-amber-600/20",
  canceled: "bg-rose-50 text-rose-700 ring-rose-600/20",
}

const DEFAULT_TONE = "bg-gray-50 text-gray-700 ring-gray-500/20"

const OrderStatusBadge = ({ status }: { status?: string | null }) => {
  const t = useTranslations("Order.Details")

  if (!status) {
    return null
  }

  const label = t.has(`statuses.${status}`)
    ? t(`statuses.${status}`)
    : status.charAt(0).toUpperCase() + status.slice(1).split("_").join(" ")

  return (
    <span
      className={clx(
        "inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        STATUS_TONES[status] ?? DEFAULT_TONE
      )}
      data-testid="order-status-badge"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  )
}

export default OrderStatusBadge
