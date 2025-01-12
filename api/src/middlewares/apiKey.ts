import { Request, Response, NextFunction } from 'express'
import * as env from '../config/env.config'

/**
 * Middleware to verify API Key.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] // Récupérer la clé API depuis les en-têtes

  if (apiKey === env.API_SECRET_KEY) {
    // Clé API valide
    next()
  } else {
    // Clé API invalide ou manquante
    res.status(401).json({ message: 'Unauthorized: Invalid or missing API Key' })
  }
}

export default apiKeyAuth
