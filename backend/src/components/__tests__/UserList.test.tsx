import { describe, expect, it } from 'vitest'

import * as bookcarsTypes from ':bookcars-types'

import { formatLastLoginValue, normalizeUsersResult } from '../UserList'

describe('formatLastLoginValue', () => {
  it('returns fallback when value is missing', () => {
    expect(formatLastLoginValue(undefined)).toBe('—')
    expect(formatLastLoginValue(null)).toBe('—')
  })

  it('returns fallback when value is invalid', () => {
    expect(formatLastLoginValue('not-a-date')).toBe('—')
  })

  it('formats valid dates consistently', () => {
    const input = '2024-02-01T10:30:00Z'
    const expected = new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(input))

    expect(formatLastLoginValue(input)).toBe(expected)
    expect(formatLastLoginValue(new Date(input))).toBe(expected)
  })
})

describe('normalizeUsersResult', () => {
  it('returns empty defaults when response is missing', () => {
    expect(normalizeUsersResult(undefined)).toEqual({ rows: [], totalRecords: 0 })
    expect(normalizeUsersResult(null)).toEqual({ rows: [], totalRecords: 0 })
    expect(normalizeUsersResult([])).toEqual({ rows: [], totalRecords: 0 })
  })

  it('extracts rows and total count from object pageInfo', () => {
    const user: bookcarsTypes.User = { _id: '1', fullName: 'John Doe' } as bookcarsTypes.User

    const response: bookcarsTypes.Result<bookcarsTypes.User> = [
      { pageInfo: { totalRecords: 12 }, resultData: [user] },
    ]

    expect(normalizeUsersResult(response)).toEqual({ rows: [user], totalRecords: 12 })
  })

  it('supports legacy array-based pageInfo responses', () => {
    const user: bookcarsTypes.User = { _id: '2', fullName: 'Jane Doe' } as bookcarsTypes.User

    const response: bookcarsTypes.Result<bookcarsTypes.User> = [
      { pageInfo: [{ totalRecords: 5 }], resultData: [user] } as unknown as bookcarsTypes.ResultData<bookcarsTypes.User>,
    ]

    expect(normalizeUsersResult(response)).toEqual({ rows: [user], totalRecords: 5 })
  })
})
