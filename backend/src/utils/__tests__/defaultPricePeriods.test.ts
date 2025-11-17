import { describe, expect, it } from 'vitest'
import generateDefaultPricePeriods from '@/utils/defaultPricePeriods'

const reasons = {
  EID_AL_FITR: 'Aïd el-Fitr',
  EID_AL_ADHA: 'Aïd el-Adha',
  SUMMER: 'Été',
  YEAR_END: 'Fin d’année',
}

describe('generateDefaultPricePeriods', () => {
  it('creates sorted periods for the current and next year, including 2026 overrides', () => {
    const result = generateDefaultPricePeriods({
      basePrice: 100,
      reasons,
      referenceDate: new Date(2025, 0, 1),
    })

    expect(result).toHaveLength(18)
    expect(result[0].startDate.getFullYear()).toBe(2025)
    expect(result[result.length - 1].startDate.getFullYear()).toBe(2026)

    const eidFitr2026 = result.find(
      (period) => period.reason === reasons.EID_AL_FITR && period.startDate.getFullYear() === 2026,
    )
    expect(eidFitr2026?.startDate.getMonth()).toBe(2)
    expect(eidFitr2026?.startDate.getDate()).toBe(15)

    const eidAdha2026 = result.find(
      (period) => period.reason === reasons.EID_AL_ADHA && period.startDate.getFullYear() === 2026,
    )
    expect(eidAdha2026?.startDate.getMonth()).toBe(4)
    expect(eidAdha2026?.startDate.getDate()).toBe(20)
    expect(eidAdha2026?.endDate.getDate()).toBe(30)
  })

  it('filters past periods and keeps the remaining ones sorted chronologically', () => {
    const referenceDate = new Date(2025, 6, 1)
    const result = generateDefaultPricePeriods({
      basePrice: 100,
      reasons,
      referenceDate,
    })

    expect(result.length).toBeLessThan(18)
    expect(result.every((period) => period.endDate.getTime() >= referenceDate.getTime())).toBe(true)

    result.forEach((period, index) => {
      if (index === 0) return
      expect(period.startDate.getTime()).toBeGreaterThanOrEqual(result[index - 1].startDate.getTime())
    })
  })
})
