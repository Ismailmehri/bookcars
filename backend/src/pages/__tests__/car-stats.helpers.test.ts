import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import {
  averagePriceAcrossCategories,
  computeTrendPercentage,
  sumBookingRevenue,
  sumBookingCount,
} from '../car-stats.helpers'

describe('car-stats helpers', () => {
  it('computes trend percentage between the last two values', () => {
    expect(computeTrendPercentage([10, 15, 30])).toBe(100)
    expect(computeTrendPercentage([50, 25])).toBe(-50)
    expect(computeTrendPercentage([0, 0])).toBe(0)
  })

  it('returns null trend when insufficient data', () => {
    expect(computeTrendPercentage([])).toBeNull()
    expect(computeTrendPercentage([42])).toBeNull()
    expect(computeTrendPercentage([Number.NaN, 5])).toBeNull()
  })

  it('sums booking revenue safely', () => {
    const bookingStats: bookcarsTypes.BookingStat[] = [
      { status: bookcarsTypes.BookingStatus.Paid, count: 3, totalPrice: 1200 },
      { status: bookcarsTypes.BookingStatus.Deposit, count: 2, totalPrice: 300.5 },
      { status: bookcarsTypes.BookingStatus.Reserved, count: 1, totalPrice: Number.NaN },
    ]

    expect(sumBookingRevenue(bookingStats)).toBeCloseTo(1500.5)
  })

  it('sums booking counts safely', () => {
    const bookingStats: bookcarsTypes.BookingStat[] = [
      { status: bookcarsTypes.BookingStatus.Paid, count: 3, totalPrice: 0 },
      { status: bookcarsTypes.BookingStatus.Deposit, count: 2, totalPrice: 0 },
      { status: bookcarsTypes.BookingStatus.Reserved, count: Number.NaN, totalPrice: 0 },
    ]

    expect(sumBookingCount(bookingStats)).toBe(5)
  })

  it('computes average price across categories', () => {
    const prices: bookcarsTypes.AgencyAveragePriceByCategory[] = [
      { category: bookcarsTypes.CarRange.Mini, averageDailyPrice: 50, averageMonthlyPrice: 1200 },
      { category: bookcarsTypes.CarRange.Midi, averageDailyPrice: 60, averageMonthlyPrice: 1500 },
    ]

    expect(averagePriceAcrossCategories(prices, 'averageDailyPrice')).toBe(55)
    expect(averagePriceAcrossCategories(prices, 'averageMonthlyPrice')).toBe(1350)
  })
})
