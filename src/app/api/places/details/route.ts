import { NextRequest, NextResponse } from "next/server"

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const REFFERER = process.env.NEXT_PUBLIC_BASE_URL!!
export async function POST(request: NextRequest) {
  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key is not configured" },
      { status: 500 }
    )
  }

  try {
    const { placeId } = await request.json()

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "addressComponents,formattedAddress,shortFormattedAddress",
          Referer: REFFERER,
        },
      }
    )

    if (!response.ok) {
      console.error("Google Place Details API error:", response.statusText)
      return NextResponse.json(
        { error: "Failed to fetch place details" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const components = data.addressComponents || []

    const getComponent = (type: string): string => {
      const comp = components.find((c: any) => c.types?.includes(type))
      return comp?.longText || ""
    }

    const getComponentShort = (type: string): string => {
      const comp = components.find((c: any) => c.types?.includes(type))
      return comp?.shortText || ""
    }

    const streetNumber = getComponent("street_number")
    const route = getComponent("route")
    const address1 = [streetNumber, route].filter(Boolean).join(" ")

    return NextResponse.json({
      address_1: address1 || data.shortFormattedAddress || "",
      city:
        getComponent("locality") ||
        getComponent("postal_town") ||
        getComponent("administrative_area_level_2") ||
        "",
      postal_code: getComponent("postal_code"),
      province: getComponent("administrative_area_level_1"),
      country_code: getComponentShort("country").toLowerCase(),
    })
  } catch (error) {
    console.error("Place Details API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
