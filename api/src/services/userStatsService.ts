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

  // Calculer les totaux (tous les utilisateurs actifs, pas seulement ceux créés ce mois)
  const totalFilter: mongoose.FilterQuery<env.User> = { expireAt: null }
  const supplierFilter: mongoose.FilterQuery<env.User> = { expireAt: null, type: bookcarsTypes.UserType.Supplier }
  const clientFilter: mongoose.FilterQuery<env.User> = { expireAt: null, type: bookcarsTypes.UserType.User }

  // Calculer les nouveaux utilisateurs créés ce mois vs le mois précédent (pour la croissance)
  const newUsersThisMonthFilter = buildFilter(currentStart, nextStart)
  const newUsersPreviousMonthFilter = buildFilter(previousStart, currentStart)
  const newSuppliersThisMonthFilter = buildFilter(currentStart, nextStart, bookcarsTypes.UserType.Supplier)
  const newSuppliersPreviousMonthFilter = buildFilter(previousStart, currentStart, bookcarsTypes.UserType.Supplier)
  const newClientsThisMonthFilter = buildFilter(currentStart, nextStart, bookcarsTypes.UserType.User)
  const newClientsPreviousMonthFilter = buildFilter(previousStart, currentStart, bookcarsTypes.UserType.User)

  const [
    totalUsers,
    newUsersThisMonth,
    newUsersPreviousMonth,
    totalSuppliers,
    newSuppliersThisMonth,
    newSuppliersPreviousMonth,
    totalClients,
    newClientsThisMonth,
    newClientsPreviousMonth,
  ] = await Promise.all([
    userModel.countDocuments(totalFilter),
    userModel.countDocuments(newUsersThisMonthFilter),
    userModel.countDocuments(newUsersPreviousMonthFilter),
    userModel.countDocuments(supplierFilter),
    userModel.countDocuments(newSuppliersThisMonthFilter),
    userModel.countDocuments(newSuppliersPreviousMonthFilter),
    userModel.countDocuments(clientFilter),
    userModel.countDocuments(newClientsThisMonthFilter),
    userModel.countDocuments(newClientsPreviousMonthFilter),
  ])

  // Calculer la croissance basée sur les nouveaux utilisateurs créés
  // Pour le "previous", on utilise le total actuel moins les nouveaux de ce mois plus les nouveaux du mois précédent
  return {
    totalUsers: buildMetric(totalUsers, totalUsers - newUsersThisMonth + newUsersPreviousMonth),
    suppliers: buildMetric(totalSuppliers, totalSuppliers - newSuppliersThisMonth + newSuppliersPreviousMonth),
    clients: buildMetric(totalClients, totalClients - newClientsThisMonth + newClientsPreviousMonth),
  }
}

export const __private = {
  getUtcMonthStart,
  getUtcNextMonthStart,
  calculateGrowth,
  buildMetric,
  buildFilter,
}
