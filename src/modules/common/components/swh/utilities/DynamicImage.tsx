"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { replaceLocalhostUrl } from "@lib/util/replaceLocalhostUrl"

const DynamicImage = ({ url, alt, className }: { url: string; alt: string; className?: string }) => {
  const [imageData, setImageData] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const updatedUrl=replaceLocalhostUrl(url)

  // console.log("OldURL",url)
  // console.log("updatedUrl",updatedUrl)

  // useEffect(() => {
  //   const fetchImageData = async () => {
  //     const data = await getImage(url)
  //     setImageData(data)
  //   }

  //   fetchImageData()
  // }, [url])

  //   if (!imageData) {
  //     return (
  //       <div className="animate-pulse">
  //         <div className={`${className} bg-slate-200`} />
  //       </div>
  //     )
  //   }
  const handleImageLoad = () => {
    setIsLoaded(true)
    // console.log("loaded")
  }

  //   const { base64, img } = imageData

  return (
    <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
      {/* Loading animation overlay */}
      {!isLoaded && (
        <div className="animate-pulse absolute inset-0 bg-slate-200" />
      )}
      {/* Image with fade-in and scale animation */}
      <Image
        src={url}
        fill
        alt={alt || "not-specified"}
        className={`${className} duration-500 object-cover ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
        }`}
        onLoad={handleImageLoad}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  )
}

export default DynamicImage
