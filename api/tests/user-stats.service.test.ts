import 'dotenv/config'
import { describe, expect, it, jest } from '@jest/globals'
import * as bookcarsTypes from ':bookcars-types'
import { __private, getUsersStats } from '../src/services/userStatsService'

describe('userStatsService', () => {
  it('calculates growth with zero previous values', () => {
    expect(__private.calculateGrowth(0, 0)).toBe(0)
    expect(__private.calculateGrowth(5, 0)).toBe(100)
  })

  it('rounds metrics to two decimals', () => {
    const metric = __private.buildMetric(15, 10)
    expect(metric.current).toBe(15)
    expect(metric.previous).toBe(10)
    expect(metric.growth).toBeCloseTo(50)
  })

  it('returns expected filters for role specific queries', () => {
    const start = new Date('2024-05-01T00:00:00.000Z')
    const end = new Date('2024-06-01T00:00:00.000Z')

    const filter = __private.buildFilter(start, end, bookcarsTypes.UserType.Supplier)
    const createdAtFilter = filter.createdAt as Record<string, Date>

    expect(filter.type).toBe(bookcarsTypes.UserType.Supplier)
    expect(filter.expireAt).toBeNull()
    expect(createdAtFilter.$gte).toEqual(start)
    expect(createdAtFilter.$lt).toEqual(end)
  })

  it('computes stats using injected countDocuments implementation', async () => {
    const counts = [12, 5, 3, 4, 3, 1, 8, 5, 3]
    const countDocuments = jest.fn().mockImplementation(async () => counts.shift() ?? 0)

    const stats = await getUsersStats({ countDocuments } as any, new Date('2024-05-15T12:00:00Z'))

    expect(countDocuments).toHaveBeenCalledTimes(9)
    expect(stats.totalUsers).toEqual({ current: 12, previous: 10, growth: 20 })
    expect(stats.suppliers).toEqual({ current: 4, previous: 2, growth: 100 })
    expect(stats.clients).toEqual({ current: 8, previous: 6, growth: 33.33 })
  })
})
