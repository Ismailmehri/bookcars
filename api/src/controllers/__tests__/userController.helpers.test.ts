import mongoose from 'mongoose'
import { createUsersFiltersConditions } from '../userController.helpers'

describe('createUsersFiltersConditions', () => {
  it('returns an empty array when filters are undefined', () => {
    expect(createUsersFiltersConditions()).toEqual([])
  })

  it('creates a condition for verified users when only true is selected', () => {
    const conditions = createUsersFiltersConditions({ verification: [true] })
    expect(conditions).toEqual([{ verified: true }])
  })

  it('creates an $or condition for unverified users when only false is selected', () => {
    const conditions = createUsersFiltersConditions({ verification: [false] })
    expect(conditions).toEqual([
      {
        $or: [
          { verified: false },
          { verified: { $exists: false } },
        ],
      },
    ])
  })

  it('ignores verification filter when both true and false are selected', () => {
    const conditions = createUsersFiltersConditions({ verification: [true, false] })
    expect(conditions).toEqual([])
  })

  it('creates a condition for inactive users', () => {
    const conditions = createUsersFiltersConditions({ active: [false] })
    expect(conditions).toEqual([
      {
        $or: [
          { active: false },
          { active: { $exists: false } },
        ],
      },
    ])
  })

  it('creates a condition for blacklisted users', () => {
    const conditions = createUsersFiltersConditions({ blacklisted: true })
    expect(conditions).toEqual([{ blacklisted: true }])
  })

  it('adds a supplier filter when agencyId is valid', () => {
    const agencyId = new mongoose.Types.ObjectId().toString()
    const conditions = createUsersFiltersConditions({ agencyId })
    expect(conditions).toHaveLength(1)
    const [condition] = conditions
    expect(condition).toHaveProperty('supplier')
    const supplierCondition = condition as { supplier: mongoose.Types.ObjectId }
    expect(supplierCondition.supplier.toString()).toBe(agencyId)
  })

  it('ignores agencyId when it is not a valid ObjectId', () => {
    const conditions = createUsersFiltersConditions({ agencyId: 'not-valid' })
    expect(conditions).toEqual([])
  })

  it('creates a lastLoginAt range when from and to dates are provided', () => {
    const from = '2024-01-01T00:00:00.000Z'
    const to = '2024-01-31T23:59:59.000Z'
    const conditions = createUsersFiltersConditions({ lastLoginFrom: from, lastLoginTo: to })
    expect(conditions).toHaveLength(1)
    const [condition] = conditions
    const range = (condition as { lastLoginAt: { $gte?: Date; $lte?: Date } }).lastLoginAt
    expect(range.$gte).toEqual(new Date(from))
    expect(range.$lte).toEqual(new Date(to))
  })

  it('ignores invalid date values', () => {
    const conditions = createUsersFiltersConditions({ lastLoginFrom: 'invalid-date' })
    expect(conditions).toEqual([])
  })

  it('combines multiple filters while preserving evaluation order', () => {
    const agencyId = new mongoose.Types.ObjectId().toString()
    const filters = {
      verification: [true],
      active: [true],
      blacklisted: false,
      agencyId,
      lastLoginFrom: '2024-01-01T00:00:00.000Z',
    }

    const conditions = createUsersFiltersConditions(filters)
    expect(conditions).toHaveLength(5)
    expect(conditions[0]).toEqual({ verified: true })
    expect(conditions[1]).toEqual({ active: true })
    expect(conditions[2]).toEqual({ blacklisted: false })
    const supplierCondition = conditions[3] as { supplier: mongoose.Types.ObjectId }
    expect(supplierCondition.supplier.toString()).toBe(agencyId)
    const lastLogin = conditions[4] as { lastLoginAt: { $gte?: Date; $lte?: Date } }
    expect(lastLogin.lastLoginAt.$gte).toEqual(new Date(filters.lastLoginFrom))
    expect(lastLogin.lastLoginAt.$lte).toBeUndefined()
  })
})
