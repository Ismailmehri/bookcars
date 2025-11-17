export type DefaultPeriodReasonKey = 'EID_AL_FITR' | 'EID_AL_ADHA' | 'SUMMER' | 'YEAR_END'

export type DefaultPeriodReasons = Record<DefaultPeriodReasonKey, string>

export interface GeneratedPricePeriod {
  startDate: Date
  endDate: Date
  dailyPrice: number
  reason?: string
}

type PeriodTemplateKey =
  | 'EARLY_YEAR'
  | 'EID_AL_FITR'
  | 'SPRING'
  | 'EID_AL_ADHA'
  | 'EARLY_SUMMER'
  | 'PEAK_SUMMER'
  | 'SEPTEMBER'
  | 'AUTUMN'
  | 'YEAR_END'

interface PeriodTemplate {
  key: PeriodTemplateKey
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  priceDelta: number
  reasonKey?: DefaultPeriodReasonKey
}

interface PeriodOverride {
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
}

const PERIOD_TEMPLATES: PeriodTemplate[] = [
  { key: 'EARLY_YEAR', startMonth: 0, startDay: 2, endMonth: 2, endDay: 15, priceDelta: 0 },
  {
    key: 'EID_AL_FITR',
    startMonth: 2,
    startDay: 16,
    endMonth: 2,
    endDay: 25,
    priceDelta: 50,
    reasonKey: 'EID_AL_FITR',
  },
  { key: 'SPRING', startMonth: 2, startDay: 26, endMonth: 4, endDay: 20, priceDelta: 0 },
  {
    key: 'EID_AL_ADHA',
    startMonth: 4,
    startDay: 21,
    endMonth: 4,
    endDay: 31,
    priceDelta: 50,
    reasonKey: 'EID_AL_ADHA',
  },
  {
    key: 'EARLY_SUMMER',
    startMonth: 5,
    startDay: 1,
    endMonth: 5,
    endDay: 30,
    priceDelta: 50,
    reasonKey: 'SUMMER',
  },
  {
    key: 'PEAK_SUMMER',
    startMonth: 6,
    startDay: 1,
    endMonth: 7,
    endDay: 31,
    priceDelta: 80,
    reasonKey: 'SUMMER',
  },
  { key: 'SEPTEMBER', startMonth: 8, startDay: 1, endMonth: 8, endDay: 30, priceDelta: 50 },
  { key: 'AUTUMN', startMonth: 9, startDay: 1, endMonth: 11, endDay: 15, priceDelta: 0 },
  {
    key: 'YEAR_END',
    startMonth: 11,
    startDay: 15,
    endMonth: 0,
    endDay: 1,
    priceDelta: 50,
    reasonKey: 'YEAR_END',
  },
]

const PERIOD_OVERRIDES: Record<number, Partial<Record<PeriodTemplateKey, PeriodOverride>>> = {
  2026: {
    EID_AL_FITR: { startMonth: 2, startDay: 15, endMonth: 2, endDay: 25 },
    EID_AL_ADHA: { startMonth: 4, startDay: 20, endMonth: 4, endDay: 30 },
  },
}

const YEARS_IN_ADVANCE = 1

const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const generateDefaultPricePeriods = ({
  basePrice,
  reasons,
  referenceDate = new Date(),
}: {
  basePrice: number
  reasons: DefaultPeriodReasons
  referenceDate?: Date
}): GeneratedPricePeriod[] => {
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return []
  }

  const startYear = referenceDate.getFullYear()
  const endYear = startYear + YEARS_IN_ADVANCE
  const cutoffDate = normalizeDate(referenceDate)

  const periods: GeneratedPricePeriod[] = []

  for (let year = startYear; year <= endYear; year += 1) {
    PERIOD_TEMPLATES.forEach((template) => {
      const override = PERIOD_OVERRIDES[year]?.[template.key]
      const startMonth = override?.startMonth ?? template.startMonth
      const startDay = override?.startDay ?? template.startDay
      const endMonth = override?.endMonth ?? template.endMonth
      const endDay = override?.endDay ?? template.endDay

      const startDate = new Date(year, startMonth, startDay)
      const endDate = new Date(year + (endMonth < startMonth ? 1 : 0), endMonth, endDay)

      periods.push({
        startDate,
        endDate,
        dailyPrice: basePrice + template.priceDelta,
        reason: template.reasonKey ? reasons[template.reasonKey] : undefined,
      })
    })
  }

  return periods
    .filter((period) => period.endDate.getTime() >= cutoffDate.getTime())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

export default generateDefaultPricePeriods
