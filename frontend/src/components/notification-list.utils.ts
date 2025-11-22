export type NotificationsState = 'loading' | 'error' | 'empty' | 'ready'

export const getNotificationsState = (
  loading: boolean,
  totalRecords: number,
  error?: boolean,
): NotificationsState => {
  if (loading) {
    return 'loading'
  }

  if (error) {
    return 'error'
  }

  if (totalRecords === 0) {
    return 'empty'
  }

  return 'ready'
}

export const buildRangeLabel = (
  page: number,
  totalRecords: number,
  pageSize: number,
  rowsLength: number,
): string => {
  const start = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalRecords === -1 ? pageSize * page : totalRecords || rowsLength)

  return `${start}-${end}`
}
