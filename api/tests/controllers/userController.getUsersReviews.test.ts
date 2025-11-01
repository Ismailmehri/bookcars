import { describe, it, expect, jest, afterEach } from '@jest/globals'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'

const getSessionData = jest.fn<(request?: unknown) => Promise<{ id: string }>>()

await jest.unstable_mockModule('../../src/common/authHelper', () => ({
  getSessionData,
}))

const { getUsersReviews } = await import('../../src/controllers/userController')
const { default: User } = await import('../../src/models/User')

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  sendStatus: jest.fn(),
  send: jest.fn(),
}) as unknown as Response & {
  status: jest.Mock
  json: jest.Mock
  sendStatus: jest.Mock
  send: jest.Mock
}

describe('getUsersReviews', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    getSessionData.mockReset()
  })

  it('defaults to first page and limit when pagination query params are invalid', async () => {
    const adminId = new mongoose.Types.ObjectId().toString()

    getSessionData.mockResolvedValue({ id: adminId })
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(adminId),
      type: bookcarsTypes.UserType.Admin,
    } as unknown as mongoose.Document)

    const aggregateSpy = jest.spyOn(User, 'aggregate')
    aggregateSpy.mockResolvedValueOnce([] as never)
    aggregateSpy.mockResolvedValueOnce([{ total: 0 }] as never)

    const req = {
      query: { page: 'invalid', limit: 'NaN' },
    } as unknown as Request
    const res = createResponse()

    await getUsersReviews(req, res)

    expect(aggregateSpy).toHaveBeenCalled()
    const pipeline = aggregateSpy.mock.calls[0][0] as mongoose.PipelineStage[]
    const skipStage = pipeline.find((stage) => '$skip' in stage) as { $skip: number }
    const limitStage = pipeline.find((stage) => '$limit' in stage) as { $limit: number }

    expect(skipStage.$skip).toBe(0)
    expect(limitStage.$limit).toBe(10)
    expect(res.json).toHaveBeenCalledWith({
      currentPage: 1,
      totalReviews: 0,
      reviews: [],
    })
  })
})
