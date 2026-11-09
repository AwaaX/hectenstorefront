import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default  function PreviewPrice({ price, highestPrice, fontSize="text-[16px]" }: { price: VariantPrice | null, highestPrice: VariantPrice | null, fontSize?: string   }) {
  if (!price) {
    return null
  }

  const showRange =
    highestPrice && highestPrice.calculated_price !== price.calculated_price

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={clx(fontSize, {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price} {showRange && `- ${highestPrice.calculated_price}`}
      </Text>
    </>
  )
}
