import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../config/env.config'
import User from '../models/User'

const getUtcMonthStart = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))

const getUtcNextMonthStart = (date: Date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0))

const calculateGrowth = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  const growth = ((current - previous) / previous) * 100

  if (Number.isFinite(growth)) {
    return growth
  }

  return 0
}

const buildMetric = (current: number, previous: number): bookcarsTypes.UsersGrowthMetric => ({
  current,
  previous,
  growth: Number.parseFloat(calculateGrowth(current, previous).toFixed(2)),
})

type CountableUserModel = Pick<typeof User, 'countDocuments'>

const buildFilter = (
  start: Date,
  end: Date,
  type?: bookcarsTypes.UserType
): mongoose.FilterQuery<env.User> => {
  const filter: mongoose.FilterQuery<env.User> = {
    expireAt: null,
    createdAt: {
      $gte: start,
      $lt: end,
    },
  }

  if (type) {
    filter.type = type
  }

  return filter
}

export const getUsersStats = async (
  userModel: CountableUserModel = User,
  referenceDate: Date = new Date()
): Promise<bookcarsTypes.UsersStatsResponse> => {
  const currentStart = getUtcMonthStart(referenceDate)
  const nextStart = getUtcNextMonthStart(referenceDate)
  const previousStart = getUtcMonthStart(new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() - 1, 1)))

  const [
    currentTotal,
    previousTotal,
    currentSuppliers,
    previousSuppliers,
    currentClients,
    previousClients,
  ] = await Promise.all([
    userModel.countDocuments(buildFilter(currentStart, nextStart)),
    userModel.countDocuments(buildFilter(previousStart, currentStart)),
    userModel.countDocuments(buildFilter(currentStart, nextStart, bookcarsTypes.UserType.Supplier)),
    userModel.countDocuments(buildFilter(previousStart, currentStart, bookcarsTypes.UserType.Supplier)),
    userModel.countDocuments(buildFilter(currentStart, nextStart, bookcarsTypes.UserType.User)),
    userModel.countDocuments(buildFilter(previousStart, currentStart, bookcarsTypes.UserType.User)),
  ])

  return {
    totalUsers: buildMetric(currentTotal, previousTotal),
    suppliers: buildMetric(currentSuppliers, previousSuppliers),
    clients: buildMetric(currentClients, previousClients),
  }
}

export const __private = {
  getUtcMonthStart,
  getUtcNextMonthStart,
  calculateGrowth,
  buildMetric,
  buildFilter,
}
