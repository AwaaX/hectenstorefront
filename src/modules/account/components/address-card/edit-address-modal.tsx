"use client"

import React, { useEffect, useState, useActionState } from "react"
import { MapPin, PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import { useTranslations } from "next-intl"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const t = useTranslations("Account.AddressForm")
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "flex h-full min-h-[220px] w-full flex-col justify-between rounded-xl border border-line bg-white transition-[border-color,box-shadow] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]",
          {
            "border-black": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col gap-y-3 p-5">
          <div className="flex items-start justify-between gap-x-3">
            <div className="flex min-w-0 flex-col">
              <Heading
                className="truncate text-left text-[15px] font-semibold text-black"
                data-testid="address-name"
              >
                {address.first_name} {address.last_name}
              </Heading>
              {address.company && (
                <Text
                  className="txt-compact-small text-secondary"
                  data-testid="address-company"
                >
                  {address.company}
                </Text>
              )}
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-black">
              <MapPin />
            </span>
          </div>
          {(address.is_default_shipping || address.is_default_billing) && (
            <div className="flex flex-wrap gap-2">
              {address.is_default_shipping && (
                <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {t("defaultShipping")}
                </span>
              )}
              {address.is_default_billing && (
                <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-black">
                  {t("defaultBilling")}
                </span>
              )}
            </div>
          )}
          <Text className="flex flex-col text-left text-[15px] leading-6 text-secondary">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
            {address.phone && <span className="mt-1">{address.phone}</span>}
          </Text>
        </div>
        <div className="flex items-center gap-x-1 border-t border-line px-3 py-2">
          <button
            className="flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-surface"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit />
            {t("edit")}
          </button>
          <button
            className="flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-red/5 hover:text-red disabled:opacity-60"
            onClick={removeAddress}
            disabled={removing}
            data-testid="address-delete-button"
          >
            {removing ? <Spinner /> : <Trash />}
            {t("remove")}
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">{t("editAddress")}</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="flex w-full flex-col">
              <div className="-mx-1 mt-4 grid max-h-[55vh] grid-cols-1 gap-y-2 overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-x-2">
                  <Input
                    label={t("firstName")}
                    name="first_name"
                    required
                    autoComplete="given-name"
                    defaultValue={address.first_name || undefined}
                    data-testid="first-name-input"
                  />
                  <Input
                    label={t("lastName")}
                    name="last_name"
                    required
                    autoComplete="family-name"
                    defaultValue={address.last_name || undefined}
                    data-testid="last-name-input"
                  />
                </div>
                <Input
                  label={t("company")}
                  name="company"
                  autoComplete="organization"
                  defaultValue={address.company || undefined}
                  data-testid="company-input"
                />
                <Input
                  label={t("address")}
                  name="address_1"
                  required
                  autoComplete="address-line1"
                  defaultValue={address.address_1 || undefined}
                  data-testid="address-1-input"
                />
                <Input
                  label={t("apartment")}
                  name="address_2"
                  autoComplete="address-line2"
                  defaultValue={address.address_2 || undefined}
                  data-testid="address-2-input"
                />
                <div className="grid grid-cols-[144px_1fr] gap-x-2">
                  <Input
                    label={t("postalCode")}
                    name="postal_code"
                    required
                    autoComplete="postal-code"
                    defaultValue={address.postal_code || undefined}
                    data-testid="postal-code-input"
                  />
                  <Input
                    label={t("city")}
                    name="city"
                    required
                    autoComplete="locality"
                    defaultValue={address.city || undefined}
                    data-testid="city-input"
                  />
                </div>
                <Input
                  label={t("provinceState")}
                  name="province"
                  autoComplete="address-level1"
                  defaultValue={address.province || undefined}
                  data-testid="state-input"
                />
                <CountrySelect
                  name="country_code"
                  region={region}
                  required
                  autoComplete="country"
                  defaultValue={address.country_code || undefined}
                  data-testid="country-select"
                />
                <Input
                  label={t("phone")}
                  name="phone"
                  autoComplete="phone"
                  defaultValue={address.phone || undefined}
                  data-testid="phone-input"
                />
              </div>
              {formState.error && (
                <div className="text-rose-500 text-small-regular py-2">
                  {formState.error}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                {t("cancel")}
              </Button>
              <SubmitButton data-testid="save-button">{t("save")}</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
