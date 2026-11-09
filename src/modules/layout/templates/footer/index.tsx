import { listRegions } from "@lib/data/regions"
import { getCompanyInformation } from "@lib/data/information"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "next-intl/server"
import { TbTruckDelivery } from "react-icons/tb"
import { MdOutlinePayment } from "react-icons/md"
import { FaRotateLeft, FaInstagram, FaTiktok } from "react-icons/fa6"
import { BiSupport } from "react-icons/bi"
import {
  AmexLogo,
  ApplePayLogo,
  GooglePayLogo,
  MastercardLogo,
  PayPalLogo,
  VisaLogo,
} from "@modules/common/icons/payment-logos"
import Link from "next/link"
import { RegionSelector } from "@modules/common/components/swh"
import FooterAccordionWrapper, {
  type FooterLink,
} from "@modules/layout/components/footer-accordion-wrapper"

export default async function Footer() {
  const regions = await listRegions().then((regions) => regions)
  const t = await getTranslations("Footer")
  const companyInfo = await getCompanyInformation()
  const currentYear = new Date().getFullYear()
  const usefulLinks: FooterLink[] = [
    {
      name: t("Main.Col2.link1"),
      path: "/account/wishlist",
    },
    {
      name: t("Main.Col2.link2"),
      path: "/cart",
    },
    {
      name: t("Main.Col2.link3"),
      path: "/cart",
    },
    {
      name: t("Main.Col2.link4"),
      path: "/account",
    },
    {
      name: t("Main.Col2.link5"),
      path: "/account",
    },
  ]

  const InfoLinks: FooterLink[] = [
    {
      name: t("Main.Col3.link1"),
      path: "/track-my-order",
    },
    {
      name: t("Main.Col3.link2"),
      path: "/terms-of-delivery",
    },
    {
      name: t("Main.Col3.link3"),
      path: "/return-and-refund",
    },
    {
      name: t("Main.Col3.link4"),
      path: "/general-terms-of-sale",
    },
    {
      name: t("Main.Col3.link5"),
      path: "/legal-notice",
    },
    {
      name: t("Main.Col3.link6"),
      path: "/privacy-policy",
    },
  ]

  return (
    // Footer outer container
    <footer className="w-full bg-[#f5f5f5]">
      {/* Footer top Bar */}
      <div className="w-full py-6 md:py-9">
        {/* Mobile Layout */}
        <div className="md:hidden content-container space-y-4">
          {/* Region Selector Section */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">{t("Top.SwitchText")}</p>
            <RegionSelector regions={regions} />
          </div>

          {/* Links Section */}
          <div className="space-y-3">
            <LocalizedClientLink
              href="/customer-service"
              className="block w-full py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-gray-900 font-medium text-center"
              data-testid="nav-store-link"
            >
              {t("Top.Link1")}
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/humanitarian-project"
              className="block w-full py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-gray-900 font-medium text-center"
              data-testid="nav-store-link"
            >
              {t("Top.Link2")}
            </LocalizedClientLink>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="content-container flex items-center justify-between">
            <div className="flex-1">
              <div className="relative flex items-center gap-x-6">
                <p>{t("Top.SwitchText")}</p>
                <RegionSelector regions={regions} />
              </div>
            </div>
            <div className="flex-1 text-center border-l border-r border-black px-6">
              <LocalizedClientLink
                href="/customer-service"
                className="hover:text-hoverGray cursor-pointer duration-300 underline-gap whitespace-nowrap"
                data-testid="nav-store-link"
              >
                {t("Top.Link1")}
              </LocalizedClientLink>
            </div>
            <div className="flex-1 text-end">
              <LocalizedClientLink
                href="/humanitarian-project"
                className="hover:text-hoverGray cursor-pointer duration-300 whitespace-nowrap"
                data-testid="nav-store-link"
              >
                {t("Top.Link2")}
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>

      {/* Footer second Bar */}
      <div className="w-full  py-6 border-t border-black">
        <div className="content-container grid grid-cols-2 md:grid-cols-4 md:gap-x-16">
          <div className=" font-normal flex items-center justify-center gap-[10px] group  md:border border-gray-400 p-5 md:px-7 rounded-full">
            <BiSupport className="text-2xl" />
            <p>{t("Middle.text1")}</p>
          </div>
          <div className=" font-normal flex items-center justify-center gap-[10px] group  md:border border-gray-400 p-5 md:px-7 rounded-full">
            <TbTruckDelivery className="text-2xl" />
            <p>{t("Middle.text2")}</p>
          </div>
          <div className=" font-normal flex items-center justify-center gap-[10px] group  md:border border-gray-400 p-5 md:px-7 rounded-full">
            <FaRotateLeft className="text-2xl" />
            <p>{t("Middle.text3")}</p>
          </div>
          <div className=" font-normal flex items-center justify-center gap-[10px] group  md:border border-gray-400 p-5 md:px-7 rounded-full">
            <MdOutlinePayment className="text-2xl" />
            <p>{t("Middle.text4")}</p>
          </div>
        </div>
      </div>

      {/* footer body */}
      <div className="w-full py-6 border-t border-black">
        <div className="content-container">
          <FooterAccordionWrapper
            col1Title={t("Main.Col1.text1")}
            col1Text2={t("Main.Col1.text2")}
            col1Text3={t("Main.Col1.text3")}
            col1Text4={t("Main.Col1.text4")}
            col2Title={t("Main.Col2.text1")}
            col3Title={t("Main.Col3.text1")}
            col4Title={t("Main.Col4.text1")}
            col4Text2={t("Main.Col4.text2")}
            usefulLinks={usefulLinks}
            infoLinks={InfoLinks}
            contactEmail={companyInfo?.email || "customer@thechristmasfabric.com"}
          />
        </div>
      </div>

      {/* Footer bottom Bar */}
      <div className="w-full  py-7 border-t border-black">
        <div className="content-container flex max-md:flex-col-reverse items-center justify-between max-md:gap-8  md:items-start md:justify-between ">
          <div className="flex flex-1 flex-wrap items-center gap-2 max-md:justify-center">
            <VisaLogo className="h-6 w-[38px]" />
            <MastercardLogo className="h-6 w-[38px]" />
            <AmexLogo className="h-6 w-[38px]" />
            <PayPalLogo className="h-6 w-[38px]" />
            <ApplePayLogo className="h-6 w-[38px]" />
            <GooglePayLogo className="h-6 w-[38px]" />
          </div>
          <div className="flex-1 text-center text-[14px] tracking-[0.7px]">
            {currentYear} &copy; {t("Bottom.text1")}
            <br /> {t("Bottom.text2")}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-end gap-4">
              <Link
                href={"https://www.tiktok.com/@thechristmasfabric"}
                target="_blank"
                className=" font-normal flex items-center justify-center gap-[10px] group  hover:text-hoverGray cursor-pointer duration-300"
                aria-label="Tiktok"
              >
                <FaTiktok className="text-base" />
              </Link>
              <Link
                href={"https://www.instagram.com/thechristmasfabric/"}
                target="_blank"
                className=" font-normal flex items-center justify-center gap-[10px] group  hover:text-hoverGray cursor-pointer duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="text-base" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
