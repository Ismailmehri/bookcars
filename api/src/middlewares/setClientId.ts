import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

export const setClientId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.signedCookies.clientId) {
    const clientId = uuidv4()
    res.cookie('clientId', clientId, {
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 an
      httpOnly: true,
      signed: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  }
  next()
}
