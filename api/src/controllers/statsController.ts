import { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as authHelper from '../common/authHelper'
import User from '../models/User'
import { getAgencyStats as buildAgencyStats, getAdminStats as buildAdminStats } from '../services/statsService'

const parseDate = (value: unknown, fallback: Date) => {
  if (typeof value !== 'string' || !value) {
    return fallback
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    throw new Error('INVALID_DATE')
  }

  return parsed
}

const ensureChronologicalRange = (startDate: Date, endDate: Date) => {
  if (startDate.getTime() > endDate.getTime()) {
    throw new Error('INVALID_RANGE')
  }
}

const unauthorized = (res: Response) => res.status(403).json({ message: 'UNAUTHORIZED' })

export const getAgencyStats = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params

    if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({ message: 'INVALID_SUPPLIER' })
    }

    const startDate = parseDate(req.query.start, new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))
    const endDate = parseDate(req.query.end, new Date())

    ensureChronologicalRange(startDate, endDate)

    const session = await authHelper.getSessionData(req)
    const requester = await User.findById(session.id).lean()

    if (!requester) {
      return unauthorized(res)
    }

    const isAdmin = requester.type === bookcarsTypes.UserType.Admin
    const isOwner = requester._id?.toString() === supplierId

    if (!isAdmin && !isOwner) {
      return unauthorized(res)
    }

    const stats = await buildAgencyStats(new mongoose.Types.ObjectId(supplierId), startDate, endDate)

    return res.json(stats)
  } catch (err) {
    if (err instanceof Error && (err.message === 'INVALID_DATE' || err.message === 'INVALID_RANGE')) {
      return res.status(400).json({ message: err.message })
    }

    console.error('[stats.getAgencyStats]', err)
    return res.status(500).json({ message: 'FAILED_TO_FETCH_STATS' })
  }
}

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const startDate = parseDate(req.query.start, new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))
    const endDate = parseDate(req.query.end, new Date())

    ensureChronologicalRange(startDate, endDate)

    const session = await authHelper.getSessionData(req)
    const requester = await User.findById(session.id).lean()

    if (!requester || requester.type !== bookcarsTypes.UserType.Admin) {
      return unauthorized(res)
    }

    const stats = await buildAdminStats(startDate, endDate)

    return res.json(stats)
  } catch (err) {
    if (err instanceof Error && (err.message === 'INVALID_DATE' || err.message === 'INVALID_RANGE')) {
      return res.status(400).json({ message: err.message })
    }

    console.error('[stats.getAdminStats]', err)
    return res.status(500).json({ message: 'FAILED_TO_FETCH_STATS' })
  }
}
