/**
 * Placeholder for a homepage product carousel while products load. Mirrors the
 * real section (heading, square image, 2-line title, price) at each
 * breakpoint's card count so nothing shifts when it is replaced.
 */
const ProductCarouselSkeleton = () => (
  <section
    aria-busy
    className="content-container py-[30px] font-[system-ui] animate-pulse"
  >
    <div className="flex justify-center mb-4 h-[36px] items-center">
      <div className="w-[280px] max-w-[70%] h-[22px] rounded bg-[#e8e8e8]" />
    </div>
    <ul className="flex gap-5 overflow-hidden">
      {Array.from({ length: 4 }, (_, i) => (
        <li
          key={i}
          className={`shrink-0 w-[calc((100%-20px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)] ${
            i === 2 ? "max-md:hidden" : i === 3 ? "max-lg:hidden" : ""
          }`}
        >
          {/* Same rows as ProductCard: 3:4 image, title, price, swatches */}
          <div className="aspect-[3/4] bg-[#e8e8e8]" />
          <div className="mt-4 flex h-[24px] items-center">
            <div className="w-[80%] h-[14px] rounded bg-[#e8e8e8]" />
          </div>
          <div className="flex h-[24px] items-center">
            <div className="w-[60px] h-[13px] rounded bg-[#e8e8e8]" />
          </div>
          <div className="mt-[14px] h-[50px]" />
        </li>
      ))}
    </ul>
  </section>
)

export default ProductCarouselSkeleton
