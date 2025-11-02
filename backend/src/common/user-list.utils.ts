import * as bookcarsTypes from ':bookcars-types'

export const formatLastLoginValue = (value?: string | Date | null | undefined) => {
    if (!value) {
      return '—'
    }

    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) {
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

  export const normalizeUsersResult = (
    response: bookcarsTypes.Result<bookcarsTypes.User>,
  ): { rows: bookcarsTypes.User[]; totalRecords: number } => {
    if (Array.isArray(response) && response.length > 0 && response[0]) {
      const [rawResult] = response as [bookcarsTypes.ResultData<bookcarsTypes.User>]

      const rows = Array.isArray(rawResult.resultData) ? rawResult.resultData : []
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
