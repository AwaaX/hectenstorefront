import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Jost } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import Script from "next/script"
import "styles/styles.scss"
import { SearchModalProvider } from "@modules/search/context/search-modal-context"
import { getLocale } from "@lib/data/locale-actions"
import { getStorefrontLocales } from "@lib/util/storefront-locales"
import { normalizeLocaleToApi } from "@lib/util/locale"

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
})

// Stape Custom Loader: serves the Web GTM container from a first-party
// subdomain so ad blockers don't drop it. Same container as NEXT_PUBLIC_GTM_ID.
const STAPE_LOADER_ORIGIN = "https://load.bird.thechristmasfabric.com"
const STAPE_LOADER_SCRIPT = "5tboqsjpct.js"
const STAPE_LOADER_PARAMS =
  "3lbn=HQdNLSc8QjYiVzMnPkhJFElRXltVFQFfAAsVCRsDBhEADhEZFRANEB0AXgkcHA%3D%3D"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL())
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const locale = await getLocale()
  const formattedLocale = normalizeLocaleToApi(locale)
  const gtmEnabled = process.env.NODE_ENV !== "development" && !!gtmId

  return (
    <html lang={formattedLocale} data-mode="light">
      <head>
        {gtmEnabled && (
          <>
            <link rel="preconnect" href={STAPE_LOADER_ORIGIN} />
            <Script id="gtm-stape-loader" strategy="afterInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="${STAPE_LOADER_ORIGIN}/${STAPE_LOADER_SCRIPT}?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${STAPE_LOADER_PARAMS}');`}
            </Script>
          </>
        )}
        <link rel="preconnect" href="https://tag.goadopt.io" />
        <link rel="preconnect" href="https://disclaimer-api.goadopt.io" />
        <meta
          name="adopt-website-id"
          content="6d183e5e-44e9-4089-8a91-c0a4ff2d853a"
        />
      </head>
      <body className={jost.variable}>
        {gtmEnabled && (
          <noscript>
            <iframe
              src={`${STAPE_LOADER_ORIGIN}/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Script
          src="https://tag.goadopt.io/injector.js?website_code=6d183e5e-44e9-4089-8a91-c0a4ff2d853a"
          strategy="beforeInteractive"
          className="adopt-injector"
        />
        <main className="relative overflow-x-clip">
          {" "}
          <NextIntlClientProvider>
            <SearchModalProvider>{props.children}</SearchModalProvider>
          </NextIntlClientProvider>
        </main>
        <Script id="show-hide-header">
          {`
           let prevScrollPos = window.scrollY;
          const header = document.getElementById('header');
    
          const stickyOffset = 50;


          window.addEventListener('scroll', () => {
                const currentScrollPos = window.scrollY;

                // shadow toggle based on scroll offset
                if (currentScrollPos > stickyOffset) {
                  header?.classList.add('is-stuck');
                } else {
                  header?.classList.remove('is-stuck');
                }
          });

          

          
          `}
        </Script>
      </body>
    </html>
  )
}
