"use client"

import { addWishlistItem, removeWishlistItem } from "@lib/data/wishlist"
import { getWishlistItemIdMap } from "@lib/util/wishlist"
import {
  addGuestWishlistEntry,
  GUEST_WISHLIST_CHANGED_EVENT,
  readGuestWishlist,
  removeGuestWishlistEntry,
} from "@lib/util/guest-wishlist"
import { Toaster, toast } from "@medusajs/ui"
import { useTranslations } from "next-intl"
import React, { createContext, useContext, useEffect, useState } from "react"
import { StoreWishlist } from "types/global"

type WishlistContextValue = {
  addToWishlist: (variantId: string, productId?: string) => Promise<boolean>
  hasCustomer: boolean
  isInWishlist: (variantId?: string | null) => boolean
  isPending: (variantId?: string | null) => boolean
  removeFromWishlist: (
    variantId: string,
    productId?: string
  ) => Promise<boolean>
  toggleWishlist: (variantId: string, productId?: string) => Promise<boolean>
  wishlistCount: number
}

type WishlistProviderProps = {
  children: React.ReactNode
  initialHasCustomer: boolean
  initialWishlist: StoreWishlist | null
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export const WishlistProvider = ({
  children,
  initialHasCustomer,
  initialWishlist,
}: WishlistProviderProps) => {
  const t = useTranslations("Wishlist.Toast")
  const [wishlistItemIdsByVariantId, setWishlistItemIdsByVariantId] = useState(
    () => getWishlistItemIdMap(initialWishlist)
  )
  const [pendingVariantIds, setPendingVariantIds] = useState<Set<string>>(
    () => new Set()
  )
  const [guestVariantIds, setGuestVariantIds] = useState<Set<string>>(
    () => new Set()
  )

  useEffect(() => {
    setWishlistItemIdsByVariantId(getWishlistItemIdMap(initialWishlist))
    setPendingVariantIds(new Set())
  }, [initialHasCustomer, initialWishlist])

  useEffect(() => {
    if (initialHasCustomer) {
      return
    }

    const syncGuestWishlist = () => {
      setGuestVariantIds(
        new Set(readGuestWishlist().map((entry) => entry.variantId))
      )
    }

    syncGuestWishlist()

    window.addEventListener(GUEST_WISHLIST_CHANGED_EVENT, syncGuestWishlist)

    return () => {
      window.removeEventListener(
        GUEST_WISHLIST_CHANGED_EVENT,
        syncGuestWishlist
      )
    }
  }, [initialHasCustomer])

  const syncWishlist = (wishlist: StoreWishlist | null) => {
    setWishlistItemIdsByVariantId(getWishlistItemIdMap(wishlist))
  }

  const addToGuestWishlist = (variantId: string, productId?: string) => {
    if (!productId || guestVariantIds.has(variantId)) {
      return false
    }

    addGuestWishlistEntry({ productId, variantId })
    setGuestVariantIds((current) => new Set(current).add(variantId))

    toast.success(t("guestSavedTitle"), {
      description: t("guestSavedDescription"),
    })

    return true
  }

  const removeFromGuestWishlist = (variantId: string) => {
    if (!guestVariantIds.has(variantId)) {
      return false
    }

    removeGuestWishlistEntry(variantId)
    setGuestVariantIds((current) => {
      const next = new Set(current)
      next.delete(variantId)
      return next
    })

    toast.success(t("guestRemovedTitle"), {
      description: t("guestRemovedDescription"),
    })

    return true
  }

  const addToWishlist = async (variantId: string, productId?: string) => {
    if (!initialHasCustomer) {
      return addToGuestWishlist(variantId, productId)
    }

    if (
      wishlistItemIdsByVariantId.has(variantId) ||
      pendingVariantIds.has(variantId)
    ) {
      return false
    }

    setPendingVariantIds((current) => {
      const next = new Set(current)
      next.add(variantId)
      return next
    })

    try {
      const wishlist = await addWishlistItem(variantId)

      syncWishlist(wishlist)

      toast.success(t("savedTitle"), {
        description: t("savedDescription"),
      })

      return true
    } catch (error) {
      toast.error(t("errorTitle"), {
        description:
          error instanceof Error ? error.message : t("errorDescription"),
      })

      return false
    } finally {
      setPendingVariantIds((current) => {
        const next = new Set(current)
        next.delete(variantId)
        return next
      })
    }
  }

  const removeFromWishlist = async (variantId: string, productId?: string) => {
    if (!initialHasCustomer) {
      return removeFromGuestWishlist(variantId)
    }

    const itemId = wishlistItemIdsByVariantId.get(variantId)

    if (!itemId || pendingVariantIds.has(variantId)) {
      return false
    }

    setPendingVariantIds((current) => {
      const next = new Set(current)
      next.add(variantId)
      return next
    })

    try {
      const wishlist = await removeWishlistItem(itemId)

      syncWishlist(wishlist)

      toast.success(t("removedTitle"), {
        description: t("removedDescription"),
      })

      return true
    } catch (error) {
      toast.error(t("errorTitle"), {
        description:
          error instanceof Error ? error.message : t("errorDescription"),
      })

      return false
    } finally {
      setPendingVariantIds((current) => {
        const next = new Set(current)
        next.delete(variantId)
        return next
      })
    }
  }

  const toggleWishlist = async (variantId: string, productId?: string) => {
    const isSaved = initialHasCustomer
      ? wishlistItemIdsByVariantId.has(variantId)
      : guestVariantIds.has(variantId)

    if (isSaved) {
      return removeFromWishlist(variantId, productId)
    }

    return addToWishlist(variantId, productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        addToWishlist,
        hasCustomer: initialHasCustomer,
        isInWishlist: (variantId) =>
          Boolean(
            variantId &&
              (initialHasCustomer
                ? wishlistItemIdsByVariantId.has(variantId)
                : guestVariantIds.has(variantId))
          ),
        isPending: (variantId) =>
          Boolean(variantId && pendingVariantIds.has(variantId)),
        removeFromWishlist,
        toggleWishlist,
        wishlistCount: initialHasCustomer
          ? wishlistItemIdsByVariantId.size
          : guestVariantIds.size,
      }}
    >
      {children}
      <Toaster />
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }

  return context
}
