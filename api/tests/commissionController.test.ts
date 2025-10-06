import { jest } from '@jest/globals'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import AgencyCommissionEvent from '../src/models/AgencyCommissionEvent'
import AgencyCommissionSettings from '../src/models/AgencyCommissionSettings'
import AgencyCommissionState from '../src/models/AgencyCommissionState'
import Booking from '../src/models/Booking'
import * as authHelper from '../src/common/authHelper'
import User from '../src/models/User'
import * as env from '../src/config/env.config'
import {
  getCommissionSettings,
  updateCommissionSettings,
  getMonthlyCommissions,
  exportMonthlyCommissions,
  getAgencyCommissionBookings,
} from '../src/controllers/commissionController'
import * as helper from ':bookcars-helper'
import i18n from '../src/lang/i18n'

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
    settingsDocument.updatedAt = new Date()
    settingsDocument.bankTransferEnabled = false
    ;(settingsDocument as any).save = jest.fn(async () => settingsDocument)
    jest.spyOn(AgencyCommissionSettings, 'findOne').mockResolvedValue(settingsDocument)

    const req = await createRequestWithToken(adminId, {
      body: {
        reminderChannel: bookcarsTypes.CommissionReminderChannel.Email,
        emailTemplate: 'Updated email body',
        smsTemplate: 'Updated sms body',
        bankTransferEnabled: false,
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

describe('commissionController monthly commission endpoints', () => {
  const adminId = new mongoose.Types.ObjectId().toString()
  const supplierObjectId = new mongoose.Types.ObjectId()
  const supplierId = supplierObjectId.toString()

  const adminUser = {
    _id: adminId,
    type: bookcarsTypes.UserType.Admin,
    fullName: 'Admin User',
    email: 'admin@example.com',
    language: 'fr',
    score: 0,
  } as unknown as env.User

  const supplierUser = {
    _id: supplierObjectId,
    type: bookcarsTypes.UserType.Supplier,
    fullName: 'Partner Cars',
    email: 'partner@example.com',
    phone: '+21612345678',
    location: 'Tunis',
    slug: 'partner-cars',
    blacklisted: false,
    language: 'fr',
    score: 0,
  } as unknown as env.User

  const setupAdminLookup = () => {
    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      if (id === adminId) {
        return Promise.resolve(adminUser)
      }
      return Promise.resolve(null)
    })
  }

  const setupCommissionDataMocks = (paymentDate: Date, reminderDate: Date) => {
    helper.setCommissionConfig({
      enabled: true,
      rate: 5,
      effectiveDate: new Date('2020-01-01T00:00:00.000Z'),
      monthlyThreshold: 100,
    })

    jest.spyOn(Booking, 'aggregate').mockResolvedValue([
      {
        _id: { supplier: supplierObjectId, year: 2024, month: 5 },
        reservations: 1,
        grossTurnover: 400,
        commissionDue: 80,
      },
      {
        _id: { supplier: supplierObjectId, year: 2024, month: 6 },
        reservations: 2,
        grossTurnover: 600,
        commissionDue: 120,
      },
    ])

    jest.spyOn(User, 'find').mockResolvedValue([supplierUser])

    jest.spyOn(AgencyCommissionState, 'find').mockResolvedValue([
      {
        agency: supplierObjectId,
        blocked: false,
      } as unknown as env.AgencyCommissionState,
    ])

    const events = [
      {
        _id: new mongoose.Types.ObjectId(),
        agency: supplierObjectId,
        type: bookcarsTypes.AgencyCommissionEventType.Reminder,
        createdAt: reminderDate,
        year: 2024,
        month: 6,
        channel: bookcarsTypes.CommissionReminderChannel.Sms,
        success: true,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        agency: supplierObjectId,
        type: bookcarsTypes.AgencyCommissionEventType.Payment,
        createdAt: paymentDate,
        paymentDate,
        year: 2024,
        month: 6,
        amount: 50,
      },
    ]

    const leanMock = jest.fn().mockResolvedValue(events as never)
    const sortMock = jest.fn().mockReturnValue({ lean: leanMock })
    jest.spyOn(AgencyCommissionEvent, 'find').mockReturnValue({
      sort: sortMock,
      lean: leanMock,
    } as unknown as ReturnType<typeof AgencyCommissionEvent.find>)
  }

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    helper.setCommissionConfig({
      enabled: true,
      rate: 5,
      effectiveDate: new Date('2025-01-01T00:00:00.000Z'),
      monthlyThreshold: 50,
    })
  })

  it('should return 403 when the requester is not authorized', async () => {
    jest.spyOn(User, 'findById').mockResolvedValue(null as never)
    const res = createMockResponse()
    const req = await createRequestWithToken(new mongoose.Types.ObjectId().toString(), {
      body: { month: 6, year: 2024 },
    })

    await getMonthlyCommissions(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.send).toHaveBeenCalledWith(i18n.t('NOT_AUTHORIZED'))
  })

  it('should return 400 when request payload is invalid', async () => {
    setupAdminLookup()
    const req = await createRequestWithToken(adminId, {
      body: { month: 0 },
    })
    const res = createMockResponse()

    await getMonthlyCommissions(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(i18n.t('DB_ERROR'))
  })

  it('should compute and return paginated commission data', async () => {
    setupAdminLookup()
    const paymentDate = new Date('2024-06-20T10:00:00.000Z')
    const reminderDate = new Date('2024-06-10T08:00:00.000Z')
    setupCommissionDataMocks(paymentDate, reminderDate)

    const req = await createRequestWithToken(adminId, {
      params: { page: '1', size: '10' },
      body: { month: 6, year: 2024, search: '', status: 'all' },
    })
    const res = createMockResponse()

    await getMonthlyCommissions(req, res)

    expect(res.json).toHaveBeenCalledTimes(1)
    const payload = res.json.mock.calls[0][0] as {
      summary: bookcarsTypes.AgencyCommissionSummary
      agencies: bookcarsTypes.AgencyCommissionRow[]
      total: number
      page: number
      size: number
    }

    expect(payload.summary).toEqual({
      grossTurnover: 600,
      commissionDue: 120,
      commissionCollected: 50,
      agenciesAboveThreshold: 1,
      threshold: 100,
      carryOverTotal: 80,
      payableTotal: 150,
      agenciesUnderThreshold: 0,
    })
    expect(payload.total).toBe(1)
    expect(payload.page).toBe(1)
    expect(payload.size).toBe(10)
    expect(payload.agencies).toHaveLength(1)
    const [firstAgency] = payload.agencies
    expect(firstAgency.agency).toMatchObject({
      id: supplierId,
      name: supplierUser.fullName,
      city: supplierUser.location,
      email: supplierUser.email,
      phone: supplierUser.phone,
      slug: supplierUser.slug,
    })
    expect(firstAgency.reservations).toBe(2)
    expect(firstAgency.grossTurnover).toBe(600)
    expect(firstAgency.commissionDue).toBe(120)
    expect(firstAgency.commissionCollected).toBe(50)
    expect(firstAgency.balance).toBe(150)
    expect(firstAgency.status).toBe(bookcarsTypes.AgencyCommissionStatus.NeedsFollowUp)
    expect(firstAgency.aboveThreshold).toBe(true)
    expect(firstAgency.carryOver).toBe(80)
    expect(firstAgency.totalToPay).toBe(150)
    expect(firstAgency.payable).toBe(true)
    expect(firstAgency.lastPayment).toEqual(paymentDate)
    expect(firstAgency.lastReminder).toEqual({
      date: reminderDate,
      channel: bookcarsTypes.CommissionReminderChannel.Sms,
      success: true,
    })
  })

  it('should export commission data as CSV', async () => {
    setupAdminLookup()
    const paymentDate = new Date('2024-06-20T10:00:00.000Z')
    const reminderDate = new Date('2024-06-10T08:00:00.000Z')
    setupCommissionDataMocks(paymentDate, reminderDate)

    const req = await createRequestWithToken(adminId, {
      params: { page: '1', size: '10' },
      body: { month: 6, year: 2024, search: '', status: 'all' },
    })
    const res = createMockResponse()

    await exportMonthlyCommissions(req, res)

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8')
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('commissions_2024_06.csv'),
    )
    expect(res.send).toHaveBeenCalledTimes(1)
    const csvContent = res.send.mock.calls[0][0] as string
    expect(csvContent.startsWith('\ufeff')).toBe(true)
    expect(csvContent).toContain('"Agence";"Ville";"Identifiant"')
    expect(csvContent).toContain(`"${supplierUser.fullName}"`)
    expect(csvContent).toContain('"Totaux"')
    expect(csvContent).toContain('"Reliquat (TND)"')
    expect(csvContent).toContain('"Total à payer (TND)"')
    expect(csvContent).toContain('"Payable"')
    expect(csvContent).toContain('"agencyName";"month";"commissionMonth";"carryOver";"totalDue";"payableFlag"')
  })

  it('should not duplicate bookings across adjacent months', async () => {
    helper.setCommissionConfig({
      enabled: true,
      rate: 10,
      effectiveDate: new Date('2020-01-01T00:00:00.000Z'),
      monthlyThreshold: 100,
    })

    const januaryBooking = {
      _id: new mongoose.Types.ObjectId(),
      supplier: supplierObjectId,
      status: bookcarsTypes.BookingStatus.Paid,
      price: 300,
      commissionTotal: 30,
      from: new Date('2024-01-31T10:00:00.000Z'),
      to: new Date('2024-02-02T10:00:00.000Z'),
    }

    const filters: Array<Record<string, unknown>> = []
    const bookingsByCall = [[januaryBooking], [januaryBooking]]

    const createQueryResponse = (bookings: unknown[]) => {
      const chain: Record<string, unknown> = {}
      chain.sort = jest.fn().mockReturnValue(chain)
      chain.populate = jest.fn().mockReturnValue(chain)
      chain.lean = jest.fn(async () => bookings)
      return chain as unknown as ReturnType<typeof Booking.find>
    }

    jest.spyOn(Booking, 'aggregate').mockResolvedValue([
      {
        _id: { supplier: supplierObjectId, year: 2024, month: 1 },
        reservations: 1,
        grossTurnover: 300,
        commissionDue: 30,
      },
    ])

    const bookingFindMock = jest.spyOn(Booking, 'find') as unknown as jest.Mock
    bookingFindMock.mockImplementation((filter: unknown) => {
      filters.push(filter as Record<string, unknown>)
      const bookings = bookingsByCall.shift() || []
      return createQueryResponse(bookings)
    })

    const eventFindMock = jest.spyOn(AgencyCommissionEvent, 'find') as unknown as jest.Mock
    eventFindMock.mockImplementation(() => {
      const lean = jest.fn(async () => [])
      return {
        sort: jest.fn().mockReturnValue({ lean }),
        lean,
      } as unknown as ReturnType<typeof AgencyCommissionEvent.find>
    })

    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((...args: unknown[]) => {
      const [rawId] = args as [mongoose.Types.ObjectId | string]
      const id = typeof rawId === 'string' ? rawId : rawId.toString()
      if (id === supplierId) {
        return Promise.resolve(supplierUser)
      }
      return Promise.resolve(null)
    })

    const januaryReq = await createRequestWithToken(supplierId, {
      body: { month: 0, year: 2024 },
    })
    const januaryRes = createMockResponse()

    await getAgencyCommissionBookings(januaryReq, januaryRes)

    expect(januaryRes.json).toHaveBeenCalledTimes(1)
    const januaryPayload = januaryRes.json.mock.calls[0][0] as {
      bookings: bookcarsTypes.AgencyCommissionBooking[]
      summary: bookcarsTypes.AgencyCommissionMonthlySummary
    }

    expect(januaryPayload.bookings).toHaveLength(1)
    expect(januaryPayload.summary).toEqual({
      gross: 300,
      grossAll: 300,
      commission: 30,
      net: 270,
      reservations: 1,
      commissionPercentage: 10,
      carryOver: 0,
      totalToPay: 30,
      payable: false,
      threshold: 100,
      carryOverItems: [],
    })

    const februaryReq = await createRequestWithToken(supplierId, {
      body: { month: 1, year: 2024 },
    })
    const februaryRes = createMockResponse()

    await getAgencyCommissionBookings(februaryReq, februaryRes)

    expect(februaryRes.json).toHaveBeenCalledTimes(1)
    const februaryPayload = februaryRes.json.mock.calls[0][0] as {
      bookings: bookcarsTypes.AgencyCommissionBooking[]
      summary: bookcarsTypes.AgencyCommissionMonthlySummary
    }

    expect(februaryPayload.bookings).toHaveLength(0)
    expect(februaryPayload.summary).toEqual({
      gross: 0,
      grossAll: 0,
      commission: 0,
      net: 0,
      reservations: 0,
      commissionPercentage: 10,
      carryOver: 30,
      totalToPay: 30,
      payable: false,
      threshold: 100,
      carryOverItems: [
        {
          year: 2024,
          month: 1,
          amount: 30,
        },
      ],
    })

    expect(filters).toHaveLength(2)
    const [januaryFilter, februaryFilter] = filters as Array<{
      from: { $gte: Date; $lt: Date }
    }>

    expect(januaryFilter.from.$gte).toEqual(new Date('2024-01-01T00:00:00.000Z'))
    expect(januaryFilter.from.$lt).toEqual(new Date('2024-02-01T00:00:00.000Z'))
    expect(februaryFilter.from.$gte).toEqual(new Date('2024-02-01T00:00:00.000Z'))
    expect(februaryFilter.from.$lt).toEqual(new Date('2024-03-01T00:00:00.000Z'))
  })
})
