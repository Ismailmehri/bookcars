import env from '@/config/env.config'

const getLocale = () => {
  switch (env.DEFAULT_LANGUAGE) {
    case 'fr':
      return 'fr-FR'
    case 'es':
      return 'es-ES'
    case 'en':
      return 'en-GB'
    default:
      return 'fr-FR'
  }
}

const isCurrencyCode = (value: string) => /^[A-Z]{3}$/.test(value)

export const formatCurrency = (value: number | null | undefined, currency = env.CURRENCY) => {
  if (value === null || value === undefined) {
    return '—'
  }

  const locale = getLocale()
  if (isCurrencyCode(currency)) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ${currency}`
}

export const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return new Intl.NumberFormat(getLocale(), options).format(value)
}

export const formatPercentage = (value: number | null | undefined, fractionDigits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return '—'
  }

  return `${value.toFixed(fractionDigits)}%`
}

export const formatDateTime = (value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
  if (!value) {
    return '—'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const baseOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  const finalOptions = options ? { ...baseOptions, ...options } : baseOptions

  return new Intl.DateTimeFormat(getLocale(), finalOptions).format(date)
}
