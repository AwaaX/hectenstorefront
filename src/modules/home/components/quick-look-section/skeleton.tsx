// Breakpoint configuration for carousel responsiveness:
// 400px: 2 slides per view, 576px: 3 slides, 768px: 4 slides, 992px: 4 slides, 1290px: 5 slides
export default function QuickLookSectionSkeleton() {
  return (
    <div className="pt-12 md:pt-24 w-full relative animate-pulse">
      <div className="max-w-[1200px] w-full mx-auto py-[35px] md:py-[70px]">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="h-8 md:h-12 bg-gray-200 rounded mb-4 w-3/4 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full max-w-md mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 max-w-md mx-auto"></div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="trending-block mt-[60px] max-md:mx-4">
          <div className="flex gap-3 overflow-x-hidden pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/4 xl:w-1/5">
                {/* Product Card */}
                <div className="border border-transparent hover:border-black rounded-md px-2 duration-500 ease-in-out">
                  {/* Product Image Container */}
                  <div className="bg-white relative overflow-hidden rounded-2xl mb-4">
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 max-lg:hidden">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                    {/* Image Placeholder */}
                    <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg"></div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2 mb-4">
                    {/* Title */}
                    <div className="h-5 bg-gray-200 rounded w-5/6"></div>

                    {/* Price */}
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                    {/* Stock Status */}
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>

                    {/* Select Option Button (Hidden) */}
                    <div className="h-10 bg-gray-200 rounded mt-3 opacity-0 group-hover:opacity-100"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-4 px-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
