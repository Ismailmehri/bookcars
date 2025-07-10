import { Request, Response } from 'express'
import Subscription from '../models/Subscription'
import * as bookcarsTypes from ':bookcars-types'
import * as logger from '../common/logger'
import * as authHelper from '../common/authHelper'

export const create = async (req: Request, res: Response) => {
  try {
    const data: bookcarsTypes.CreateSubscriptionPayload = req.body
    const subscription = new Subscription(data)
    await subscription.save()
    return res.sendStatus(200)
  } catch (err) {
    logger.error('[subscription.create]', err)
    return res.status(400).send('Error')
  }
}

export const getCurrent = async (req: Request, res: Response) => {
  try {
    const session = await authHelper.getSessionData(req)
    const subscription = await Subscription.findOne({ supplier: session.id })
      .sort({ endDate: -1 })
      .lean()

    if (!subscription) {
      return res.sendStatus(204)
    }

    return res.json(subscription)
  } catch (err) {
    logger.error('[subscription.getCurrent]', err)
    return res.status(400).send('Error')
  }
}
