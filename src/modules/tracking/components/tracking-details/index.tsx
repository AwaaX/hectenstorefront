import * as Icon from "@phosphor-icons/react/dist/ssr"
import clsx from "clsx"
import { useLocale, useTranslations } from "next-intl"
import type { TrackingEvent, TrackingResult } from "@lib/data/tracking"

export type TrackingStep = { key: string; label: string }

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-100 text-green-700",
  InTransit: "bg-blue-100 text-blue-700",
  PickedUp: "bg-indigo-100 text-indigo-700",
  Exception: "bg-red-100 text-red-700",
  Returning: "bg-orange-100 text-orange-700",
  Returned: "bg-gray-200 text-gray-700",
}

function formatDate(iso: string | null) {
  if (!iso) return "-"
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
  const t = useTranslations("Tracking.Page.statuses")

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cls}`}
    >
      {status === "Delivered" && <Icon.CheckCircle size={16} weight="fill" />}
      {status === "InTransit" && <Icon.Truck size={16} weight="fill" />}
      {status === "Exception" && <Icon.WarningCircle size={16} weight="fill" />}
      {t.has(status) ? t(status) : status}
    </span>
  )
}

function MilestoneTimeline({
  milestones,
  currentStatus,
  steps,
}: {
  milestones: TrackingResult["milestone"]
  currentStatus: string
  steps: TrackingStep[]
}) {
  const activeIndex = steps.findIndex((m) => m.key === currentStatus)

  return (
    <div className="flex items-start justify-between w-full overflow-x-auto py-4 gap-0">
      {steps.map((step, i) => {
        const data = milestones.find((m) => m.key_stage === step.key)
        const isDone = i <= activeIndex
        const isCurrent = step.key === currentStatus

        return (
          <div
            key={step.key}
            className="flex flex-col items-center flex-1 min-w-[80px]"
          >
            <div className="flex items-center w-full">
              {i > 0 && (
                <div
                  className={clsx(
                    "flex-1 h-[2px]",
                    isDone ? "bg-black" : "bg-gray-200"
                  )}
                />
              )}
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10",
                  isDone
                    ? "bg-black border-black text-white"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isDone ? (
                  <Icon.Check size={14} weight="bold" />
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={clsx(
                    "flex-1 h-[2px]",
                    isDone && i < activeIndex ? "bg-black" : "bg-gray-200"
                  )}
                />
              )}
            </div>
            <div className="text-center mt-2">
              <p
                className={clsx(
                  "text-[11px] font-medium leading-tight",
                  isCurrent
                    ? "text-black"
                    : isDone
                    ? "text-gray-700"
                    : "text-gray-400"
                )}
              >
                {step.label}
              </p>
              {data?.time_raw.date && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {data.time_raw.date}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 17TRACK returns the translated description alongside the carrier's original;
// only use it when it's in the language the page is shown in.
const eventDescription = (ev: TrackingEvent, language: string) => {
  const translation = ev.description_translation
  return translation?.description &&
    translation.lang?.toLowerCase().split("-")[0] === language
    ? translation.description
    : ev.description
}

export default function TrackingDetails({
  item,
  steps,
}: {
  item: TrackingResult
  steps: TrackingStep[]
}) {
  const t = useTranslations("Tracking.Page")
  const language = useLocale().toLowerCase().split("-")[0]
  const events = item.tracking?.providers?.flatMap((p) => p.events) ?? []
  const provider = item.tracking?.providers?.[0]?.provider
  const status = item.latest_status?.status || "Unknown"

  return (
    <div className="mt-6 w-full flex flex-col gap-4 border border-gray-300 rounded-lg p-4 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {t("trackingNumber")}
          </p>
          <p className="text-lg font-semibold">{item.tracking_number}</p>
        </div>
        <StatusBadge status={status} />
        {provider && (
          <a
            href={provider.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {provider.alias || provider.name}
          </a>
        )}
      </div>

      <MilestoneTimeline
        milestones={item.milestone ?? []}
        currentStatus={status}
        steps={steps}
      />

      <div className="text-[15px]">
        <div>
          <strong>{t("lastUpdate")}</strong>{" "}
          {formatDate(item.latest_event?.time_iso || null)}
        </div>
        <div>
          <strong>{t("descriptionLabel")}</strong>{" "}
          {(item.latest_event && eventDescription(item.latest_event, language)) || "-"}
        </div>
        <div>
          <strong>{t("location")}</strong> {item.latest_event?.location || "-"}
        </div>
        <div>
          <strong>{t("route")}</strong>{" "}
          {item.shipping_info?.shipper_address?.country || "-"} to{" "}
          {item.shipping_info?.recipient_address?.country || "-"}
        </div>
      </div>

      {events.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            {t("history")}
          </p>
          <ol className="relative border-l border-gray-200 ml-3 flex flex-col gap-0">
            {events.map((ev, i) => (
              <li key={i} className="mb-4 ml-5">
                <span
                  className={clsx(
                    "absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full ring-4 ring-white",
                    i === 0 ? "bg-black" : "bg-gray-300"
                  )}
                />
                <p className="text-sm font-medium">{eventDescription(ev, language)}</p>
                {ev.location && (
                  <p className="text-xs text-gray-500">{ev.location}</p>
                )}
                {ev.time_iso && (
                  <p className="text-xs text-gray-400">
                    {formatDate(ev.time_iso)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
