import * as bookcarsTypes from ':bookcars-types'

export const sumViewsByDate = (data: bookcarsTypes.CarStat[]): bookcarsTypes.SummedStat[] => {
  const accumulator = new Map<string, { views: number; payedViews: number; organiqueViews: number }>()

  data.forEach((item) => {
    const entry = accumulator.get(item.date) ?? { views: 0, payedViews: 0, organiqueViews: 0 }
    entry.views += item.views
    entry.payedViews += item.payedViews ?? 0
    entry.organiqueViews += item.organiqueViews ?? 0
    accumulator.set(item.date, entry)
  })

  return Array.from(accumulator.entries()).map(([date, values]) => ({
    date,
    views: values.views,
    payedViews: values.payedViews,
    organiqueViews: values.organiqueViews,
  }))
}

export const computeRate = (count: number, total: number) => (total === 0 ? 0 : Math.round((count / total) * 100))

export const formatPercentage = (value: number, locale = 'fr-FR') =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value / 100)

export const getOverdueDays = (endDate: string | Date, reference: Date = new Date()) => {
  const end = new Date(endDate)
  const diff = reference.getTime() - end.getTime()
  if (Number.isNaN(diff)) {
    return 0
  }

  return diff <= 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const averagePriceAcrossCategories = (
  data: bookcarsTypes.AgencyAveragePriceByCategory[],
  field: 'averageDailyPrice' | 'averageMonthlyPrice',
) => {
  if (!data.length) {
    return null
  }

  const values = data
    .map((item) => item[field])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

  if (!values.length) {
    return null
  }

  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

export const computeTrendPercentage = (values: number[]): number | null => {
  if (values.length < 2) {
    return null
  }

  const [previous, current] = values.slice(-2)
  if (!Number.isFinite(previous) || !Number.isFinite(current)) {
    return null
  }

  if (previous === 0) {
    if (current === 0) {
      return 0
    }

    return 100
  }

  return Math.round(((current - previous) / previous) * 100)
}

export const sumBookingRevenue = (data: bookcarsTypes.BookingStat[]) =>
  data.reduce((total, item) => total + (Number.isFinite(item.totalPrice) ? item.totalPrice : 0), 0)

export const sumBookingCount = (data: bookcarsTypes.BookingStat[]) =>
  data.reduce((total, item) => total + (Number.isFinite(item.count) ? item.count : 0), 0)
