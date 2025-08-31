import 'dotenv/config'
import request from 'supertest'
import { jest } from '@jest/globals'
import nodemailer from 'nodemailer'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import Booking from '../src/models/Booking'
import * as bookcarsTypes from ':bookcars-types'
import PayedReviewClientCount from '../src/models/PayedReviewClientCount'
import i18n from '../src/lang/i18n'

beforeAll(() => {
  (nodemailer as any).createTransport = () => ({
    sendMail: (_opts: unknown, cb: (err: unknown, info: unknown) => void) => cb(null, true),
  })
  testHelper.initializeLogger()
})

afterEach(() => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

describe('POST /api/cron/clients/review-request', () => {
  it('should return 200 with zero emails sent when no bookings', async () => {
    const sortMock = jest.fn().mockReturnValue(Promise.resolve([]))
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock })
    jest.spyOn(Booking, 'find').mockReturnValue({ populate: populateMock } as any)

    const res = await request(app)
      .post('/api/cron/clients/review-request?maxMailSend=20&maxNotification=1')
      .set('x-api-key', env.API_SECRET_KEY)
    expect(res.statusCode).toBe(200)
    expect(res.body.emailsSent).toBe(0)
  })

  it('should send review email and increment counter', async () => {
    const now = Date.now()
    const from = new Date(now - 3 * 24 * 60 * 60 * 1000)
    const to = new Date(now - 1 * 24 * 60 * 60 * 1000)
    const client = { _id: 'u1', email: 'client@test', fullName: 'Client One', language: 'en' }
    const booking = { _id: 'b1', from, to, driver: client, status: bookcarsTypes.BookingStatus.Paid }
    const sortMock = (jest.fn() as any).mockResolvedValue([booking])
    const populateMock = (jest.fn() as any).mockReturnValue({ sort: sortMock })
    jest.spyOn(Booking, 'find').mockReturnValue({ populate: populateMock } as any)
    const counter = { count: 0, save: (jest.fn() as any).mockResolvedValue(undefined) }
    jest.spyOn(PayedReviewClientCount, 'findOne').mockResolvedValue(counter as any)

    const res = await request(app)
      .post('/api/cron/clients/review-request?maxMailSend=5&maxNotification=2')
      .set('x-api-key', env.API_SECRET_KEY)

    expect(res.statusCode).toBe(200)
    expect(res.body.emailsSent).toBe(1)
    expect(counter.count).toBe(1)
    expect(counter.save).toHaveBeenCalled()
  })

  it('should not send email when maxNotification reached', async () => {
    const now = Date.now()
    const from = new Date(now - 3 * 24 * 60 * 60 * 1000)
    const to = new Date(now - 1 * 24 * 60 * 60 * 1000)
    const client = { _id: 'u2', email: 'client2@test', fullName: 'Client Two', language: 'es' }
    const booking = { _id: 'b2', from, to, driver: client, status: bookcarsTypes.BookingStatus.Paid }
    const sortMock = (jest.fn() as any).mockResolvedValue([booking])
    const populateMock = (jest.fn() as any).mockReturnValue({ sort: sortMock })
    jest.spyOn(Booking, 'find').mockReturnValue({ populate: populateMock } as any)
    const counter = { count: 2, save: jest.fn() }
    jest.spyOn(PayedReviewClientCount, 'findOne').mockResolvedValue(counter as any)

    const res = await request(app)
      .post('/api/cron/clients/review-request?maxMailSend=5&maxNotification=2')
      .set('x-api-key', env.API_SECRET_KEY)

    expect(res.statusCode).toBe(200)
    expect(res.body.emailsSent).toBe(0)
    expect(counter.save).not.toHaveBeenCalled()
    expect(counter.count).toBe(2)
  })

  it('should return 400 for invalid maxNotification', async () => {
    const res = await request(app)
      .post('/api/cron/clients/review-request?maxNotification=0')
      .set('x-api-key', env.API_SECRET_KEY)
    expect(res.statusCode).toBe(400)
  })
})

describe('review request translations', () => {
  it('should provide strings for all locales', () => {
    ['fr', 'en', 'es'].forEach((locale) => {
      i18n.locale = locale
      expect(i18n.t('REVIEW_REQUEST_SUBJECT', { clientName: 'John' })).toContain('John')
      expect(i18n.t('REVIEW_REQUEST_BODY', { clientName: 'John', from: '1', to: '2' })).toBeTruthy()
      expect(i18n.t('GOOGLE_REVIEW_LINK')).toBeTruthy()
      expect(i18n.t('REVIEW_EMAILS_SENT', { count: 1 })).toBeTruthy()
    })
  })
})
