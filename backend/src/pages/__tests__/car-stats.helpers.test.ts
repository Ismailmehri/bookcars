import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import {
  averagePriceAcrossCategories,
  formatPercentage,
  getOverdueDays,
  sumViewsByDate,
} from '../car-stats.helpers'

describe('car-stats.helpers', () => {
  it('aggregates views by date', () => {
    const input: bookcarsTypes.CarStat[] = [
      {
        _id: { car: '1', date: '2024-01-01' },
        date: '2024-01-01',
        carId: '1',
        carName: 'Model A',
        supplierId: 'supplier',
        supplierName: 'Agency',
        views: 3,
        payedViews: 1,
        organiqueViews: 2,
      },
      {
        _id: { car: '2', date: '2024-01-01' },
        date: '2024-01-01',
        carId: '2',
        carName: 'Model B',
        supplierId: 'supplier',
        supplierName: 'Agency',
        views: 2,
        payedViews: 0,
        organiqueViews: 2,
      },
      {
        _id: { car: '1', date: '2024-01-02' },
        date: '2024-01-02',
        carId: '1',
        carName: 'Model A',
        supplierId: 'supplier',
        supplierName: 'Agency',
        views: 4,
        payedViews: 3,
        organiqueViews: 1,
      },
    ]

    const result = sumViewsByDate(input)
    expect(result).toHaveLength(2)
    const firstDay = result.find((item) => item.date === '2024-01-01')
    expect(firstDay?.views).toBe(5)
    expect(firstDay?.payedViews).toBe(1)
    expect(firstDay?.organiqueViews).toBe(4)
  })

  it('formats percentage values with locale', () => {
    expect(formatPercentage(50, 'en-US')).toBe('50%')
    expect(formatPercentage(25)).toBe('25 %')
  })

  it('computes overdue days from dates', () => {
    const now = new Date('2024-02-10T00:00:00Z')
    expect(getOverdueDays('2024-02-09T00:00:00Z', now)).toBe(1)
    expect(getOverdueDays('2024-02-11T00:00:00Z', now)).toBe(0)
    expect(getOverdueDays('invalid', now)).toBe(0)
  })

  it('averages prices across categories and skips null values', () => {
    const averages: bookcarsTypes.AgencyAveragePriceByCategory[] = [
      { category: bookcarsTypes.CarRange.Mini, averageDailyPrice: 40, averageMonthlyPrice: 1100 },
      { category: bookcarsTypes.CarRange.Midi, averageDailyPrice: 50, averageMonthlyPrice: null },
      { category: bookcarsTypes.CarRange.Maxi, averageDailyPrice: 70, averageMonthlyPrice: 1500 },
    ]

    expect(averagePriceAcrossCategories(averages, 'averageDailyPrice')).toBeCloseTo(53.33, 1)
    expect(averagePriceAcrossCategories(averages, 'averageMonthlyPrice')).toBeCloseTo(1300, 5)
    expect(averagePriceAcrossCategories([], 'averageDailyPrice')).toBeNull()
    expect(
      averagePriceAcrossCategories(
        [
          { category: bookcarsTypes.CarRange.Midi, averageDailyPrice: 0, averageMonthlyPrice: null },
        ],
        'averageMonthlyPrice',
      ),
    ).toBeNull()
  })
})
