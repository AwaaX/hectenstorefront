"use client"
import React, { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { IoIosArrowDown } from "react-icons/io"
import men from "@/public/images/measurement-guide/men.webp"
import women from "@/public/images/measurement-guide/women.webp"
import baby from "@/public/images/measurement-guide/baby.webp"
import child from "@/public/images/measurement-guide/child.webp"

const MeasurementGuide = () => {
  const t = useTranslations("StaticPages.MeasurementGuide")
  const [gender, setGender] = useState("men")
  const measurements = t.raw("measurements") as unknown as Array<{
    primaryLabel: string
    primaryText: string
    secondaryLabel?: string
    secondaryText?: string
  }>

  return (
    <div className="small-container px-4 md:px-0">
      <div className="py-[20px] md:py-[35px]">
        <div className="text-[14px] md:text-[20px] font-light flex-1">
          {t("intro.eyebrow")}
        </div>
        <h1 className="text-[24px] md:text-[42px] font-normal leading-snug">
          {t("intro.title")}
        </h1>
        <p className="christmas-font mt-4 md:mt-6 text-[14px] md:text-base">
          {t("intro.paragraph1")}
        </p>
        <p className="christmas-font mt-4 md:mt-6 text-[14px] md:text-base">
          {t("intro.paragraph2")}
        </p>
      </div>
      <div className="py-[20px] md:py-[35px]">
        <div className="text-[14px] md:text-[20px] font-light flex-1">
          {t("withoutTape.eyebrow")}
        </div>
        <h1 className="text-[24px] md:text-[42px] font-normal leading-snug">
          {t("withoutTape.title")}
        </h1>
        <p className="christmas-font mt-4 md:mt-6 text-[14px] md:text-base">
          {t("withoutTape.description")}
        </p>
      </div>
      <div className="py-[20px] md:py-[35px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-2 md:gap-4 mb-6">
          <h1 className="text-[24px] md:text-[42px] font-normal leading-snug">
            {t("guideTitle")}
          </h1>
          <div className="flex items-center justify-start gap-2 border-b-2 border-black">
            <select
              className="text-[20px] md:text-[42px] font-normal leading-snug bg-transparent outline-none"
              onChange={(e) => setGender(e.target.value)}
              value={gender}
            >
              <option value="men" className="px-3">{t("options.men")}</option>
              <option value="women" className="px-3">{t("options.women")}</option>
              <option value="child" className="px-3">{t("options.child")}</option>
              <option value="baby" className="px-3">{t("options.baby")}</option>
            </select>
            <IoIosArrowDown className="text-[20px] md:text-[28px] font-normal leading-snug" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <ul className="pl-4 md:pl-10 order-2 md:order-1">
            {measurements
              .filter((measurement) => {
                if (gender === "baby") {
                  return !measurement.primaryLabel.includes("D - ");
                }
                return !measurement.primaryLabel.includes("E - ");
              })
              .map((measurement, index) => (
                <li key={index} className="christmas-font mt-4 md:mt-6 text-[14px] md:text-base">
                  <span className="font-bold">{measurement.primaryLabel}</span> {measurement.primaryText}
                  {measurement.secondaryLabel && (
                    <>
                      <br />
                      <span className="font-bold">{measurement.secondaryLabel}</span> {measurement.secondaryText}
                    </>
                  )}
                </li>
              ))}
          </ul>
          <div className="order-1 md:order-2 flex justify-center">
            {gender === "men" && <Image src={men} alt={t("imageAlt")} className=" h-80 w-auto md:h-auto "/>}
            {gender === "women" && <Image src={women} alt={t("imageAlt")} className="h-80 w-auto md:h-auto "/>}
            {gender === "child" && <Image src={child} alt={t("imageAlt")} className="h-80 w-auto md:h-[400px] "/>}
            {gender === "baby" && <Image src={baby} alt={t("imageAlt")} className="h-80 w-auto md:h-auto "/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeasurementGuide
