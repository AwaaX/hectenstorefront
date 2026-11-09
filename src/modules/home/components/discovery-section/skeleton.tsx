export default function DiscoverySectionSkeleton() {
  return (
    <div className="w-full relative animate-pulse">
      <div className="max-w-[1200px] w-full mx-auto py-[35px] md:py-[70px] px-3">
        {/* Header */}
        <div className="text-center max-w-[500px] mx-auto mb-16">
          <div className="h-10 md:h-16 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6 mx-auto"></div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-16">
          {/* Item 1: Full-width image with overlay */}
          <div className="w-full">
            <div className="flex items-center max-md:flex-col-reverse md:flex-row-reverse md:gap-[70px] gap-8">
              <div className="flex-1">
                <div className="text-center space-y-4">
                  <div className="h-8 md:h-10 bg-gray-200 rounded w-4/5 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="w-full bg-gray-200 rounded-lg aspect-square md:aspect-auto md:h-[500px]"></div>
              </div>
            </div>
          </div>

          {/* Item 2: Circular image */}
          <div className="w-full">
            <div className="flex items-center max-md:flex-col-reverse md:gap-[70px] gap-8">
              <div className="flex-1">
                <div className="text-center space-y-4">
                  <div className="h-8 md:h-10 bg-gray-200 rounded w-4/5 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-[160px] h-[160px] bg-gray-200 rounded-full"></div>
                  <div className="text-center space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-4/5 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/5 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: Circular image */}
          <div className="w-full">
            <div className="flex items-center max-md:flex-col-reverse md:flex-row-reverse md:gap-[70px] gap-8">
              <div className="flex-1">
                <div className="text-center space-y-4">
                  <div className="h-8 md:h-10 bg-gray-200 rounded w-4/5 mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-[160px] h-[160px] bg-gray-200 rounded-full"></div>
                  <div className="text-center space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-4/5 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/5 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
