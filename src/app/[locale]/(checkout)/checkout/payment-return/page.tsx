import PaymentReturn from "@modules/checkout/components/payment-return"
import { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PaymentReturnPage() {
  return <PaymentReturn />
}
