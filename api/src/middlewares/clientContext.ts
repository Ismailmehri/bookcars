import type { Request as ExpressRequest, Response, NextFunction } from 'express'

declare module 'express-serve-static-core' {
  interface Request {
    clientIp?: string
    clientUserAgent?: string
  }
}

const getClientIp = (req: ExpressRequest): string | undefined => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0]
  }
  return req.socket?.remoteAddress || undefined
}

const clientContext = (req: ExpressRequest, _res: Response, next: NextFunction): void => {
  req.clientIp = getClientIp(req)
  const headerUserAgent = req.headers['user-agent']
  req.clientUserAgent = typeof headerUserAgent === 'string' ? headerUserAgent : undefined
  next()
}

export default clientContext
