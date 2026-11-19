import { User } from "@medusajs/icons"

type GuestWishlistNoticeProps = {
  actionHref: string
  actionLabel: string
  description: string
  heading: string
}

export default function GuestWishlistNotice({
  actionHref,
  actionLabel,
  description,
  heading,
}: GuestWishlistNoticeProps) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 small:flex-row small:items-center small:justify-between small:gap-8"
      data-testid="guest-wishlist-notice"
    >
      <div className="flex items-start gap-x-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black">
          <User />
        </span>
        <div className="flex flex-col gap-y-1">
          <p className="text-[15px] font-semibold text-black">{heading}</p>
          <p className="text-sm leading-6 text-secondary">{description}</p>
        </div>
      </div>
      <a
        href={actionHref}
        className="inline-flex h-11 shrink-0 items-center justify-center bg-[#ef7a4c] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#e2683a]"
      >
        {actionLabel}
      </a>
    </div>
  )
}
