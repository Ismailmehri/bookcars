import { describe, expect, it } from 'vitest'
import { clampPage, paginateRows } from '../tableSimple.utils'

describe('tableSimple utils', () => {
  it('clamps negative and overflowing pages', () => {
    expect(clampPage(-1, 10, 100)).toBe(0)
    expect(clampPage(0, 10, 0)).toBe(0)
    expect(clampPage(20, 10, 95)).toBe(9)
    expect(clampPage(2, 10, 50)).toBe(2)
  })

  it('returns all rows when rowsPerPage is invalid', () => {
    const rows = [1, 2, 3]
    expect(paginateRows(rows, 0, 0)).toEqual(rows)
  })

  it('paginates rows using the provided page and size', () => {
    const rows = Array.from({ length: 25 }, (_value, index) => index)
    expect(paginateRows(rows, 0, 10)).toEqual(rows.slice(0, 10))
    expect(paginateRows(rows, 1, 10)).toEqual(rows.slice(10, 20))
    expect(paginateRows(rows, 4, 10)).toEqual(rows.slice(20, 25))
  })
})
