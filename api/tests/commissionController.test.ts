import { jest } from '@jest/globals'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import AgencyCommissionSettings from '../src/models/AgencyCommissionSettings'
import * as authHelper from '../src/common/authHelper'
import User from '../src/models/User'
import * as env from '../src/config/env.config'
import { getCommissionSettings, updateCommissionSettings } from '../src/controllers/commissionController'

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  }
  return res as unknown as Response & {
    status: jest.Mock
    send: jest.Mock
    json: jest.Mock
    setHeader: jest.Mock
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

describe('commissionController settings endpoints', () => {
  const adminId = new mongoose.Types.ObjectId().toString()
  const updatedById = new mongoose.Types.ObjectId().toString()
  const nonAdminId = new mongoose.Types.ObjectId().toString()

  const adminUser = {
    _id: adminId,
    type: bookcarsTypes.UserType.Admin,
    fullName: 'Admin User',
    email: 'admin@example.com',
    language: 'fr',
    score: 0,
  } as unknown as env.User

  const nonAdminUser = {
    _id: nonAdminId,
    type: bookcarsTypes.UserType.Supplier,
    fullName: 'Supplier User',
    email: 'supplier@example.com',
    language: 'fr',
    score: 0,
  } as unknown as env.User

  const updatedByUser = {
    _id: updatedById,
    type: bookcarsTypes.UserType.Admin,
    fullName: 'Moderator',
    email: 'moderator@example.com',
    phone: '+21600000000',
    slug: 'moderator',
    language: 'fr',
    score: 0,
  } as unknown as env.User

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  it('should deny access when the requester is not an admin', async () => {
    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [id] = args as [string]
      if (id === nonAdminId) {
        return Promise.resolve(nonAdminUser)
      }
      return Promise.resolve(null)
    })

    const req = await createRequestWithToken(nonAdminId)
    const res = createMockResponse()

    await getCommissionSettings(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('should return persisted commission settings with metadata', async () => {
    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      if (id === adminId) {
        return Promise.resolve(adminUser)
      }
      if (id === updatedById) {
        return Promise.resolve(updatedByUser)
      }
      return Promise.resolve(null)
    })

    const settingsDocument = new AgencyCommissionSettings({
      reminderChannel: bookcarsTypes.CommissionReminderChannel.Sms,
      emailTemplate: 'Email template',
      smsTemplate: 'Sms template',
      updatedBy: new mongoose.Types.ObjectId(updatedById),
    })
    settingsDocument.updatedAt = new Date()
    jest.spyOn(AgencyCommissionSettings, 'findOne').mockResolvedValue(settingsDocument)

    const req = await createRequestWithToken(adminId)
    const res = createMockResponse()

    await getCommissionSettings(req, res)

    expect(res.json).toHaveBeenCalled()
    const payload = res.json.mock.calls[0][0] as bookcarsTypes.CommissionSettings
    expect(payload).toMatchObject({
      reminderChannel: bookcarsTypes.CommissionReminderChannel.Sms,
      emailTemplate: 'Email template',
      smsTemplate: 'Sms template',
    })
    expect(payload.updatedBy).toMatchObject({
      id: updatedById,
      name: updatedByUser.fullName,
      email: updatedByUser.email,
    })
  })

  it('should validate required fields when updating settings', async () => {
    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation(() => Promise.resolve(adminUser))

    const req = await createRequestWithToken(adminId, { body: {} })
    const res = createMockResponse()

    await updateCommissionSettings(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should persist updated commission settings', async () => {
    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      if (id === adminId) {
        return Promise.resolve(adminUser)
      }
      if (id === updatedById) {
        return Promise.resolve(updatedByUser)
      }
      return Promise.resolve(null)
    })

    const settingsDocument = new AgencyCommissionSettings({
      reminderChannel: bookcarsTypes.CommissionReminderChannel.Email,
      emailTemplate: 'Initial email',
      smsTemplate: 'Initial sms',
      updatedBy: new mongoose.Types.ObjectId(updatedById),
    })
    settingsDocument.updatedAt = new Date();
(settingsDocument as any).save = jest.fn(async () => settingsDocument)
    jest.spyOn(AgencyCommissionSettings, 'findOne').mockResolvedValue(settingsDocument)

    const req = await createRequestWithToken(adminId, {
      body: {
        reminderChannel: bookcarsTypes.CommissionReminderChannel.Email,
        emailTemplate: 'Updated email body',
        smsTemplate: 'Updated sms body',
      },
    })
    const res = createMockResponse()

    await updateCommissionSettings(req, res)

    expect(settingsDocument.save).toHaveBeenCalledTimes(1)
    expect(settingsDocument.emailTemplate).toBe('Updated email body')
    expect(settingsDocument.smsTemplate).toBe('Updated sms body')
    expect(res.json).toHaveBeenCalled()
    const payload = res.json.mock.calls[0][0] as bookcarsTypes.CommissionSettings
    expect(payload.updatedBy).toMatchObject({ id: adminId, name: adminUser.fullName })
  })
})
