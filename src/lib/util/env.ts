export const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:8000"
}

export const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "https://www.thechristmasfabric.com"
}
