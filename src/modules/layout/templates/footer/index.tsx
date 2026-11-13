import { listRegions } from "@lib/data/regions"
import { getSiteBrandInformation } from "@lib/data/information"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "next-intl/server"
import Image from "next/image"
import {
  FaArrowRotateLeft,
  FaCreditCard,
  FaFaceSmile,
  FaHeart,
  FaPhone,
  FaTruckFast,
} from "react-icons/fa6"
import {
  AmexLogo,
  ApplePayLogo,
  GooglePayLogo,
  MastercardLogo,
  PayPalLogo,
  VisaLogo,
} from "@modules/common/icons/payment-logos"
import { RegionSelector } from "@modules/common/components/swh"
import NewsLetterEmail from "@modules/common/components/news-letter-email"
import FooterAccordionWrapper, {
  type FooterColumn,
} from "@modules/layout/components/footer-accordion-wrapper"

export default async function Footer() {
  const [regions, siteBrandInfo, t] = await Promise.all([
    listRegions(),
    getSiteBrandInformation(),
    getTranslations("Footer"),
  ])
  const currentYear = new Date().getFullYear()

  const reassurance = [
    { Icon: FaFaceSmile, text: t("Reassurance.service") },
    { Icon: FaTruckFast, text: t("Reassurance.shipping") },
    { Icon: FaArrowRotateLeft, text: t("Reassurance.returns") },
    { Icon: FaCreditCard, text: t("Reassurance.instalments") },
  ]

  // Only links to pages this store has; Hecten's "Our best products" and
  // "New products" have no equivalent here.
  const columns: FooterColumn[] = [
    {
      title: t("Columns.usefulLinks"),
      links: [
        { name: t("Columns.viewBasket"), path: "/cart" },
        { name: t("Columns.seeWishlist"), path: "/account/wishlist" },
        { name: t("Columns.finalizeOrder"), path: "/checkout" },
      ],
    },
    {
      title: t("Columns.help"),
      links: [
        { name: t("Columns.customerService"), path: "/customer-service" },
        { name: t("Columns.trackOrder"), path: "/track-my-order" },
      ],
    },
    {
      title: t("Columns.delivery"),
      links: [
        { name: t("Columns.termsDelivery"), path: "/terms-of-delivery" },
        { name: t("Columns.returns"), path: "/return-and-refund" },
      ],
    },
  ]

  const legalLinks = [
    { name: t("Legal.termsOfUse"), path: "/legal-notice" },
    { name: t("Legal.privacy"), path: "/privacy-policy" },
    { name: t("Legal.termsSale"), path: "/general-terms-of-sale" },
  ] as const

  return (
    <footer className="w-full font-[system-ui] text-black">
      {/* Reassurance */}
      <div className="bg-white border-t border-[#ccc]">
        <ul className="content-container grid grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,auto))] lg:justify-between gap-x-6 gap-y-8 py-10">
          {reassurance.map(({ Icon, text }) => (
            <li
              key={text}
              className="flex flex-col items-center gap-y-[6px] text-center"
            >
              <Icon aria-hidden className="text-[20px]" />
              <p className="text-[16px] leading-[24px] font-semibold">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#f8f8f8] border-t border-[#ccc]">
        {/* Newsletter + link columns */}
        <div className="content-container grid md:grid-cols-3 lg:grid-cols-[1.7fr_1fr_1fr_1fr] gap-x-10 md:gap-y-12 py-10">
          <div className="md:col-span-3 lg:col-span-1 max-md:mb-8">
            <p className="mb-[15px] text-[20.8px] leading-[31.2px] font-semibold">
              {t("NewsLetter.title")}
            </p>
            <p className="mb-[25px] text-[16px] leading-[24px]">
              {t("NewsLetter.text")}
            </p>
            <NewsLetterEmail />
          </div>
          <FooterAccordionWrapper columns={columns} />
        </div>

        {/* Brand, legal, contact, country and payments */}
        <div className="border-t border-[#ccc]">
          <div className="content-container flex flex-col-reverse lg:flex-row lg:items-end lg:justify-between gap-y-10 gap-x-10 py-10">
            <div className="flex flex-col gap-y-[18px]">
              <div>
                {siteBrandInfo?.logo && (
                  <Image
                    src={siteBrandInfo.logo}
                    alt={siteBrandInfo.name ?? "Hecten"}
                    width={156}
                    height={100}
                    className="w-[123px] h-auto"
                  />
                )}
                <p className="flex items-start gap-x-[5px] text-[13.6px] leading-[20.4px]">
                  <FaHeart aria-hidden className="shrink-0 mt-[5px] text-[11px]" />
                  {t("Legal.tagline")}
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-[10px] gap-y-2">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <LocalizedClientLink
                      href={link.path}
                      className="text-[13.6px] leading-[20.4px] underline underline-offset-[3px] hover:text-hoverGray duration-300"
                    >
                      {link.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
              <p className="text-[13.6px] leading-[20.4px]">
                &copy; 2020-{currentYear} {t("Legal.rights")}
              </p>
            </div>

            <div className="flex flex-col lg:items-end gap-y-10">
              <div className="flex flex-wrap gap-y-8">
                <div className="min-[400px]:pr-[26px] min-[400px]:mr-[26px] min-[400px]:border-r border-[#ccc]">
                  <p className="mb-[14px] text-[20.8px] leading-[31.2px] font-semibold">
                    {t("Legal.customerService")}
                  </p>
                  <LocalizedClientLink
                    href="/customer-service"
                    className="inline-flex items-center gap-x-[8px] h-[45px] px-[24px] border border-[#ccc] rounded-[6px] text-[12.96px] leading-[19.44px] hover:border-[#999] duration-300"
                  >
                    <FaPhone aria-hidden className="text-[15px]" />
                    {t("Legal.contactUs")}
                  </LocalizedClientLink>
                </div>
                <div>
                  <p className="mb-[14px] text-[20.8px] leading-[31.2px] font-semibold">
                    {t("Legal.changeCountry")}
                  </p>
                  {/* Same select as the header, at Hecten's footer height */}
                  <div className="[&_select]:h-[40px] [&_select]:min-w-[132px] [&_select]:bg-transparent [&_select]:text-[13.33px]">
                    <RegionSelector regions={regions} variant="native" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:items-end gap-y-[18px]">
                <p className="text-[20.8px] leading-[31.2px] font-semibold">
                  {t("Legal.secure")}
                </p>
                <div className="flex flex-wrap items-center gap-[12px]">
                  <VisaLogo className="h-[32px] w-[48px]" />
                  <MastercardLogo className="h-[32px] w-[48px]" />
                  <AmexLogo className="h-[32px] w-[48px]" />
                  <PayPalLogo className="h-[32px] w-[48px]" />
                  <ApplePayLogo className="h-[32px] w-[48px]" />
                  <GooglePayLogo className="h-[32px] w-[48px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
