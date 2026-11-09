import { CompanyInformation } from "@lib/data/information"

export function getCompanyInfoForTranslation(
  companyInfo: CompanyInformation | null
): Record<string, string> {
  return {
    companyName: companyInfo?.name || "Hecten",
    companyEmail: companyInfo?.email || "customer@thechristmasfabric.com",
    companyAddress: companyInfo?.address || "19 Allee de Brienne",
    companyCity: companyInfo?.city || "Toulouse",
    companyZip: companyInfo?.zip || "31000",
    companyCountry: companyInfo?.country || "France",
    companyOperatingEntity: companyInfo?.name || "SAS OVOORO",
  }
}

export function interpolateCompanyInfo(
  text: string,
  companyInfo: Record<string, string>
): string {
  let result = text
  Object.entries(companyInfo).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value)
  })
  return result
}
