import * as bookcarsTypes from ':bookcars-types'

type NullableDate = Date | string | number | null | undefined

export const safeGet = <T,>(...values: Array<T | null | undefined>): T | undefined => {
  for (const value of values) {
    if (value !== null && typeof value !== 'undefined') {
      return value
    }
  }
  return undefined
}

const toDate = (value: NullableDate): Date | null => {
  if (!value && value !== 0) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

export const formatDateTime = (value?: NullableDate) => {
  const date = toDate(value ?? null)
  if (!date) {
    return '—'
  }

  return date.toLocaleString('fr-FR')
}

type UserLike = bookcarsTypes.User & {
  lastLogin?: NullableDate
  lastLoginDate?: NullableDate
  auth?: { lastLoginAt?: NullableDate } | null
  stats?: { lastLoginAt?: NullableDate } | null
  created?: NullableDate
  creationDate?: NullableDate
  created_at?: NullableDate
  audit?: { createdAt?: NullableDate } | null
  meta?: { createdAt?: NullableDate } | null
}

export const getLastLoginValue = (user: UserLike) =>
  safeGet<NullableDate>(
    user?.lastLoginAt,
    user?.lastLogin,
    user?.lastLoginDate,
    user?.auth?.lastLoginAt,
    user?.stats?.lastLoginAt,
  ) ?? null

export const getCreatedAtValue = (user: UserLike) =>
  safeGet<NullableDate>(
    user?.createdAt,
    user?.creationDate,
    user?.created_at,
    user?.created,
    user?.audit?.createdAt,
    user?.meta?.createdAt,
  ) ?? null

const mapUserRecord = (user: UserLike): bookcarsTypes.User => ({
  ...user,
  lastLoginAt: getLastLoginValue(user),
  createdAt: getCreatedAtValue(user),
})

export const normalizeUsersResult = (
  response: bookcarsTypes.Result<bookcarsTypes.User>,
): { rows: bookcarsTypes.User[]; totalRecords: number } => {
  if (Array.isArray(response) && response.length > 0 && response[0]) {
    const [rawResult] = response as [bookcarsTypes.ResultData<bookcarsTypes.User>]

    const rows = Array.isArray(rawResult.resultData)
      ? rawResult.resultData.map((user) => mapUserRecord(user as UserLike))
      : []

    const pageInfo = rawResult.pageInfo as
      | { totalRecords?: number }
      | Array<{ totalRecords?: number }>
      | undefined

    if (Array.isArray(pageInfo)) {
      const firstEntry = pageInfo[0]
      return {
        rows,
        totalRecords:
          firstEntry && typeof firstEntry.totalRecords === 'number' ? firstEntry.totalRecords : 0,
      }
    }

    return {
      rows,
      totalRecords:
        pageInfo && typeof pageInfo.totalRecords === 'number' ? pageInfo.totalRecords : 0,
    }
  }

  return { rows: [], totalRecords: 0 }
}

export const getDateTimestamp = (value?: NullableDate) => {
  const date = toDate(value ?? null)
  if (!date) {
    return 0
  }
  return date.getTime()
}
