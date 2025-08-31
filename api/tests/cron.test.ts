import 'dotenv/config'
import request from 'supertest'
import { jest } from '@jest/globals'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import Booking from '../src/models/Booking'

beforeAll(() => {
  testHelper.initializeLogger()
})

describe('POST /api/cron/clients/review-request', () => {
  it('should return 200 with zero emails sent when no bookings', async () => {
    const sortMock = jest.fn().mockReturnValue(Promise.resolve([]))
    const populateMock = jest.fn().mockReturnValue({ sort: sortMock })
    const spy = jest.spyOn(Booking, 'find') as unknown as jest.Mock
    spy.mockReturnValue({ populate: populateMock })

    const res = await request(app)
      .post('/api/cron/clients/review-request?maxMailSend=20&maxNotification=1')
      .set('x-api-key', env.API_SECRET_KEY)
    expect(res.statusCode).toBe(200)
    expect(res.body.emailsSent).toBe(0)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
