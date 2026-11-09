"use client"
import React, { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import DynamicImage from "../utilities/DynamicImage"
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6"
import { motion, AnimatePresence } from "framer-motion"

interface GalleryImage {
  url: string
  alt?: string
}

interface SwhGalleryProps {
  images: GalleryImage[]
  productTitle: string
  className?: string
}

const SwhGallery = ({
  images,
  productTitle,
  className = "",
}: SwhGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([])

  const handlePrevious = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      setTouchEnd(e.changedTouches[0].clientX)
      const distance = touchStart - e.changedTouches[0].clientX
      const minSwipeDistance = 50

      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          handleNext()
        } else {
          handlePrevious()
        }
      }
    },
    [touchStart, handleNext, handlePrevious]
  )

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[currentIndex]
    if (activeThumbnail && thumbnailContainerRef.current) {
      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [currentIndex])

  if (!images || images.length === 0) {
    return null
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 500 : -500,
     
    }),
    center: {
      zIndex: 1,
      x: 0,

    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? -500 : 500,
   
    }),
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[70px_1fr] gap-2 md:gap-4 md:items-start">
        {/* Thumbnail Carousel - Vertical on Desktop */}
        <div
          ref={thumbnailContainerRef}
          className="flex flex-col gap-2 max-md:flex-row md:flex-col overflow-y-auto max-md:overflow-x-auto max-md:hidden scrollbar-hide max-h-[70vh]"
        >
          {images.map((image, index) => (
            <div
              key={index}
              ref={(el) => {
                thumbnailRefs.current[index] = el
              }}
              onClick={() => handleThumbnailClick(index)}
              className={`relative flex-shrink-0  overflow-hidden transition-all duration-300 cursor-pointer ${
                currentIndex === index
                  ? "border border-black"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{ aspectRatio: "3/4" }}
            >
              <DynamicImage
                url={image.url}
                alt={image.alt || `${productTitle} - Image ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Main Gallery */}

        <div
          className="relative cursor-zoom-in overflow-hidden h-fit"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => setIsPopupOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, type:"tween" }}
            >
              <DynamicImage
                url={images[currentIndex].url}
                alt={
                  images[currentIndex].alt ||
                  `${productTitle} - Image ${currentIndex + 1}`
                }
                className="object-cover aspect-[3/4]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <div className="">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                aria-label="Previous image"
                className="absolute left-0 sm:left-[30px] top-1/2 -translate-y-1/2 z-10 w-[45px] h-[45px] rounded-full bg-white hover:bg-black text-black hover:text-white flex flex-col items-center justify-center border-0 outline-none cursor-pointer select-none"
                style={{
                  boxShadow: "0 10px 10px rgba(0, 0, 0, 0.11)",
                  opacity: isHovering ? 1 : 0,
                  transform: isHovering ? "translateX(0)" : "translateX(-20px)",
                  transition: "all 250ms cubic-bezier(0.645, 0.045, 0.355, 1)",
                  pointerEvents: isHovering ? "auto" : "none",
                }}
              >
                <FaArrowLeft />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                aria-label="Next image"
                className="absolute right-0 sm:right-[30px] top-1/2 -translate-y-1/2 z-10 w-[45px] h-[45px] rounded-full bg-white hover:bg-black text-black hover:text-white flex flex-col items-center justify-center border-0 outline-none cursor-pointer select-none"
                style={{
                  boxShadow: "0 10px 10px rgba(0, 0, 0, 0.11)",
                  opacity: isHovering ? 1 : 0,
                  transform: isHovering ? "translateX(0)" : "translateX(20px)",
                  transition: "all 250ms cubic-bezier(0.645, 0.045, 0.355, 1)",
                  pointerEvents: isHovering ? "auto" : "none",
                }}
              >
                <FaArrowRight />
              </button>
            </div>
          )}

          {/* Image Counter */}
          {/* {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )} */}
        </div>
      </div>

      {/* Popup Modal Gallery */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#000] flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setIsPopupOpen(false)}
            className="absolute top-4 right-4 z-50 cursor-pointer text-white hover:text-gray-300 transition-colors"
            aria-label="Close gallery"
          >
            <Icon.X size={32} weight="bold" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={images[currentIndex].url}
              alt={
                images[currentIndex].alt ||
                `${productTitle} - Image ${currentIndex + 1}`
              }
              fill
              className="w-full h-full object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Popup Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-black  text-white rounded-full transition-colors"
                >
                  <FaArrowLeft />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-black  text-white rounded-full transition-colors"
                >
                  <FaArrowRight />
                </button>

                {/* Popup Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default SwhGallery
