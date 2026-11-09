"use client"

import { clx } from "@medusajs/ui"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Helper function to generate an array of numbers within a range
  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  // Build a real, crawlable href for a given page so bots can discover
  // pagination via <a href> rather than relying on JS click handlers
  const getPageHref = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    return `${pathname}?${params.toString()}`
  }

  // Function to render a page link
  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <Link
      key={p}
      href={getPageHref(p)}
      aria-current={isCurrent ? "page" : undefined}
      className={clx(
        "w-12 h-12 flex items-center justify-center border rounded-full border-gray-300 hover:bg-black hover:text-white duration-200 ease-in-out",
        {
          " bg-black text-white": isCurrent,
        }
      )}
    >
      {label}
    </Link>
  )

  // Function to render ellipsis
  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="txt-xlarge-plus text-ui-fg-muted items-center cursor-default"
    >
      ...
    </span>
  )

  // Function to render page buttons based on the current page and total pages
  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      // Show all pages
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      // Handle different cases for displaying pages and ellipses
      if (page <= 4) {
        // Show 1, 2, 3, 4, 5, ..., lastpage
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        // Show 1, ..., lastpage - 4, lastpage - 3, lastpage - 2, lastpage - 1, lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        // Show 1, ..., page - 1, page, page + 1, ..., lastpage
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    return buttons
  }

  // Render the component
  return (
    <nav
      className="flex justify-center w-full py-12"
      aria-label="Pagination"
    >
      <div className="flex gap-3 items-end" data-testid={dataTestid}>
        {page > 1 && (
          <Link
            href={getPageHref(page - 1)}
            rel="prev"
            className="w-12 h-12 flex items-center justify-center border rounded-full border-gray-300 hover:bg-black hover:text-white duration-200 ease-in-out"
          >
            Prev
          </Link>
        )}
        {renderPageButtons()}
        {page < totalPages && (
          <Link
            href={getPageHref(page + 1)}
            rel="next"
            className="w-12 h-12 flex items-center justify-center border rounded-full border-gray-300 hover:bg-black hover:text-white duration-200 ease-in-out"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
