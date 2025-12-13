import { Request, Response } from 'express'
import * as env from '../config/env.config'
import { dispatchCampaign } from '../services/mailService'

const unauthorized = (res: Response) => res.status(401).json({ message: 'UNAUTHORIZED' })

export const trigger = async (req: Request, res: Response) => {
  try {
    const apiKey = req.header('x-api-key')
    if (!apiKey || !env.MARKETING_API_KEY || apiKey !== env.MARKETING_API_KEY) {
      return unauthorized(res)
    }

    const result = await dispatchCampaign()
    if (!result.sent) {
      return res.json({ message: 'NO_ELIGIBLE_RECIPIENTS', sent: 0 })
    }

    return res.json({ sent: result.sent })
  } catch (err) {
    console.error('[marketing.trigger]', err)
    return res.status(500).json({ message: 'MARKETING_TRIGGER_FAILED' })
  }
}
