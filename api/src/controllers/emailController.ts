import { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import * as authHelper from '../common/authHelper'
import User from '../models/User'
import { getEmailStats } from '../services/mailService'

const unauthorized = (res: Response) => res.status(403).json({ message: 'UNAUTHORIZED' })

export const getStats = async (req: Request, res: Response) => {
  try {
    const session = await authHelper.getSessionData(req)
    const requester = await User.findById(session.id).lean()

    if (!requester || requester.type !== bookcarsTypes.UserType.Admin) {
      return unauthorized(res)
    }

    const stats = await getEmailStats()
    return res.json(stats)
  } catch (err) {
    console.error('[email.getStats]', err)
    return res.status(500).json({ message: 'EMAIL_STATS_FAILED' })
  }
}
