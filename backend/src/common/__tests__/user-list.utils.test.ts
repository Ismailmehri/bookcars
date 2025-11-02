import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import { applyListIndex, formatDateTime, normalizeUsersResult } from '../user-list.utils'

describe('formatDateTime', () => {
  it('returns fallback for undefined or invalid values', () => {
    expect(formatDateTime(undefined)).toBe('—')
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  it('formats valid ISO strings using fr-FR locale', () => {
    const value = '2024-01-20T15:45:00Z'
    const expected = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))

    expect(formatDateTime(value)).toBe(expected)
  })
})

describe('applyListIndex', () => {
  it('assigns sequential indexes based on page and size', () => {
    const rows: bookcarsTypes.User[] = [
      { _id: 'a', fullName: 'Alpha' },
      { _id: 'b', fullName: 'Beta' },
      { _id: 'c', fullName: 'Gamma' },
    ]

    const result = applyListIndex(rows, 1, 3)

    expect(result.map((row) => row.listIndex)).toEqual([4, 5, 6])
  })
})

describe('normalizeUsersResult', () => {
  it('maps legacy date fields to createdAt/lastLoginAt', () => {
    const user: bookcarsTypes.User = {
      _id: 'user-1',
      fullName: 'Test',
      lastLoginAt: undefined,
      createdAt: undefined,
    }

    const response: bookcarsTypes.Result<bookcarsTypes.User> = [
      {
        pageInfo: { totalRecords: 1 },
        resultData: [
          {
            ...user,
            lastLogin: '2024-03-03T10:00:00Z',
            creationDate: '2024-01-01T09:00:00Z',
          } as bookcarsTypes.User,
        ],
      },
    ]

    const { rows, totalRecords } = normalizeUsersResult(response)
    expect(totalRecords).toBe(1)
    expect(rows[0]?.lastLoginAt).toBe('2024-03-03T10:00:00Z')
    expect(rows[0]?.createdAt).toBe('2024-01-01T09:00:00Z')
  })
})
