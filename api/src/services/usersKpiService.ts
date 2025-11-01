import * as bookcarsTypes from ':bookcars-types'

interface UsersKpiInput {
  type?: bookcarsTypes.UserType
  active?: boolean
  reviews?: unknown[]
  createdAt?: Date
}

const MS_IN_DAY = 24 * 60 * 60 * 1000

export const computeUsersKpi = (
  users: UsersKpiInput[],
  now: Date = new Date(),
): bookcarsTypes.UsersKpiResponse => {
  const sevenDaysAgo = new Date(now.getTime() - 7 * MS_IN_DAY)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * MS_IN_DAY)

  return users.reduce<bookcarsTypes.UsersKpiResponse>((acc, user) => {
    acc.totalUsers += 1

    if (user.type === bookcarsTypes.UserType.Admin) {
      acc.admins += 1
    } else if (user.type === bookcarsTypes.UserType.Supplier) {
      acc.agencies += 1
    } else if (user.type === bookcarsTypes.UserType.User) {
      acc.drivers += 1
      const reviewCount = Array.isArray(user.reviews) ? user.reviews.length : 0
      if (reviewCount === 0) {
        acc.withNoReviews += 1
      }
    }

    if (!user.active) {
      acc.inactive += 1
    }

    if (user.createdAt instanceof Date) {
      if (user.createdAt >= sevenDaysAgo) {
        acc.newUsers7d += 1
      }
      if (user.createdAt >= thirtyDaysAgo) {
        acc.newUsers30d += 1
      }
    }

    return acc
  }, {
    totalUsers: 0,
    admins: 0,
    agencies: 0,
    drivers: 0,
    inactive: 0,
    withNoReviews: 0,
    newUsers7d: 0,
    newUsers30d: 0,
  })
}

export type { UsersKpiInput }
