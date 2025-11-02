import * as bookcarsTypes from ':bookcars-types'

const toDate = (value?: Date | string | null) => {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

export const formatDateTime = (value?: Date | string | null) => {
  const date = toDate(value)
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const mapUserRecord = (user: bookcarsTypes.User): bookcarsTypes.User => {
  const rawLastLogin =
    user.lastLoginAt ?? (user as { lastLogin?: Date | string | null }).lastLogin ??
    (user as { lastLoginDate?: Date | string | null }).lastLoginDate ?? null

  const rawCreatedAt =
    user.createdAt ??
    (user as { creationDate?: Date | string }).creationDate ??
    (user as { created_at?: Date | string }).created_at ??
    (user as { created?: Date | string }).created ??
    undefined

  return {
    ...user,
    lastLoginAt: rawLastLogin,
    createdAt: rawCreatedAt,
  }
}

export const normalizeUsersResult = (
  response: bookcarsTypes.Result<bookcarsTypes.User>,
): { rows: bookcarsTypes.User[]; totalRecords: number } => {
  if (Array.isArray(response) && response.length > 0 && response[0]) {
    const [rawResult] = response as [bookcarsTypes.ResultData<bookcarsTypes.User>]

    const rows = Array.isArray(rawResult.resultData)
      ? rawResult.resultData.map((user) => mapUserRecord(user))
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

export const getDateTimestamp = (value?: Date | string | null) => {
  const date = toDate(value)
  if (!date) {
    return 0
  }
  return date.getTime()
}

export const getLastLoginValue = (user: bookcarsTypes.User) =>
  user.lastLoginAt ??
  (user as { lastLogin?: Date | string | null }).lastLogin ??
  (user as { lastLoginDate?: Date | string | null }).lastLoginDate ??
  null

export const getCreatedAtValue = (user: bookcarsTypes.User) =>
  user.createdAt ??
  (user as { creationDate?: Date | string }).creationDate ??
  (user as { created_at?: Date | string }).created_at ??
  (user as { created?: Date | string }).created ??
  null
