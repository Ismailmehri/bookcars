import { Request, Response } from 'express'
import Subscription from '../models/Subscription'
import * as bookcarsTypes from ':bookcars-types'
import * as logger from '../common/logger'

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
