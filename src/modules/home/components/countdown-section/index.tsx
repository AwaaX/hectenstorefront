"use client"

import Image from "next/image"
import { Heading } from "@medusajs/ui"
import timerSectionImg from "@lib/img/x_mas_countdown_banner.jpg.webp"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const CountDownSection = () => {
  const t = useTranslations("HomePage.Timer")
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateCountdown = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      let christmasDate = new Date(currentYear, 11, 25)

      if (now > christmasDate) {
        christmasDate = new Date(currentYear + 1, 11, 25)
      }

      const difference = christmasDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        )
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const padNumber = (num: number) => String(num).padStart(2, "0")

  return (
    <>
      {/* Timer Section */}
      <div className="h-[214px] md:h-[264px] w-full relative ">
        <Image
          src={timerSectionImg}
          alt={t("bannerAlt")}
          className="object-left md:object-center object-cover w-full h-full"
          placeholder="blur"
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
          <div className="flex flex-col w-full items-center justify-center">
            <Heading
              level="h2"
              className="text-2xl md:text-[42px] leading-normal  font-light text-white uppercase "
            >
              {t("heading")}
            </Heading>
            {/* Countdown Clock */}
            {!mounted ? (
              <div className="countdown-clock " aria-hidden="true">
                <div className="clock-item">
                  <span className="clock-item-number">00</span>
                  <span className="clock-item-text">{t("days")}</span>
                </div>
                <span className="clock-divider">:</span>
                <div className="clock-item">
                  <span className="clock-item-number">00</span>
                  <span className="clock-item-text">{t("hours")}</span>
                </div>
                <span className="clock-divider">:</span>
                <div className="clock-item">
                  <span className="clock-item-number">00</span>
                  <span className="clock-item-text">{t("minutes")}</span>
                </div>
                <span className="clock-divider">:</span>
                <div className="clock-item">
                  <span className="clock-item-number">00</span>
                  <span className="clock-item-text">{t("seconds")}</span>
                </div>
              </div>
            ) : (
              <div className="countdown-clock">
                {/* Clock Item Days */}
                <div className="clock-item">
                  <span className="clock-item-number">
                    {padNumber(countdown.days)}
                  </span>
                  <span className="clock-item-text">{t("days")}</span>
                </div>
                <span className="clock-divider">:</span>
                {/* Clock Item hours */}
                <div className="clock-item">
                  <span className="clock-item-number">
                    {padNumber(countdown.hours)}
                  </span>
                  <span className="clock-item-text">{t("hours")}</span>
                </div>
                <span className="clock-divider">:</span>
                {/* Clock Item minutes */}
                <div className="clock-item">
                  <span className="clock-item-number">
                    {padNumber(countdown.minutes)}
                  </span>
                  <span className="clock-item-text">{t("minutes")}</span>
                </div>
                <span className="clock-divider">:</span>
                {/* Clock Item seconds */}
                <div className="clock-item">
                  <span className="clock-item-number">
                    {padNumber(countdown.seconds)}
                  </span>
                  <span className="clock-item-text">{t("seconds")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CountDownSection
