import { jest } from '@jest/globals'
import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import app from '../src/app'
import * as authHelper from '../src/common/authHelper'
import User from '../src/models/User'
import Booking from '../src/models/Booking'
import Car from '../src/models/Car'
import * as env from '../src/config/env.config'

describe('car stats controller', () => {
  const adminId = new mongoose.Types.ObjectId().toString()
  const supplierAObjectId = new mongoose.Types.ObjectId()
  const supplierBObjectId = new mongoose.Types.ObjectId()
  const supplierAId = supplierAObjectId.toString()
  const supplierBId = supplierBObjectId.toString()
  const carAId = new mongoose.Types.ObjectId()
  const carBId = new mongoose.Types.ObjectId()

  const now = new Date()
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)

  const adminUser = {
    _id: adminId,
    type: bookcarsTypes.UserType.Admin,
    fullName: 'Administrator',
  }

  const agencyA = {
    _id: supplierAObjectId,
    type: bookcarsTypes.UserType.Supplier,
    fullName: 'Agence Alpha',
    phone: '+33123456789',
    updatedAt: now,
    reviews: [
      {
        booking: new mongoose.Types.ObjectId().toString(),
        user: supplierAObjectId.toString(),
        type: 'profile',
        rating: 4,
        rentedCar: true,
        answeredCall: true,
        canceledLastMinute: false,
        createdAt: now,
      },
      {
        booking: new mongoose.Types.ObjectId().toString(),
        user: supplierAObjectId.toString(),
        type: 'profile',
        rating: 5,
        rentedCar: true,
        answeredCall: true,
        canceledLastMinute: false,
        createdAt: fiveDaysAgo,
      },
    ],
  }

  const agencyB = {
    _id: supplierBObjectId,
    type: bookcarsTypes.UserType.Supplier,
    fullName: 'Agence Beta',
    phone: '+33987654321',
    updatedAt: tenDaysAgo,
    reviews: [
      {
        booking: new mongoose.Types.ObjectId().toString(),
        user: supplierBObjectId.toString(),
        type: 'profile',
        rating: 3,
        rentedCar: true,
        answeredCall: true,
        canceledLastMinute: false,
        createdAt: tenDaysAgo,
      },
    ],
  }

  const bookingDocs = [
    {
      _id: new mongoose.Types.ObjectId(),
      supplier: supplierAObjectId,
      car: carAId,
      status: bookcarsTypes.BookingStatus.Paid,
      from: tenDaysAgo,
      to: now,
      price: 120,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      supplier: supplierAObjectId,
      car: carAId,
      status: bookcarsTypes.BookingStatus.Pending,
      from: tenDaysAgo,
      to: fiveDaysAgo,
      updatedAt: fiveDaysAgo,
      price: 80,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      supplier: supplierBObjectId,
      car: carBId,
      status: bookcarsTypes.BookingStatus.Reserved,
      from: tenDaysAgo,
      to: fiveDaysAgo,
      price: 95,
    },
    {
      _id: new mongoose.Types.ObjectId(),
      supplier: supplierBObjectId,
      car: carBId,
      status: bookcarsTypes.BookingStatus.Cancelled,
      from: tenDaysAgo,
      to: tenDaysAgo,
      price: 50,
    },
  ]

  const carDocs = [
    {
      _id: carAId,
      supplier: supplierAObjectId,
      name: 'Peugeot 208',
      range: bookcarsTypes.CarRange.Midi,
      dailyPrice: 60,
      monthlyPrice: 1200,
      periodicPrices: [{ from: new Date(), to: new Date(), price: 55 }],
      unavailablePeriods: [{ from: new Date(), to: new Date() }],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      supplier: supplierAObjectId,
      name: 'Citroën C3',
      range: bookcarsTypes.CarRange.Mini,
      dailyPrice: 65,
      monthlyPrice: 900,
      periodicPrices: [{ from: new Date(), to: new Date(), price: 70 }],
      unavailablePeriods: [{ from: new Date(), to: new Date() }],
    },
    {
      _id: carBId,
      supplier: supplierBObjectId,
      name: 'Renault Clio',
      range: bookcarsTypes.CarRange.Mini,
      dailyPrice: 50,
      monthlyPrice: null,
      periodicPrices: [],
      unavailablePeriods: [],
    },
  ]

  const adminAveragePrices = [
    {
      category: bookcarsTypes.CarRange.Midi,
      averageDailyPrice: 60,
      averageMonthlyPrice: 1200,
    },
    {
      category: bookcarsTypes.CarRange.Mini,
      averageDailyPrice: 65,
      averageMonthlyPrice: 900,
    },
  ]

  const agencyAveragePrices: Record<
    string,
    { category: bookcarsTypes.CarRange; averageDailyPrice: number; averageMonthlyPrice: number | null }[]
  > = {
    [supplierAId]: [
      {
        category: bookcarsTypes.CarRange.Midi,
        averageDailyPrice: 62,
        averageMonthlyPrice: 1250,
      },
      {
        category: bookcarsTypes.CarRange.Mini,
        averageDailyPrice: 65,
        averageMonthlyPrice: 910,
      },
    ],
    [supplierBId]: [
      {
        category: bookcarsTypes.CarRange.Mini,
        averageDailyPrice: 50,
        averageMonthlyPrice: null,
      },
    ],
  }

  const topModelAggregation = [
    {
      model: 'Peugeot 208',
      bookings: 5,
      agencyId: supplierAObjectId,
      agencyName: agencyA.fullName,
    },
    {
      model: 'Renault Clio',
      bookings: 3,
      agencyId: supplierBObjectId,
      agencyName: agencyB.fullName,
    },
  ]

  let adminToken: string
  let supplierAToken: string

  beforeAll(async () => {
    adminToken = await authHelper.encryptJWT({ id: adminId })
    supplierAToken = await authHelper.encryptJWT({ id: supplierAId })
  })

  beforeEach(() => {

    const findByIdMock = jest.spyOn(User, 'findById') as unknown as jest.Mock
    findByIdMock.mockImplementation((rawId) => ({
      lean: async () => {
        const id = typeof rawId === 'string' ? rawId : rawId?.toString()
        if (id === adminId) {
          return adminUser
        }
        if (id === supplierAId) {
          return agencyA
        }
        if (id === supplierBId) {
          return agencyB
        }
        return null
      },
    }))

    const existsMock = jest.spyOn(User, 'exists') as unknown as jest.Mock
    existsMock.mockImplementation(async (criteria) => {
      const andConditions = (criteria as { $and?: unknown[] })?.$and
      if (Array.isArray(andConditions)) {
        for (const condition of andConditions) {
          if (condition && typeof condition === 'object' && '_id' in (condition as Record<string, unknown>)) {
            const value = (condition as { _id: unknown })._id
            const id = typeof value === 'string' ? value : (value as mongoose.Types.ObjectId | undefined)?.toString()
            if (id === adminId || id === supplierAId || id === supplierBId) {
              return true
            }
          }
        }
      }
      return false
    })

    const findMock = jest.spyOn(User, 'find') as unknown as jest.Mock
    findMock.mockReturnValue({
      lean: async () => [agencyA, agencyB],
    })

    const bookingFindMock = jest.spyOn(Booking, 'find') as unknown as jest.Mock
    bookingFindMock.mockImplementation((criteria) => ({
      lean: async () => {
        const supplierCriteria = (criteria as { supplier?: unknown })?.supplier
        if (supplierCriteria && typeof supplierCriteria === 'object' && '$in' in (supplierCriteria as Record<string, unknown>)) {
          return bookingDocs
        }
        if (supplierCriteria instanceof mongoose.Types.ObjectId) {
          return bookingDocs.filter((doc) => doc.supplier.equals(supplierCriteria))
        }
        return []
      },
    }))

    const carFindMock = jest.spyOn(Car, 'find') as unknown as jest.Mock
    carFindMock.mockImplementation((criteria) => ({
      lean: async () => {
        const supplierCriteria = (criteria as { supplier?: unknown })?.supplier
        if (supplierCriteria && typeof supplierCriteria === 'object' && '$in' in (supplierCriteria as Record<string, unknown>)) {
          return carDocs
        }
        if (supplierCriteria instanceof mongoose.Types.ObjectId) {
          return carDocs.filter((doc) => doc.supplier.equals(supplierCriteria))
        }
        return []
      },
    }))

    const carAggregateMock = jest.spyOn(Car, 'aggregate') as unknown as jest.Mock
    carAggregateMock.mockImplementation(async (pipeline) => {
      const pipelineArray = pipeline as unknown[]
      const firstStage = Array.isArray(pipelineArray) ? pipelineArray[0] : undefined
      if (firstStage && typeof firstStage === 'object' && '$match' in firstStage) {
        const matchStage = firstStage.$match as { supplier?: unknown }
        const supplierFilter = matchStage?.supplier
        if (supplierFilter && typeof supplierFilter === 'object' && '$in' in (supplierFilter as Record<string, unknown>)) {
          return adminAveragePrices
        }
        if (supplierFilter instanceof mongoose.Types.ObjectId) {
          return agencyAveragePrices[supplierFilter.toString()] ?? []
        }
      }
      return []
    })

    const bookingAggregateMock = jest.spyOn(Booking, 'aggregate') as unknown as jest.Mock
    bookingAggregateMock.mockImplementation(async () => topModelAggregation)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns admin overview with ranking data', async () => {
    const response = await request(app)
      .get('/api/car-stats/admin/overview')
      .set(env.X_ACCESS_TOKEN, adminToken)

    expect(response.statusCode).toBe(200)
    const body = response.body as bookcarsTypes.AdminStatisticsOverview

    expect(body.ranking).toHaveLength(2)
    expect(body.ranking[0].score).toBeGreaterThanOrEqual(body.ranking[1].score)

    const agencyAStats = body.ranking.find((item) => item.agencyId === supplierAId)
    const agencyBStats = body.ranking.find((item) => item.agencyId === supplierBId)
    expect(agencyAStats?.totalCars).toBe(2)
    expect(agencyBStats?.totalCars).toBe(1)
    expect(agencyAStats?.revenue).toBeGreaterThan(0)
    expect(agencyAStats?.reviewCount).toBe(2)
    expect(agencyAStats?.averageRating).toBeGreaterThan(0)
    expect(agencyAStats?.lastConnectionAt).toBeDefined()

    expect(body.summary.totalAgencies).toBe(2)
    expect(body.averagePrices).toEqual(adminAveragePrices)
    expect(body.averagePrices[0].averageMonthlyPrice).toBeGreaterThan(0)
    expect(body.topModels).toHaveLength(2)

    const highlightTopIds = body.highlights.topPerformers.map((item) => item.agencyId)
    if (highlightTopIds.length > 0) {
      expect(highlightTopIds).toContain(body.ranking[0].agencyId)
    }

    const watchListIds = body.highlights.watchList.map((item) => item.agencyId)
    expect(watchListIds).toContain(supplierBId)

    const inactiveIds = body.inactiveAgencies.map((item) => item.agencyId)
    expect(inactiveIds).toContain(supplierAId)
    expect(body.inactiveAgencies.find((item) => item.agencyId === supplierAId)?.lastConnectionAt)
      .toBeDefined()
  })

  it('returns agency overview for the selected supplier', async () => {
    const response = await request(app)
      .get(`/api/car-stats/agency/${supplierAId}/overview`)
      .set(env.X_ACCESS_TOKEN, adminToken)

    expect(response.statusCode).toBe(200)
    const body = response.body as bookcarsTypes.AgencyStatisticsOverview

    expect(body.totalBookings).toBe(2)
    expect(body.acceptanceRate).toBeGreaterThan(0)
    expect(body.pendingUpdates.length).toBeGreaterThan(0)
    expect(body.pendingUpdateCount).toBeGreaterThan(0)
    expect(body.averagePrices).toEqual(agencyAveragePrices[supplierAId])
    expect(body.totalCars).toBe(2)
    expect(body.topModels[0].model).toBe('Peugeot 208')
    expect(body.totalRevenue).toBeGreaterThan(0)
  })

  it('forbids suppliers from accessing other agencies', async () => {
    const response = await request(app)
      .get(`/api/car-stats/agency/${supplierBId}/overview`)
      .set(env.X_ACCESS_TOKEN, supplierAToken)

    expect(response.statusCode).toBe(403)
  })
})
