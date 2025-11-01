import { describe, expect, it } from 'vitest'

import { formatLastLoginValue } from '@/pages/Users'
import { strings as usersStrings } from '@/lang/users'
import { formatDateTime } from '@/common/format'

describe('formatLastLoginValue', () => {
  it('returns unknown label when value is nullish', () => {
    expect(formatLastLoginValue(undefined)).toBe(usersStrings.UNKNOWN)
    expect(formatLastLoginValue(null)).toBe(usersStrings.UNKNOWN)
  })

  it('formats ISO string values', () => {
    const isoString = '2024-10-15T08:30:00Z'
    expect(formatLastLoginValue(isoString)).toBe(formatDateTime(isoString))
  })

  it('formats Date instances', () => {
    const date = new Date('2024-04-02T11:45:00Z')
    expect(formatLastLoginValue(date)).toBe(formatDateTime(date))
  })

  it('returns unknown label for unsupported values', () => {
    expect(formatLastLoginValue(123)).toBe(usersStrings.UNKNOWN)
    expect(formatLastLoginValue({})).toBe(usersStrings.UNKNOWN)
  })
})
