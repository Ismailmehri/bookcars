import * as bookcarsTypes from ':bookcars-types'
import { computeUsersKpi } from '../../src/services/usersKpiService'

describe('computeUsersKpi', () => {
  it('returns zeroed metrics when provided with an empty list', () => {
    const metrics = computeUsersKpi([], new Date('2025-02-01T00:00:00Z'))

    expect(metrics).toEqual({
      totalUsers: 0,
      admins: 0,
      agencies: 0,
      drivers: 0,
      inactive: 0,
      withNoReviews: 0,
      newUsers7d: 0,
      newUsers30d: 0,
    })
  })

  it('computes all KPI counters based on mixed user roles and activity', () => {
    const now = new Date('2025-02-01T00:00:00Z')
    const metrics = computeUsersKpi([
      {
        type: bookcarsTypes.UserType.Admin,
        active: true,
        createdAt: new Date('2024-12-01T00:00:00Z'),
        reviews: [{}, {}],
      },
      {
        type: bookcarsTypes.UserType.Supplier,
        active: false,
        createdAt: new Date('2025-01-25T00:00:00Z'),
        reviews: [],
      },
      {
        type: bookcarsTypes.UserType.User,
        active: false,
        createdAt: new Date('2025-01-30T00:00:00Z'),
        reviews: [],
      },
      {
        type: bookcarsTypes.UserType.User,
        active: true,
        createdAt: new Date('2024-10-15T00:00:00Z'),
        reviews: [{ rating: 5 }],
      },
    ], now)

    expect(metrics).toEqual({
      totalUsers: 4,
      admins: 1,
      agencies: 1,
      drivers: 2,
      inactive: 2,
      withNoReviews: 1,
      newUsers7d: 2,
      newUsers30d: 2,
    })
  })
})
