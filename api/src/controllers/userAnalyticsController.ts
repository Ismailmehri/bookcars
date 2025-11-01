import mongoose from 'mongoose'
import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import * as authHelper from '../common/authHelper'
import * as helper from '../common/helper'
import * as logger from '../common/logger'
import i18n from '../lang/i18n'
import User from '../models/User'
import Booking from '../models/Booking'
import type * as env from '../config/env.config'
import { computeUsersKpi, UsersKpiInput } from '../services/usersKpiService'

const buildAgencyFilter = async (
  agencyId: string,
): Promise<mongoose.FilterQuery<env.User>> => {
  const supplierId = new mongoose.Types.ObjectId(agencyId)
  const bookingDriverIds = await Booking.distinct('driver', { supplier: supplierId })

  const driverObjectIds = bookingDriverIds
    .map((value) => {
      if (value instanceof mongoose.Types.ObjectId) {
        return value
      }
      if (typeof value === 'string' && helper.isValidObjectId(value)) {
        return new mongoose.Types.ObjectId(value)
      }
      return undefined
    })
    .filter((value): value is mongoose.Types.ObjectId => value !== undefined)

  const orConditions: mongoose.FilterQuery<env.User>[] = [
    { _id: supplierId },
    { supplier: supplierId },
  ]

  if (driverObjectIds.length > 0) {
    orConditions.push({ _id: { $in: driverObjectIds } })
  }

  return {
    expireAt: null,
    $or: orConditions,
  }
}

export const getUsersKpi = async (req: Request, res: Response) => {
  try {
    const scopeParam = typeof req.query.scope === 'string' ? req.query.scope : undefined

    if (scopeParam !== 'platform' && scopeParam !== 'agency') {
      return res.status(400).send('Invalid scope')
    }

    const scope = scopeParam

    const session = await authHelper.getSessionData(req)
    const currentUser = await User.findById(session.id)

    if (!currentUser) {
      return res.sendStatus(401)
    }

    const isAdmin = currentUser.type === bookcarsTypes.UserType.Admin
    const isSupplier = currentUser.type === bookcarsTypes.UserType.Supplier

    if (scope === 'platform' && !isAdmin) {
      return res.sendStatus(403)
    }

    if (scope === 'agency' && !isSupplier && !isAdmin) {
      return res.sendStatus(403)
    }

    let filter: mongoose.FilterQuery<env.User> = { expireAt: null }

    if (scope === 'agency') {
      const fallbackAgencyId = isSupplier ? currentUser._id?.toString() : undefined
      const agencyId = typeof req.query.agencyId === 'string' ? req.query.agencyId : fallbackAgencyId

      if (!agencyId || !helper.isValidObjectId(agencyId)) {
        return res.status(400).send('Invalid agency id')
      }

      filter = await buildAgencyFilter(agencyId)
    }

    const users = await User.find(filter, {
      type: 1,
      active: 1,
      reviews: 1,
      createdAt: 1,
    }).lean<UsersKpiInput>()

    const metrics = computeUsersKpi(Array.isArray(users) ? users : [])

    return res.json(metrics)
  } catch (err) {
    logger.error('[userAnalytics.getUsersKpi] Unexpected error', err)
    return res.status(500).send(i18n.t('DB_ERROR'))
  }
}

export default { getUsersKpi }
