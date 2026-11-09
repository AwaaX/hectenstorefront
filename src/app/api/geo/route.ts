import { NextRequest, NextResponse } from "next/server"
import { IPinfoLiteWrapper } from "node-ipinfo"

const IPINFO_TOKEN = process.env.IPINFO_TOKEN
const ipinfoWrapper = IPINFO_TOKEN ? new IPinfoLiteWrapper(IPINFO_TOKEN) : null

export async function GET(request: NextRequest) {
  const ip = request.nextUrl.searchParams.get("ip")

  if (!ip) {
    return NextResponse.json({ error: "IP parameter required" }, { status: 400 })
  }

  if (!ipinfoWrapper) {
    return NextResponse.json(
      { error: "Geolocation service not configured" },
      { status: 503 }
    )
  }

  try {
    const geoInfo = await ipinfoWrapper.lookupIp(ip)
    if (geoInfo && "countryCode" in geoInfo && geoInfo.countryCode) {
      return NextResponse.json({ countryCode: geoInfo.countryCode })
    }
    return NextResponse.json({ countryCode: null })
  } catch (error) {
    console.error("IP geolocation failed:", error)
    return NextResponse.json(
      { error: "Failed to lookup IP" },
      { status: 500 }
    )
  }
}
