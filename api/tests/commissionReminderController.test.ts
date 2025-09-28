import { jest } from '@jest/globals'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import AgencyCommissionEvent from '../src/models/AgencyCommissionEvent'
import User from '../src/models/User'
import * as env from '../src/config/env.config'
import * as authHelper from '../src/common/authHelper'
import { sendCommissionReminder } from '../src/controllers/commissionController'
import nodemailer from 'nodemailer'

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }

  return res as unknown as Response & {
    status: jest.Mock
    send: jest.Mock
    sendStatus: jest.Mock
    json: jest.Mock
  }
}

const createRequestWithToken = async (
  userId: string,
  overrides: Partial<Request> = {},
) => {
  const token = await authHelper.encryptJWT({ id: userId })
  const req = {
    headers: { [env.X_ACCESS_TOKEN]: token },
    signedCookies: {},
    params: {},
    body: {},
    ...overrides,
  }
  return req as Request
}

describe('commissionController sendCommissionReminder', () => {
  const adminId = new mongoose.Types.ObjectId().toString()
  const supplierId = new mongoose.Types.ObjectId().toString()

  const adminUser = {
    _id: adminId,
    type: bookcarsTypes.UserType.Admin,
    fullName: 'Admin User',
    email: 'admin@example.com',
    language: 'fr',
    score: 0,
  } as unknown as env.User

  const supplierUser = {
    _id: supplierId,
    type: bookcarsTypes.UserType.Supplier,
    fullName: 'Supplier User',
    email: 'supplier@example.com',
    language: 'fr',
    phone: '+21600000000',
    score: 0,
  } as unknown as env.User

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('should send an email reminder and persist a successful event', async () => {
    const eventCreateMock = jest.spyOn(AgencyCommissionEvent, 'create').mockResolvedValue({} as never)
    const transportSendMailMock = jest.fn<(options: unknown, callback: (err: Error | null, info: unknown) => void) => void>((options, callback) => {
      callback(null, {})
    })
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: transportSendMailMock as unknown as nodemailer.Transporter['sendMail'],
    } as nodemailer.Transporter)

    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      if (id === adminId) {
        return Promise.resolve(adminUser)
      }
      if (id === supplierId) {
        return Promise.resolve(supplierUser)
      }
      return Promise.resolve(null)
    })

    const req = await createRequestWithToken(adminId, {
      body: {
        agencyId: supplierId,
        year: 2024,
        month: 5,
        subject: 'Reminder subject',
        message: '<p>Commission reminder</p>',
        channel: bookcarsTypes.CommissionReminderChannel.Email,
      },
    })
    const res = createMockResponse()

    await sendCommissionReminder(req, res)

    expect(transportSendMailMock).toHaveBeenCalledTimes(1)
    expect(transportSendMailMock.mock.calls[0][0]).toMatchObject({
      to: supplierUser.email,
      subject: 'Reminder subject',
    })
    expect(eventCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      agency: expect.any(mongoose.Types.ObjectId),
      success: true,
      channel: bookcarsTypes.CommissionReminderChannel.Email,
    }))
    expect(res.sendStatus).toHaveBeenCalledWith(200)
  })

  it('should return 400 and persist a failed event when SMS cannot be sent', async () => {
    const eventCreateMock = jest.spyOn(AgencyCommissionEvent, 'create').mockResolvedValue({} as never)
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: jest.fn(),
    } as unknown as nodemailer.Transporter)

    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      if (id === adminId) {
        return Promise.resolve(adminUser)
      }
      if (id === supplierId) {
        return Promise.resolve({ ...supplierUser, phone: 'invalid-phone' })
      }
      return Promise.resolve(null)
    })

    const req = await createRequestWithToken(adminId, {
      body: {
        agencyId: supplierId,
        year: 2024,
        month: 6,
        message: '<p>Commission reminder</p>',
        channel: bookcarsTypes.CommissionReminderChannel.Sms,
      },
    })
    const res = createMockResponse()

    await sendCommissionReminder(req, res)

    expect(eventCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      agency: expect.any(mongoose.Types.ObjectId),
      success: false,
      channel: bookcarsTypes.CommissionReminderChannel.Sms,
    }))
    expect(res.status).toHaveBeenCalledWith(400)
  })
})
