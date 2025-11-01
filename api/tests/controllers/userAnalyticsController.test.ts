import { describe, it, expect, jest, afterEach } from '@jest/globals'
import mongoose from 'mongoose'
import type { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'
import * as authHelper from '../../src/common/authHelper'
import User from '../../src/models/User'
import Booking from '../../src/models/Booking'
import { getUsersKpi } from '../../src/controllers/userAnalyticsController'
import type { UsersKpiInput } from '../../src/services/usersKpiService'

describe('getUsersKpi', () => {
  const createResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
    sendStatus: jest.fn(),
  }) as unknown as Response & {
    status: jest.Mock
    json: jest.Mock
    send: jest.Mock
    sendStatus: jest.Mock
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns KPI metrics for platform scope when requester is an admin', async () => {
    const adminId = new mongoose.Types.ObjectId().toString()

    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(adminId),
      type: bookcarsTypes.UserType.Admin,
    } as unknown as mongoose.Document)

    const users: UsersKpiInput[] = [
      {
        type: bookcarsTypes.UserType.Admin,
        active: true,
        createdAt: new Date('2000-01-01T00:00:00Z'),
        reviews: [{}],
      },
      {
        type: bookcarsTypes.UserType.User,
        active: false,
        createdAt: new Date('2000-01-02T00:00:00Z'),
        reviews: [],
      },
    ]

    const lean = jest.fn(async () => users)
    jest.spyOn(User, 'find').mockReturnValue({ lean } as unknown as ReturnType<typeof User.find>)
    const distinctSpy = jest.spyOn(Booking, 'distinct')

    const token = await authHelper.encryptJWT({ id: adminId })
    const req = {
      query: { scope: 'platform' },
      signedCookies: {},
      headers: { 'x-access-token': token },
    } as unknown as Request
    const res = createResponse()

    await getUsersKpi(req, res)

    expect(lean).toHaveBeenCalledTimes(1)
    expect(distinctSpy).not.toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      totalUsers: 2,
      admins: 1,
      agencies: 0,
      drivers: 1,
      inactive: 1,
      withNoReviews: 1,
      newUsers7d: 0,
      newUsers30d: 0,
    })
  })

  it('requires an agency id when scope is agency for non-supplier users', async () => {
    const adminId = new mongoose.Types.ObjectId().toString()

    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(adminId),
      type: bookcarsTypes.UserType.Admin,
    } as unknown as mongoose.Document)

    const token = await authHelper.encryptJWT({ id: adminId })
    const req = {
      query: { scope: 'agency' },
      signedCookies: {},
      headers: { 'x-access-token': token },
    } as unknown as Request
    const res = createResponse()

    await getUsersKpi(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Invalid agency id')
  })

  it('rejects platform scope requests from suppliers', async () => {
    const supplierId = new mongoose.Types.ObjectId().toString()

    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(supplierId),
      type: bookcarsTypes.UserType.Supplier,
    } as unknown as mongoose.Document)

    const token = await authHelper.encryptJWT({ id: supplierId })
    const req = {
      query: { scope: 'platform' },
      signedCookies: {},
      headers: { 'x-access-token': token },
    } as unknown as Request
    const res = createResponse()

    await getUsersKpi(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(403)
  })

  it('returns a 400 error when scope is invalid', async () => {
    const req = {
      query: { scope: 'invalid' },
      signedCookies: {},
      headers: {},
    } as unknown as Request
    const res = createResponse()

    await getUsersKpi(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith('Invalid scope')
  })
})
