export interface SupplierLinkMessageOptions {
  supplierName: string
  dailyPriceLabel?: string
  dailySuffix?: string
}

export const getSupplierProfilePath = (slug: string): string => `/search/agence/${slug}`

export const buildSupplierLinkMessage = ({
  supplierName,
  dailyPriceLabel,
  dailySuffix = '',
}: SupplierLinkMessageOptions): string => {
  const baseMessage = `Louer une voiture chez ${supplierName}`

  if (dailyPriceLabel) {
    return `${baseMessage} à partir de ${dailyPriceLabel}${dailySuffix}`
  }

  return baseMessage
}
