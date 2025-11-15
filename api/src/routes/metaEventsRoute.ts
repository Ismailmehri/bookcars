import express from 'express'
import type { Request, Response } from 'express'
import { sendMetaEvent, MetaConversionsError } from '../services/metaConversionsService'
import { ZodError, type MetaEventPayload } from '../utils/validation'
import * as logger from '../common/logger'

const routes = express.Router()

routes.post('/api/meta/events', async (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as MetaEventPayload
    const userData = { ...(body.userData || {}) }

    if (!userData.ip && req.clientIp) {
      userData.ip = req.clientIp
    }
    if (!userData.userAgent && req.clientUserAgent) {
      userData.userAgent = req.clientUserAgent
    }

    const payload: MetaEventPayload = {
      ...body,
      userData,
    }

    const metaResponse = await sendMetaEvent(payload)
    return res.json({ success: true, meta_response: metaResponse })
  } catch (error) {
    if (error instanceof MetaConversionsError) {
      logger.error(`[metaEventsRoute] ${error.message}`)
      return res.status(error.statusCode).json({ success: false, error: error.message })
    }
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message || 'Invalid payload'
      logger.error(`[metaEventsRoute] ${message}`)
      return res.status(400).json({ success: false, error: message })
    }
    logger.error('[metaEventsRoute] Unexpected error', error)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default routes
