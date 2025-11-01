import { describe, it, expect } from '@jest/globals'
import { parsePositiveInt } from '../../src/common/numberHelper'

describe('parsePositiveInt', () => {
  it('returns default when value is undefined', () => {
    expect(parsePositiveInt(undefined, 5)).toBe(5)
  })

  it('returns default when value is NaN', () => {
    expect(parsePositiveInt(Number.NaN, 3)).toBe(3)
  })

  it('returns default when value is less than 1', () => {
    expect(parsePositiveInt(0, 2)).toBe(2)
  })

  it('parses string values', () => {
    expect(parsePositiveInt('7', 1)).toBe(7)
  })

  it('floors numeric values', () => {
    expect(parsePositiveInt(4.7, 1)).toBe(4)
  })

  it('throws when default value is invalid', () => {
    expect(() => parsePositiveInt(2, 0)).toThrow('defaultValue must be a positive integer')
  })
})
