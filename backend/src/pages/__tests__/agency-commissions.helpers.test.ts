import { describe, expect, it } from 'vitest'
import { getDrawerSafePaddingTop } from '../agency-commissions.helpers'

describe('getDrawerSafePaddingTop', () => {
  it('returns calc expression with rounded padding for positive values', () => {
    expect(getDrawerSafePaddingTop(87.6)).toBe('calc(env(safe-area-inset-top, 0px) + 88px)')
  })

  it('returns zero padding when value is non-positive', () => {
    expect(getDrawerSafePaddingTop(0)).toBe('calc(env(safe-area-inset-top, 0px) + 0px)')
    expect(getDrawerSafePaddingTop(-10)).toBe('calc(env(safe-area-inset-top, 0px) + 0px)')
  })

  it('returns zero padding when value is not finite', () => {
    expect(getDrawerSafePaddingTop(Number.NaN)).toBe('calc(env(safe-area-inset-top, 0px) + 0px)')
    expect(getDrawerSafePaddingTop(Number.POSITIVE_INFINITY)).toBe('calc(env(safe-area-inset-top, 0px) + 0px)')
  })
})
