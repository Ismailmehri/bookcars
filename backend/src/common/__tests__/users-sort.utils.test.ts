import { describe, expect, it } from 'vitest'
import type { GridSortModel } from '@mui/x-data-grid'

import {
  mapSortModelToApiSort,
  sanitizeUsersSortModel,
  sortModelsEqual,
} from '../users-sort.utils'

const defaultSort: GridSortModel = [
  { field: 'lastLoginAt', sort: 'desc' },
  { field: 'fullName', sort: 'asc' },
]

describe('sanitizeUsersSortModel', () => {
  it('returns fallback when model is empty or contains unsupported fields', () => {
    expect(sanitizeUsersSortModel([], defaultSort)).toEqual(defaultSort)
    expect(
      sanitizeUsersSortModel(
        [
          { field: 'unknown', sort: 'asc' },
          { field: 'other', sort: 'desc' },
        ],
        defaultSort,
      ),
    ).toEqual(defaultSort)
  })

  it('ensures fullName is appended when sorting by lastLoginAt only', () => {
    const sanitized = sanitizeUsersSortModel(
      [{ field: 'lastLoginAt', sort: 'desc' }],
      defaultSort,
    )

    expect(sanitized).toEqual([
      { field: 'lastLoginAt', sort: 'desc' },
      { field: 'fullName', sort: 'asc' },
    ])
  })

  it('keeps supported custom ordering intact', () => {
    const sanitized = sanitizeUsersSortModel(
      [
        { field: 'createdAt', sort: 'asc' },
        { field: 'fullName', sort: 'desc' },
      ],
      defaultSort,
    )

    expect(sanitized).toEqual([
      { field: 'createdAt', sort: 'asc' },
      { field: 'fullName', sort: 'desc' },
    ])
  })
})

describe('sortModelsEqual', () => {
  it('compares models element by element', () => {
    expect(sortModelsEqual(defaultSort, [...defaultSort])).toBe(true)
    expect(
      sortModelsEqual(defaultSort, [
        { field: 'createdAt', sort: 'asc' },
        { field: 'fullName', sort: 'asc' },
      ]),
    ).toBe(false)
  })
})

describe('mapSortModelToApiSort', () => {
  it('maps supported fields and ignores duplicates or unsupported entries', () => {
    const apiSort = mapSortModelToApiSort([
      { field: 'createdAt', sort: 'asc' },
      { field: 'createdAt', sort: 'desc' },
      { field: 'fullName', sort: 'desc' },
      { field: 'unknown', sort: 'asc' },
      { field: 'lastLoginAt', sort: undefined },
    ])

    expect(apiSort).toEqual([
      { field: 'createdAt', direction: 'asc' },
      { field: 'fullName', direction: 'desc' },
    ])
  })
})
