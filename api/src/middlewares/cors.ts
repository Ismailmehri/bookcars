import cors from 'cors'
import * as helper from '../common/helper'
import * as env from '../config/env.config'
import * as logger from '../common/logger'

// Fonction pour normaliser les URL (supprimer "www." si présent)
const normalizeUrl = (url: string): string => helper.trimEnd(url.replace(/^https?:\/\/www\./i, 'https://'), '/')

const whitelist = [
  normalizeUrl(env.BACKEND_HOST),
  normalizeUrl(env.FRONTEND_HOST),
  normalizeUrl('https://www.plany.tn'),
]

/**
 * CORS configuration.
 *
 * @type {cors.CorsOptions}
 */
const CORS_CONFIG: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || whitelist.indexOf(helper.trimEnd(origin, '/')) !== -1) {
      callback(null, true)
    } else {
      const message = `Not allowed by CORS: ${origin}`
      logger.error(message)
      callback(new Error(message))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/**
 * CORS middleware.
 *
 * @export
 * @returns {*}
 */
export default () => cors(CORS_CONFIG)
