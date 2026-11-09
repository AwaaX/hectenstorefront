"use client"

import { HttpTypes } from "@medusajs/types"
import { PAYPAL_CLIENT_ID, getPaypalLocale } from "@lib/util/paypal"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { useLocale } from "next-intl"

type PayPalWrapperProps = {
  paymentSession: HttpTypes.StorePaymentSession
  children: React.ReactNode
}

/**
 * Loads PayPal's JS SDK with the currency and intent of the payment session
 * (they must match the PayPal order the backend created).
 */
const PayPalWrapper: React.FC<PayPalWrapperProps> = ({
  paymentSession,
  children,
}) => {
  const locale = useLocale()

  if (!PAYPAL_CLIENT_ID) {
    return <>{children}</>
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: paymentSession.currency_code.toUpperCase(),
        intent:
          paymentSession.data?.intent === "CAPTURE" ? "capture" : "authorize",
        components: "buttons",
        // Pay Later instalments and PayPal's guest checkout (pay by card without
        // a PayPal account). PayPal only shows them where they are available.
        enableFunding: "paylater,card",
        locale: getPaypalLocale(locale),
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
}

export default PayPalWrapper
