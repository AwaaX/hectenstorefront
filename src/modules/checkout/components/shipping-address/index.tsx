import { captureCheckoutContact } from "@lib/data/cart"
import useDebouncedCallback from "@lib/hooks/use-debounced-callback"
import { isValidEmail } from "@lib/util/is-valid-email"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import AddressAutocomplete from "../address-autocomplete"
import { mapKeys, pickBy } from "lodash"
import { useTranslations } from "next-intl"
import React, { useEffect, useMemo, useRef, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"

// Fields saved to the cart while the shopper types, before the form is
// submitted, so abandoned checkouts can still be followed up.
const CAPTURED_FIELDS = [
  "email",
  "shipping_address.first_name",
  "shipping_address.last_name",
]
const CAPTURE_DEBOUNCE_MS = 1000

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const t = useTranslations("Checkout.ShippingAddress")
  const tAddresses = useTranslations("Checkout.Addresses")
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  // Set once the shopper edits the form. Capturing contact details updates
  // the cart, which re-renders with a new `cart` prop; re-syncing from it
  // would overwrite whatever was typed (or trimmed) since the capture fired.
  const isEditedRef = useRef(false)

  useEffect(() => {
    if (isEditedRef.current) {
      return
    }

    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const lastCapturedRef = useRef<string | null>(null)

  const captureContact = useDebouncedCallback(
    (data: Record<string, any>) => {
      const payload: Parameters<typeof captureCheckoutContact>[0] = {}

      if (isValidEmail(data.email)) {
        payload.email = data.email.trim()
      }

      if (
        data["shipping_address.first_name"]?.trim() ||
        data["shipping_address.last_name"]?.trim()
      ) {
        // The whole address is sent because Medusa replaces it on update.
        const address = mapKeys(
          pickBy(data, (_, key) => key.startsWith("shipping_address.")),
          (_, key) => key.replace("shipping_address.", "")
        )

        // An empty or out-of-region country would make Medusa reject the update.
        if (!countriesInRegion?.includes(address.country_code)) {
          delete address.country_code
        }

        payload.shipping_address = address
      }

      if (!payload.email && !payload.shipping_address) {
        return
      }

      const key = JSON.stringify(payload)

      if (key === lastCapturedRef.current) {
        return
      }

      lastCapturedRef.current = key
      captureCheckoutContact(payload)
    },
    CAPTURE_DEBOUNCE_MS
  )

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const nextFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    }

    isEditedRef.current = true
    setFormData(nextFormData)

    if (CAPTURED_FIELDS.includes(e.target.name)) {
      captureContact(nextFormData)
    }
  }

  return (
    <div className="[&_label]:!mb-1.5 [&_label]:!text-sm [&_label]:!font-medium [&_input]:!h-12 [&_input]:!rounded-lg [&_input]:!border-ui-border-strong [&_input]:!px-3.5 [&_input]:!text-base [&_input:focus]:!border-ui-fg-base [&_input:focus]:!ring-1 [&_input:focus]:!ring-ui-fg-base [&_.rounded-md]:!rounded-lg [&_select]:!h-12">
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 rounded-xl p-5">
          <p className="text-small-regular">
            {t("savedAddressesPrompt", { name: customer.first_name ?? "" })}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <h3 className="mb-4 text-base-semi text-ui-fg-base">
        {tAddresses("contact")}
      </h3>
      <div className="grid gap-x-4 gap-y-0 md:grid-cols-2">
          <Input
            label={t("email")}
            name="email"
            type="email"
            title={t("emailTitle")}
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => captureContact.flush()}
            required
            data-testid="shipping-email-input"
          />
          <Input
            label={t("phone")}
            name="shipping_address.phone"
            autoComplete="tel"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            data-testid="shipping-phone-input"
          />
      </div>

      <div className="mt-2 grid gap-x-4 gap-y-0 border-t border-ui-border-base pt-6 md:grid-cols-2">
        <Input
          label={t("firstName")}
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          onBlur={() => captureContact.flush()}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label={t("lastName")}
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          onBlur={() => captureContact.flush()}
          required
          data-testid="shipping-last-name-input"
        />
        <div className="md:col-span-2">
        <AddressAutocomplete
          label={t("address")}
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
          onAddressSelect={(address) => {
            isEditedRef.current = true
            setFormData((prev) => ({
              ...prev,
              "shipping_address.address_1": address.address_1,
              "shipping_address.city": address.city,
              "shipping_address.postal_code": address.postal_code,
              "shipping_address.province": address.province,
              "shipping_address.country_code": address.country_code,
            }))
          }}
        />
        </div>
        <Input
          label={t("postalCode")}
          name="shipping_address.postal_code"
          autoComplete="postal-code"
          value={formData["shipping_address.postal_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-postal-code-input"
        />
        <Input
          label={t("city")}
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <CountrySelect
          label="Country"
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />
        <Input
          label={t("stateProvince")}
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />
        <div className="md:col-span-2">
        <Input
          label={t("company")}
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
        </div>
      </div>
      <div className="mb-2 mt-1 rounded-xl bg-ui-bg-subtle px-4 py-3">
        <Checkbox
          label={t("billingSameAsShipping")}
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
    </div>
  )
}

export default ShippingAddress
