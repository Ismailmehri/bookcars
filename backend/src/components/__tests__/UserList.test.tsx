import { describe, expect, it } from 'vitest'

import { formatLastLoginValue } from '../UserList'

import { strings } from '@/lang/user-list'

describe('formatLastLoginValue', () => {
  it('returns fallback when value is missing', () => {
    expect(formatLastLoginValue(undefined)).toBe(strings.NEVER_LOGGED_IN)
    expect(formatLastLoginValue(null)).toBe(strings.NEVER_LOGGED_IN)
  })

  it('returns fallback when value is invalid', () => {
    expect(formatLastLoginValue('not-a-date')).toBe(strings.NEVER_LOGGED_IN)
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
