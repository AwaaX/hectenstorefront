import { COMPANY_INFO_CACHE_TAG, SITE_BRAND_CACHE_TAG } from "@lib/constants"
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const TAGS: Record<string, string> = {
  company: COMPANY_INFO_CACHE_TAG,
  brand: SITE_BRAND_CACHE_TAG,
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 })
  }

  // Optional ?type=company|brand; revalidates both when omitted
  const type = req.nextUrl.searchParams.get("type")

  if (type && !TAGS[type]) {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 })
  }

  const tags = type ? [TAGS[type]] : Object.values(TAGS)
  tags.forEach((tag) => revalidateTag(tag))

  return NextResponse.json({ revalidated: true, tags, now: Date.now() })
}
