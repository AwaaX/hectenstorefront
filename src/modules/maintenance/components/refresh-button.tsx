"use client"

import { useEffect } from "react"

const REFRESH_INTERVAL_MS = 60_000

/**
 * Reloads the page every minute (while the tab is visible) so visitors land
 * back on the shop as soon as maintenance ends, with a manual button as well.
 */
export default function RefreshButton({ label }: { label: string }) {
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        window.location.reload()
      }
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="contrast-btn text-[15px] px-8"
    >
      {label}
    </button>
  )
}
