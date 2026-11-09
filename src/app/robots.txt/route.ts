import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") ?? ""
  const protocol = request.headers.get("x-forwarded-proto") ?? "https"
  const sitemapUrl = `${protocol}://${host}/sitemap_index.xml`

  const content = `User-agent: *
Allow: /
Disallow: /checkout
Disallow: /account/
Disallow: /cart/
Disallow: /order/
Disallow: /track-my-order/
Disallow: /wishlist/
Disallow: /*?sortBy=*
Disallow: /*?page=*
Disallow: /*?*size=*
Disallow: /*?*gender=*
Disallow: /*?*&sortBy=*
Disallow: /*?*&page=*
Disallow: /*?*&size=*
Disallow: /*?*&gender=*
Sitemap: ${sitemapUrl}
`

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
