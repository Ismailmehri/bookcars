import { afterEach, describe, expect, it } from 'vitest'
import env from '@/config/env.config'
import { formatDateTime } from '@/common/format'

describe('format helpers', () => {
  const originalLanguage = env.DEFAULT_LANGUAGE

  afterEach(() => {
    env.DEFAULT_LANGUAGE = originalLanguage
  })

  it('formats dates using dd/MM/yyyy regardless of configured language', () => {
    const value = new Date(Date.UTC(2024, 5, 1, 12, 0, 0))

    env.DEFAULT_LANGUAGE = 'fr'
    expect(formatDateTime(value, { timeZone: 'UTC' })).toBe('01/06/2024')

    env.DEFAULT_LANGUAGE = 'en'
    expect(formatDateTime(value, { timeZone: 'UTC' })).toBe('01/06/2024')

    env.DEFAULT_LANGUAGE = 'es'
    expect(formatDateTime(value, { timeZone: 'UTC' })).toBe('01/06/2024')
  })

  it('merges provided options while keeping the dd/MM/yyyy ordering', () => {
    env.DEFAULT_LANGUAGE = 'fr'

    const value = new Date(Date.UTC(2024, 8, 15, 16, 45, 0))
    const formatted = formatDateTime(value, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })

    expect(formatted).toContain('15/09/2024')
    expect(formatted).toMatch(/15\/09\/2024.*16:45|16:45.*15\/09\/2024/)
  })
})
