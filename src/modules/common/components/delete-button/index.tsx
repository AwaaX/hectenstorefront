"use client"

import {
  buildLineItemAnalyticsItem,
  getAnalyticsValue,
  trackEcommerceEvent,
} from "@lib/analytics"
import { deleteLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Spinner } from "@medusajs/icons"
import * as Icon from "@phosphor-icons/react/dist/ssr"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  item,
  currencyCode,
  children,
  className,
}: {
  id: string
  item?: HttpTypes.StoreCartLineItem
  currencyCode?: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    try {
      await deleteLineItem(id)

      if (item) {
        const analyticsItem = buildLineItemAnalyticsItem({
          item,
        })

        trackEcommerceEvent("remove_from_cart", {
          currency: currencyCode?.toUpperCase(),
          value: getAnalyticsValue([analyticsItem]),
          items: [analyticsItem],
        })
      }
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        type="button"
        aria-label="Remove"
        title="Remove"
        className="flex items-center justify-center text-[#666] hover:text-black duration-200 cursor-pointer"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? (
          <Spinner className="animate-spin" />
        ) : (
          <Icon.TrashIcon size={18} />
        )}
      </button>
    </div>
  )
}

export default DeleteButton
