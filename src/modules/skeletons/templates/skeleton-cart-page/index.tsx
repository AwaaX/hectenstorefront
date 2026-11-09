import repeat from "@lib/util/repeat"

/* Mirrors the cart page layout: items card on the left, summary card on the right */
const SkeletonCartPage = () => {
  return (
    <div className="w-full bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 small:py-10">
        <div className="grid grid-cols-1 items-start gap-6 small:grid-cols-[minmax(0,1fr)_400px] small:gap-8">
          <div className="flex flex-col gap-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-ui-border-base bg-white px-5 py-4 small:px-7 small:py-5">
              <div className="flex flex-col gap-y-2">
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-10 w-20 animate-pulse rounded-md bg-gray-200" />
            </div>

            <div className="rounded-2xl border border-ui-border-base bg-white">
              <div className="border-b border-ui-border-base px-5 py-4 small:px-7 small:py-5">
                <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="divide-y divide-ui-border-base px-5 small:px-7">
                {repeat(3).map((index) => (
                  <div key={index} className="flex gap-x-4 py-5">
                    <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200 small:h-24 small:w-24" />
                    <div className="flex flex-1 flex-col gap-y-3">
                      <div className="flex justify-between gap-x-4">
                        <div className="flex flex-col gap-y-2">
                          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        </div>
                        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                      </div>
                      <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-ui-border-base bg-white">
            <div className="px-5 py-4 small:px-7 small:py-5">
              <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="border-t border-ui-border-base px-5 py-4 small:px-7">
              <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
            </div>
            <div className="flex flex-col gap-y-3 border-t border-ui-border-base bg-ui-bg-subtle px-5 py-5 small:px-7 small:py-6">
              {repeat(3).map((index) => (
                <div key={index} className="flex justify-between">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
            <div className="border-t border-ui-border-base px-5 py-5 small:px-7 small:py-6">
              <div className="h-12 w-full animate-pulse rounded-md bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCartPage
