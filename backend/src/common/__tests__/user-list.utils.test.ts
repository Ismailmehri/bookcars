import { describe, expect, it } from 'vitest'
import * as bookcarsTypes from ':bookcars-types'
import {
  formatDateTime,
  getCreatedAtValue,
  getLastLoginValue,
  normalizeUsersResult,
  safeGet,
} from '../user-list.utils'

describe('formatDateTime', () => {
  it('returns fallback for undefined or invalid values', () => {
    expect(formatDateTime(undefined)).toBe('—')
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  it('formats valid ISO strings using fr-FR locale', () => {
    const value = '2024-01-20T15:45:00Z'
    const expected = new Date(value).toLocaleString('fr-FR')

    expect(formatDateTime(value)).toBe(expected)
  })
})

describe('safeGet', () => {
  it('returns the first defined value', () => {
    expect(safeGet(undefined, null, 'value', 'other')).toBe('value')
  })

  it('returns undefined when all values are empty', () => {
    expect(safeGet(null, undefined)).toBeUndefined()
  })
})

describe('date getters', () => {
  it('extracts createdAt variants safely', () => {
    const user = {
      _id: 'user-1',
      fullName: 'Test',
      audit: { createdAt: '2024-02-01T09:00:00Z' },
    } as bookcarsTypes.User

    expect(getCreatedAtValue(user)).toBe('2024-02-01T09:00:00Z')
  })

  it('extracts lastLogin variants safely', () => {
    const user = {
      _id: 'user-2',
      fullName: 'Test',
      stats: { lastLoginAt: '2024-02-10T09:00:00Z' },
    } as bookcarsTypes.User

    expect(getLastLoginValue(user)).toBe('2024-02-10T09:00:00Z')
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
