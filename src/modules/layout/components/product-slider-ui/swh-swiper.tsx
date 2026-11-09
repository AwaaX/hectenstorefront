"use client"
import React, { useState, useEffect, useRef, ReactNode } from "react"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6"

interface SwhSwiperProps {
  items: ReactNode[]
  slidesPerView?: number
  spaceBetween?: number
  breakpoints?: Record<number, { slidesPerView: number }>
  enableNavigation?: boolean
  loop?: boolean
}

const SwhSwiper = ({
  items,
  slidesPerView = 1,
  spaceBetween = 12,
  breakpoints,
  enableNavigation = true,
  loop = true,
}: SwhSwiperProps) => {
  const [activeSlides, setActiveSlides] = useState(slidesPerView)
  const cloneCount = loop ? Math.max(activeSlides, 1) : 0
  const [currentIndex, setCurrentIndex] = useState(loop ? Math.max(activeSlides, 1) : 0)
  const [isReady, setIsReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRenderRef = useRef(true)
  const isNavigatingRef = useRef(false)

  const defaultBreakpoints = breakpoints || {
     300: { slidesPerView: 2 },
    400: { slidesPerView: 2 },
    576: { slidesPerView: 3 },
    768: { slidesPerView: 4 },
    992: { slidesPerView: 4 },
    1290: { slidesPerView: 5 },
  }

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      let newSlidesPerView = slidesPerView

      const sortedBreakpoints = Object.entries(defaultBreakpoints).sort(
        ([a], [b]) => Number(b) - Number(a)
      )

      for (const [breakpoint, config] of sortedBreakpoints) {
        if (width >= Number(breakpoint)) {
          newSlidesPerView = config.slidesPerView
          break
        }
      }

      setActiveSlides(newSlidesPerView)
      if (isFirstRenderRef.current) {
        setIsReady(true)
        isFirstRenderRef.current = false
        if (loop) {
          setCurrentIndex(Math.max(newSlidesPerView, 1))
        }
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [slidesPerView, defaultBreakpoints, loop])

  useEffect(() => {
    if (!isReady) return

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      setIsTransitioning(true)
      return
    }

    if (!loop) {
      isNavigatingRef.current = false
      return
    }

    const realItemsCount = items.length

    if (currentIndex < cloneCount) {
      isNavigatingRef.current = true
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(cloneCount + realItemsCount - 1)
        setTimeout(() => {
          setIsTransitioning(true)
          isNavigatingRef.current = false
        }, 50)
      }, 300)
    } else if (currentIndex >= cloneCount + realItemsCount) {
      isNavigatingRef.current = true
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(cloneCount)
        setTimeout(() => {
          setIsTransitioning(true)
          isNavigatingRef.current = false
        }, 50)
      }, 300)
    } else {
      isNavigatingRef.current = false
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [currentIndex, items.length, loop, isReady, cloneCount])

  const handleNext = () => {
    if (isNavigatingRef.current) return
    setCurrentIndex((prev) => {
      if (!loop) return Math.min(prev + 1, items.length - 1)
      return prev + 1
    })
  }

  const handlePrev = () => {
    if (isNavigatingRef.current) return
    setCurrentIndex((prev) => {
      if (!loop) return Math.max(prev - 1, 0)
      return prev - 1
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragOffset(e.clientX - dragStart)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (Math.abs(dragOffset) > 50) {
      dragOffset > 0 ? handlePrev() : handleNext()
    }
    setDragOffset(0)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setDragOffset(e.touches[0].clientX - dragStart)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (Math.abs(dragOffset) > 50) {
      dragOffset > 0 ? handlePrev() : handleNext()
    }
    setDragOffset(0)
  }

  const slideWidth = 100 / activeSlides
  const translateX =
    -(currentIndex * slideWidth) +
    (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100

  const createClonedItems = () => {
    if (!loop) return items

    const startClones = items.slice(-cloneCount)
    const endClones = items.slice(0, cloneCount)

    return [...startClones, ...items, ...endClones]
  }

  const clonedItems = createClonedItems()
  const displayItems = clonedItems.map((item, index) => ({ item, key: `${index}-${items.length}` }))

  return (
    <div
      className="h-full"
      style={{
        opacity: isReady ? 1 : 0,
        transition: "opacity 300ms ease-in-out",
      }}
    >
      <div className="relative h-full">
        <div
          ref={containerRef}
          className="overflow-hidden h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(${translateX}%)`,
              transition: isDragging || !isTransitioning ? "none" : "transform 300ms ease-in-out",
            }}
          >
            {displayItems.map(({ item, key }) => (
              <div
                key={key}
                style={{
                  width: `${slideWidth}%`,
                  minWidth: `${slideWidth}%`,
                  paddingRight: `${spaceBetween}px`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {enableNavigation && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-0  top-1/4 sm:top-1/2 -translate-y-1/2 z-10 w-[45px] h-[45px] rounded-full bg-white hover:bg-black text-black hover:text-white flex flex-col items-center justify-center border-0 outline-none cursor-pointer select-none"
              style={{
                boxShadow: "0 10px 10px rgba(0, 0, 0, 0.11)",
                transition: "all 250ms cubic-bezier(0.645, 0.045, 0.355, 1)",
              }}
              aria-label="Previous slide"
              role="button"
              tabIndex={0}
            >
                <FaArrowLeft />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0  top-1/4 sm:top-1/2 -translate-y-1/2 z-10 w-[45px] h-[45px] rounded-full bg-white hover:bg-black text-black hover:text-white flex flex-col items-center justify-center border-0 outline-none cursor-pointer select-none"
              style={{
                boxShadow: "0 10px 10px rgba(0, 0, 0, 0.11)",
                transition: "all 250ms cubic-bezier(0.645, 0.045, 0.355, 1)",
              }}
              aria-label="Next slide"
              role="button"
              tabIndex={0}
            >
              <FaArrowRight />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default SwhSwiper
