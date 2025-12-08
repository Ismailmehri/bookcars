import express from 'express'
import request from 'supertest'
import { jest } from '@jest/globals'

const dispatchCampaignMock = jest.fn(async () => ({ sent: 2 }))

const baseEnv = {
  BC_SMTP_HOST: '0.0.0.0',
  BC_SMTP_PORT: '1025',
  BC_SMTP_USER: 'test',
  BC_SMTP_PASS: 'test',
  BC_SMTP_FROM: 'noreply@example.com',
  MJ_SENDER_EMAIL: 'noreply@example.com',
  MJ_SENDER_NAME: 'Plany',
  EMAIL_DAILY_LIMIT: '5',
  FRONTEND_HOST: 'http://localhost:3000/',
  EMAIL_PROVIDER: 'smtp-local',
  MARKETING_API_KEY: 'expected-key',
}

const buildApp = async () => {
  const marketingRoutes = (await import('../src/routes/marketingRoutes')).default
  const app = express()
  app.use(express.json())
  app.use('/', marketingRoutes)
  return app
}

describe('marketingRoutes', () => {
  beforeEach(() => {
    jest.resetModules()
    dispatchCampaignMock.mockClear()
  })

  it('rejects requests without the correct API key', async () => {
    process.env = { ...process.env, ...baseEnv }

    await jest.unstable_mockModule('../src/services/mailService', () => ({
      __esModule: true,
      dispatchCampaign: dispatchCampaignMock,
    }))

    const app = await buildApp()
    const res = await request(app).post('/api/marketing/trigger')

    expect(res.status).toBe(401)
    expect(dispatchCampaignMock).not.toHaveBeenCalled()
  })

  it('accepts requests with the correct API key', async () => {
    process.env = { ...process.env, ...baseEnv }

    await jest.unstable_mockModule('../src/services/mailService', () => ({
      __esModule: true,
      dispatchCampaign: dispatchCampaignMock,
    }))

    const app = await buildApp()
    const res = await request(app)
      .post('/api/marketing/trigger')
      .set('x-api-key', 'expected-key')

    expect(res.status).toBe(200)
    expect(res.body.sent).toBe(2)
    expect(dispatchCampaignMock).toHaveBeenCalled()
  })
})
