import * as UserService from '@/services/UserService'

const getLocale = (language: string) => {
  switch (language) {
    case 'fr':
      return 'fr-FR'
    case 'es':
      return 'es-ES'
    default:
      return 'en-US'
  }
}

export interface CommissionAgreementViewModel {
  formattedPercent: string
  formattedDate: string
  formattedBasePrice: string
  formattedClientPrice: string
  formattedCommissionValue: string
  formattedThreshold: string
}

interface BuildCommissionAgreementParams {
  language?: string
  commissionPercent: number
  effectiveDate: Date
  monthlyThreshold: number
  basePrice?: number
}

export const buildCommissionAgreementViewModel = ({
  language = UserService.getLanguage(),
  commissionPercent,
  effectiveDate,
  monthlyThreshold,
  basePrice = 100,
}: BuildCommissionAgreementParams): CommissionAgreementViewModel => {
  const locale = getLocale(language)

  const formattedPercent = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(commissionPercent)

  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(effectiveDate)

  const formatAmount = (value: number) => {
    const normalized = Number(value.toFixed(2))
    const hasDecimals = Math.abs(normalized - Math.trunc(normalized)) > 0.001
    return `${normalized.toLocaleString(locale, {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })} DT`
  }

  const commissionValue = Number(((basePrice * commissionPercent) / 100).toFixed(2))
  const clientPrice = Number((basePrice + commissionValue).toFixed(2))

  return {
    formattedPercent,
    formattedDate,
    formattedBasePrice: formatAmount(basePrice),
    formattedClientPrice: formatAmount(clientPrice),
    formattedCommissionValue: formatAmount(commissionValue),
    formattedThreshold: formatAmount(monthlyThreshold),
  }
}
