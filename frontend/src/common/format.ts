const currencyFormatter = new Intl.NumberFormat('fr-TN', {
  style: 'currency',
  currency: 'TND',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('fr-TN')

export const formatCurrency = (value: number) => currencyFormatter.format(value).replace('TND', 'DT')

export const formatNumber = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)

export const formatPercentage = (value: number, fractionDigits = 0) => `${
  formatNumber(value * 100, fractionDigits)
} %`

export const formatHours = (value: number) => `${formatNumber(value, 1)} h`

export const formatDays = (value: number) => `${formatNumber(value, 0)} j`

export const formatTrend = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value, 1)} %`

export const formatDate = (value: string) => {
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return value
  }
}

export const formatLevel = (level: 'low' | 'medium' | 'high') => {
  if (level === 'low') {
    return 'Faible'
  }

  if (level === 'medium') {
    return 'Modéré'
  }

  return 'Élevé'
}

export const computeTrendDirection = (current: number, previous: number) => {
  if (current === previous) {
    return 'flat' as const
  }

  return current > previous ? ('up' as const) : ('down' as const)
}

export const computePercentageDelta = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  return ((current - previous) / previous) * 100
}

export const formatFunnelValue = (value: number) => numberFormatter.format(value)
