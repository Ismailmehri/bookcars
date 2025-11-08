import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'

type UserFilterQuery = mongoose.FilterQuery<env.User>

const parseDate = (value?: string | null) => {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return date
}

const buildBooleanArrayCondition = (
  values: boolean[] | undefined,
  field: 'verified' | 'active',
): UserFilterQuery | undefined => {
  if (!Array.isArray(values) || values.length === 0) {
    return undefined
  }

  const uniqueValues = Array.from(new Set(values))
  const hasTrue = uniqueValues.includes(true)
  const hasFalse = uniqueValues.includes(false)

  if (hasTrue && hasFalse) {
    return undefined
  }

  if (hasTrue) {
    return { [field]: true } as UserFilterQuery
  }

  if (hasFalse) {
    return {
      $or: [
        { [field]: false } as UserFilterQuery,
        { [field]: { $exists: false } } as UserFilterQuery,
      ],
    }
  }

  return undefined
}

export const createUsersFiltersConditions = (
  filters?: bookcarsTypes.UsersFiltersPayload,
): UserFilterQuery[] => {
  if (!filters) {
    return []
  }

  const conditions: UserFilterQuery[] = []

  const verificationCondition = buildBooleanArrayCondition(filters.verification, 'verified')
  if (verificationCondition) {
    conditions.push(verificationCondition)
  }

  const activityCondition = buildBooleanArrayCondition(filters.active, 'active')
  if (activityCondition) {
    conditions.push(activityCondition)
  }

  if (typeof filters.blacklisted === 'boolean') {
    conditions.push({ blacklisted: filters.blacklisted } as UserFilterQuery)
  }

  if (filters.agencyId && mongoose.Types.ObjectId.isValid(filters.agencyId)) {
    conditions.push({ supplier: new mongoose.Types.ObjectId(filters.agencyId) } as UserFilterQuery)
  }

  const fromDate = parseDate(filters.lastLoginFrom)
  const toDate = parseDate(filters.lastLoginTo)

  if (fromDate || toDate) {
    const range: Record<string, Date> = {}
    if (fromDate) {
      range.$gte = fromDate
    }
    if (toDate) {
      range.$lte = toDate
    }

    conditions.push({ lastLoginAt: range } as UserFilterQuery)
  }

  return conditions
}

export default createUsersFiltersConditions
