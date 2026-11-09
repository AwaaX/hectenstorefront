"use client"

import { generateWishlistShareUrl } from "@lib/data/wishlist"
import { CheckCircleSolid, Link, SquareTwoStack } from "@medusajs/icons"
import { Button, Label, clx, toast } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import AccountPageHeader from "@modules/account/components/page-header"

type WishlistShareButtonProps = {
  disabled?: boolean
}

const useWishlistShare = () => {
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const t = useTranslations("Wishlist.ShareButton")

  const handleShare = async () => {
    setIsLoading(true)

    try {
      const nextShareUrl = await generateWishlistShareUrl(locale)

      setShareUrl(nextShareUrl)

      await navigator.clipboard.writeText(nextShareUrl)

      toast.success(t("successTitle"), {
        description: t("successDescription"),
      })
    } catch (error) {
      toast.error(t("errorTitle"), {
        description:
          error instanceof Error ? error.message : t("errorDescription"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, shareUrl, handleShare }
}

const ShareButton = ({
  disabled,
  isLoading,
  onClick,
}: {
  disabled: boolean
  isLoading: boolean
  onClick: () => void
}) => {
  const t = useTranslations("Wishlist.ShareButton")

  return (
    <Button
      type="button"
      variant="secondary"
      size="large"
      onClick={onClick}
      disabled={disabled}
      isLoading={isLoading}
      className="w-full small:w-auto"
    >
      <span className="flex items-center gap-x-2">
        <Link />
        <span>{t("button")}</span>
      </span>
    </Button>
  )
}

export const WishlistShareLink = ({ url }: { url: string }) => {
  const t = useTranslations("Wishlist.ShareButton")
  const inputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(() => setCopied(false), 2000)

    return () => clearTimeout(timeout)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard access can be blocked; select the text so it can be copied manually.
      inputRef.current?.select()
      toast.error(t("errorTitle"))
    }
  }

  return (
    <div className="flex flex-col gap-y-3 rounded-xl border border-line bg-surface/60 p-4 small:p-5">
      <div className="flex flex-col gap-y-0.5">
        <Label
          htmlFor="wishlist-share-url"
          className="text-[15px] font-semibold text-black"
        >
          {t("label")}
        </Label>
        <p className="text-sm text-secondary">{t("successDescription")}</p>
      </div>
      <div className="flex w-full">
        <input
          ref={inputRef}
          id="wishlist-share-url"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-12 min-w-0 flex-1 rounded-l-lg border border-r-0 border-line bg-white px-4 text-[15px] text-black outline-none transition-colors focus:border-black"
          data-testid="wishlist-share-url"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={clx(
            "inline-flex h-12 shrink-0 items-center justify-center gap-x-2 rounded-r-lg px-4 text-sm font-semibold transition-colors small:px-6",
            {
              "bg-emerald-600 text-white": copied,
              "bg-black text-white hover:bg-green hover:text-black": !copied,
            }
          )}
          data-testid="wishlist-share-copy-button"
        >
          {copied ? <CheckCircleSolid /> : <SquareTwoStack />}
          <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
        </button>
      </div>
    </div>
  )
}

export default function WishlistShareButton({
  disabled = false,
}: WishlistShareButtonProps) {
  const { isLoading, shareUrl, handleShare } = useWishlistShare()

  return (
    <div className="flex flex-col gap-y-3">
      <ShareButton
        disabled={disabled}
        isLoading={isLoading}
        onClick={handleShare}
      />
      {shareUrl && <WishlistShareLink url={shareUrl} />}
    </div>
  )
}

/**
 * Page header with the share button as its action. The generated link is shown
 * full width below the header so the field has room to be readable.
 */
export function WishlistShareHeader({
  title,
  description,
  disabled = false,
}: WishlistShareButtonProps & { title: string; description?: string }) {
  const { isLoading, shareUrl, handleShare } = useWishlistShare()

  return (
    <>
      <AccountPageHeader
        title={title}
        description={description}
        action={
          <ShareButton
            disabled={disabled}
            isLoading={isLoading}
            onClick={handleShare}
          />
        }
      />
      {shareUrl && (
        <div className="mb-8">
          <WishlistShareLink url={shareUrl} />
        </div>
      )}
    </>
  )
}
