"use client"

import { useEffect, useState } from "react"
import { FaRegClock } from "react-icons/fa6"

const formatTime = (iso: string, locale: string, timeZone?: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(new Date(iso))

type ExpectedBackProps = {
  label: string
  iso: string
  locale: string
}

/**
 * The server doesn't know the visitor's time zone, so it renders the time in
 * UTC and the browser swaps in the local time once hydrated.
 */
export default function ExpectedBack({ label, iso, locale }: ExpectedBackProps) {
  const [text, setText] = useState(() => formatTime(iso, locale, "UTC"))

  useEffect(() => {
    setText(formatTime(iso, locale))
  }, [iso, locale])

  return (
    <p className="mx-auto mt-8 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-gray-400 px-6 py-2 text-[15px]">
      <FaRegClock className="text-base text-christmas" aria-hidden="true" />
      <span>{label}</span>
      <time dateTime={iso} className="font-medium" suppressHydrationWarning>
        {text}
      </time>
    </p>
  )
}
