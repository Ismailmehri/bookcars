import { Request } from 'express'
import * as authHelper from '../src/common/authHelper'
import * as env from '../src/config/env.config'

describe('authHelper encrypt/decrypt JWT', () => {
  it('should roundtrip session data through JWT helpers', async () => {
    const payload = { id: 'user-123' }
    const token = await authHelper.encryptJWT(payload)
    const result = await authHelper.decryptJWT(token)
    expect(result).toMatchObject(payload)
  })
})

describe('authHelper host detection', () => {
  it('identifies backend requests and cookie name', () => {
    const req = {
      headers: { origin: env.BACKEND_HOST },
      signedCookies: {},
    } as unknown as Request

    expect(authHelper.isBackend(req)).toBe(true)
    expect(authHelper.isFrontend(req)).toBe(false)
    expect(authHelper.getAuthCookieName(req)).toBe(env.BACKEND_AUTH_COOKIE_NAME)
  })

  it('identifies frontend requests and cookie name', () => {
    const req = {
      headers: { origin: env.FRONTEND_HOST },
      signedCookies: {},
    } as unknown as Request

    expect(authHelper.isFrontend(req)).toBe(true)
    expect(authHelper.isBackend(req)).toBe(false)
    expect(authHelper.getAuthCookieName(req)).toBe(env.FRONTEND_AUTH_COOKIE_NAME)
  })

  it('falls back to header token for other clients', () => {
    const req = {
      headers: { host: 'mobile.app' },
      signedCookies: {},
    } as unknown as Request

    expect(authHelper.isBackend(req)).toBe(false)
    expect(authHelper.isFrontend(req)).toBe(false)
    expect(authHelper.getAuthCookieName(req)).toBe(env.X_ACCESS_TOKEN)
  })
})

describe('authHelper getSessionData', () => {
  it('reads session from backend cookie', async () => {
    const session = { id: 'abc123' }
    const token = await authHelper.encryptJWT(session)

    const req = {
      headers: { origin: env.BACKEND_HOST },
      signedCookies: { [env.BACKEND_AUTH_COOKIE_NAME]: token },
    } as unknown as Request

    await expect(authHelper.getSessionData(req)).resolves.toMatchObject(session)
  })

  it('reads session from access token header', async () => {
    const session = { id: 'header-user' }
    const token = await authHelper.encryptJWT(session, true)

    const req = {
      headers: { [env.X_ACCESS_TOKEN]: token },
      signedCookies: {},
    } as unknown as Request

    await expect(authHelper.getSessionData(req)).resolves.toMatchObject(session)
  })
})
