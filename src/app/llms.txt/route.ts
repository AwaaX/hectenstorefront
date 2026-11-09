import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? "thechristmasfabric.com"
  const protocol = request.headers.get("x-forwarded-proto") ?? "https"
  const baseUrl = `${protocol}://${host}`
  const sitemapUrl = `${protocol}://${host}/sitemap_index.xml`

  const content = `# Hecten - Unique Holiday Apparel

> Hecten specializes in providing a unique range of holiday apparel, including pyjamas and original wear for Christmas and the winter season. The site focuses on delivering fun and innovative designs to help customers celebrate the festive season.

> Hecten aims to be a go-to destination for anyone looking to enhance their holiday wardrobe with stylish and cozy options, making it a perfect choice for families and individuals alike.

> Hecten is available in multiple countries: **United Kingdom**, **España**, **United States**, **Australia**, **Deutschland**, **Nederland**, **Canada**, **Svenska**, **Italia**, **Ireland**


## Main Features

- **Diverse Apparel Collection**: The website features a variety of Christmas-themed clothing options, ideal for festive celebrations.
- **User-Friendly Shopping Experience**: With a streamlined online shopping interface, customers can easily browse and purchase their favorite items.
- **Focus on Quality**: Attention to detail in fabric and design ensures customers receive high-quality products.

## Pricing Information

The main site includes pricing information within product listings, showcasing various holiday apparel options.

- **United Kingdom**: ${baseUrl}/en-gb/christmas-pyjamas/
- **United States**: ${baseUrl}/en-us/christmas-pajamas/
- **España**: ${baseUrl}/es-es/pijamas-navidenas/
- **Italia**: ${baseUrl}/it-it/pigiami-natalizi/
- **Ireland**: ${baseUrl}/en-ie/christmas-pajamas/
- **Deutschland**: ${baseUrl}/de-de/weihnachtspyjama/
- **Nederland**: ${baseUrl}/nl-nl/kerst-pyjama/
- **Svenska**: ${baseUrl}/sv-se/julpyjamas/
- **Canada**: ${baseUrl}/en-ca/christmas-pajamas/
- **Australia**: ${baseUrl}/en-au/christmas-pajamas/

## Conversion and Offers

- **Promotions**: Hecten frequently updates its offerings, ensuring customers have access to seasonal specials and discounts.

## Additional Resources

- **Sitemap**: ${sitemapUrl}
- **Contact**: customer@thechristmasfabric.com
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
