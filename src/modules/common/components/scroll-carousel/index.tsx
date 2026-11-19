"use client"

import { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6"

// Same round white arrows as the Quick look carousel, centred vertically
const arrowClass =
  "absolute top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-[45px] h-[45px] rounded-full bg-white text-black hover:bg-black hover:text-white shadow-[0_10px_10px_rgba(0,0,0,0.11)] transition-all duration-[250ms] ease-[cubic-bezier(0.645,0.045,0.355,1)] disabled:opacity-0 disabled:pointer-events-none"

/**
 * Horizontal scroll-snap carousel with previous / next buttons that move one
 * item and disable at either end. Item widths and the gap come from
 * `itemClassName` / `trackClassName`, so callers control how many show.
 */
export default function ScrollCarousel({
  items,
  itemClassName,
  trackClassName = "gap-5",
  previousLabel,
  nextLabel,
}: {
  items: { key: string; node: ReactNode }[]
  itemClassName: string
  trackClassName?: string
  previousLabel: string
  nextLabel: string
}) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEnds = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateEnds()
    window.addEventListener("resize", updateEnds)
    return () => window.removeEventListener("resize", updateEnds)
  }, [updateEnds])

  // Move by one item (its width plus the track gap)
  const scroll = (direction: 1 | -1) => {
    const el = trackRef.current
    const item = el?.firstElementChild as HTMLElement | null
    if (!el || !item) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({
      left: direction * (item.offsetWidth + gap),
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={previousLabel}
        disabled={atStart}
        onClick={() => scroll(-1)}
        className={`${arrowClass} left-0 -translate-x-1/2`}
      >
        <FaArrowLeft />
      </button>
      <ul
        ref={trackRef}
        onScroll={updateEnds}
        className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${trackClassName}`}
      >
        {items.map(({ key, node }) => (
          <li key={key} className={`shrink-0 snap-start ${itemClassName}`}>
            {node}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={atEnd}
        onClick={() => scroll(1)}
        className={`${arrowClass} right-0 translate-x-1/2`}
      >
        <FaArrowRight />
      </button>
    </div>
  )
}
