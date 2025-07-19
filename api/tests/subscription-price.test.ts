import 'dotenv/config'
import { calculateSubscriptionFinalPrice } from '../../packages/bookcars-helper/index.ts'
import * as bookcarsTypes from ':bookcars-types'

describe('calculateSubscriptionFinalPrice', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should compute remaining credit for 31-day month', () => {
    jest.setSystemTime(new Date('2025-01-15T00:00:00Z'))
    const sub: bookcarsTypes.Subscription = {
      supplier: 's',
      plan: bookcarsTypes.SubscriptionPlan.Basic,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-01-01T00:00:00Z'),
      endDate: new Date('2025-02-01T00:00:00Z'),
      resultsCars: 3,
      sponsoredCars: 1,
    }
    const final = calculateSubscriptionFinalPrice(
      sub,
      bookcarsTypes.SubscriptionPlan.Premium,
      bookcarsTypes.SubscriptionPeriod.Monthly,
    )
    const totalDays = 31
    const remainingDays = 17
    const expected = 30 - (remainingDays / totalDays) * 10
    expect(final).toBeCloseTo(expected)
  })

  it('should compute remaining credit for 28-day month', () => {
    jest.setSystemTime(new Date('2025-02-10T00:00:00Z'))
    const sub: bookcarsTypes.Subscription = {
      supplier: 's',
      plan: bookcarsTypes.SubscriptionPlan.Basic,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-02-01T00:00:00Z'),
      endDate: new Date('2025-03-01T00:00:00Z'),
      resultsCars: 3,
      sponsoredCars: 1,
    }
    const final = calculateSubscriptionFinalPrice(
      sub,
      bookcarsTypes.SubscriptionPlan.Premium,
      bookcarsTypes.SubscriptionPeriod.Monthly,
    )
    const totalDays = 28
    const remainingDays = 20
    const expected = 30 - (remainingDays / totalDays) * 10
    expect(final).toBeCloseTo(expected)
  })
})
