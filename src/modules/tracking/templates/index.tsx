"use client"

import React, { useEffect, useRef, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import {
  fetchTracking,
  fetchTrackingByOrder,
  OrderTrackingResponse,
  TrackingResult,
} from "@lib/data/tracking"
import TrackingDetails from "@modules/tracking/components/tracking-details"

const TABS = ["orderDetails", "trackingNumbers"] as const

const OrderTracking = () => {
  const t = useTranslations("Tracking.Page")
  const searchParams = useSearchParams()
  const initialTrackingNo = searchParams.get("tracking_no") || ""
  const autoTracked = useRef(false)
  const [selectedTab, setSelectedTab] = useState(initialTrackingNo ? 1 : 0)
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNo)
  const [orderId, setOrderId] = useState("")
  const [orderEmail, setOrderEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [trackingResults, setTrackingResults] = useState<TrackingResult[]>([])
  const [orderResult, setOrderResult] = useState<
    (OrderTrackingResponse & { success: true }) | null
  >(null)
  const steps = [
    { key: "InfoReceived", label: t("milestones.infoReceived") },
    { key: "PickedUp", label: t("milestones.pickedUp") },
    { key: "Departure", label: t("milestones.departure") },
    { key: "Arrival", label: t("milestones.arrival") },
    { key: "AvailableForPickup", label: t("milestones.availableForPickup") },
    { key: "OutForDelivery", label: t("milestones.outForDelivery") },
    { key: "Delivered", label: t("milestones.delivered") },
  ]

  useEffect(() => {
    if (initialTrackingNo && !autoTracked.current) {
      autoTracked.current = true
      startTransition(async () => {
        const res = await fetchTracking(initialTrackingNo)
        if (!res.success) {
          setError(res.error)
          return
        }
        setTrackingResults([res.data])
      })
    }
  }, [initialTrackingNo])

  const resetState = () => {
    setError(null)
    setTrackingResults([])
    setOrderResult(null)
  }

  const handleTrackByOrder = (e: React.FormEvent) => {
    e.preventDefault()
    resetState()

    startTransition(async () => {
      const res = await fetchTrackingByOrder(orderId, orderEmail)
      if (!res.success) {
        setError(res.error)
        return
      }

      setOrderResult(res)
      const list: TrackingResult[] = []

      if (res.tracking && Object.keys(res.tracking).length > 0) {
        list.push(res.tracking)
      }

      if (Array.isArray(res.trackings) && res.trackings.length > 0) {
        res.trackings.forEach((item) => {
          if (
            !list.some(
              (existing) => existing.tracking_number === item.tracking_number
            )
          ) {
            list.push(item)
          }
        })
      }

      if (!list.length) {
        setError(t("orderFoundNoTracking"))
      }

      setTrackingResults(list)
    })
  }

  const handleTrackByNumber = (e: React.FormEvent) => {
    e.preventDefault()
    resetState()

    startTransition(async () => {
      const res = await fetchTracking(trackingNumber)
      if (!res.success) {
        setError(res.error)
        return
      }

      setTrackingResults([res.data])
    })
  }

  return (
    <div className="order-tracking md:py-20 py-10">
      <div className="container">
        <div className="content-main flex flex-col items-center justify-center">
          <div className="text-[42px] leading-[55px] font-normal text-center">
            {t("heading")}
          </div>
          <div className="left md:w-1/2 w-full border border-gray-300 bg-surface mt-4 md:mt-7">
            <div className="flex justify-around ">
              {TABS.map((tab, index) => (
                <div
                  key={tab}
                  className={`${
                    selectedTab === index
                      ? "border-b-[3px] border-b-blue-800 "
                      : "border-b border-b-gray-300"
                  } flex-1 h-full text-center cursor-pointer px-3 py-4`}
                  onClick={() => {
                    setSelectedTab(index)
                    resetState()
                  }}
                >
                  {t(`tabs.${tab}`)}
                </div>
              ))}
            </div>

            <form
              className="px-4 py-4 duration-300 ease-linear "
              onSubmit={
                selectedTab === 0 ? handleTrackByOrder : handleTrackByNumber
              }
            >
              {selectedTab === 0 && (
                <>
                  <div className="mt-2 ">{t("orderPrompt")}</div>
                  <div className="email mt-8">
                    <label htmlFor="order-id">{t("orderId")}</label>
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="order-id"
                      type="text"
                      placeholder={t("orderNumberPlaceholder")}
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="billing mt-8">
                    <label htmlFor="order-email">{t("orderEmail")}</label>
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="order-email"
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={orderEmail}
                      onChange={(e) => setOrderEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {selectedTab === 1 && (
                <>
                  <div className="mt-2 ">{t("trackingPrompt")}</div>
                  <div className="billing mt-8">
                    <label htmlFor="tracking-number">
                      {t("trackingNumberLabel")}
                    </label>
                    <input
                      className="border-line px-4 pt-3 pb-3 w-full rounded-lg"
                      id="tracking-number"
                      type="text"
                      placeholder={t("trackingNumberPlaceholder")}
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="block-button md:mt-7 mt-8">
                <button
                  className="swh-btn bg-black text-white"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? t("tracking") : t("trackOrder")}
                </button>
              </div>
            </form>
          </div>

          {error && <p className="mt-4 text-red text-center">{error}</p>}

          {orderResult?.success && (
            <div className="md:w-1/2 w-full mt-4 text-[14px] text-gray-600">
              <p>
                {t("orderLabel")}{" "}
                <strong>
                  #
                  {orderResult.order.custom_display_id ??
                    orderResult.order.display_id}
                </strong>
              </p>
            </div>
          )}

          {trackingResults.length > 0 && (
            <div className="md:w-1/2 w-full">
              {trackingResults.map((item, index) => (
                <TrackingDetails
                  key={`${item.tracking_number}-${index}`}
                  item={item}
                  steps={steps}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
