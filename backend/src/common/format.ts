import env from '@/config/env.config'

const getLocale = () => {
  switch (env.DEFAULT_LANGUAGE) {
    case 'fr':
      return 'fr-FR'
    case 'es':
      return 'es-ES'
    default:
      return 'en-US'
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

  return new Intl.DateTimeFormat(getLocale(), options ?? { year: 'numeric', month: 'short', day: '2-digit' }).format(date)
}
