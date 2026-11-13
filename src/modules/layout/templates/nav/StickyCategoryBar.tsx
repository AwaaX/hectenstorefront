"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Desktop category bar. Once it sticks to the top of the viewport it gets a
 * shadow and the Hecten icon slides in on the left.
 */
export default function StickyCategoryBar({
  alt,
  children,
}: {
  alt: string
  children: ReactNode
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  // The zero-height sentinel sits right above the bar; once it scrolls out
  // of view the bar is pinned.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) =>
      setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="max-lg:hidden h-0" />
      <div
        className={`max-lg:hidden sticky top-0 z-40 bg-white font-[system-ui] border-t border-[#f7f7f7] transition-shadow duration-300 ${
          stuck ? "shadow-[0_2px_10px_0_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <div className="content-container h-[60px] flex items-center">
          <LocalizedClientLink
            href="/"
            aria-hidden={!stuck}
            tabIndex={stuck ? 0 : -1}
            className={`shrink-0 overflow-hidden transition-all duration-300 ${
              stuck ? "w-[33px] mr-8 opacity-100" : "w-0 mr-0 opacity-0"
            }`}
          >
            <Image
              src="/hecten-icon.svg"
              alt={alt}
              width={157}
              height={109}
              unoptimized
              className="w-[33px] max-w-none h-auto"
            />
          </LocalizedClientLink>
          <div className="flex-1 h-full">{children}</div>
        </div>
      </div>
    </>
  )
}
