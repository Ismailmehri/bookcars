import { afterEach, describe, expect, it, jest } from '@jest/globals'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'

import * as bookcarsTypes from ':bookcars-types'

const getSessionData = jest.fn<(request?: unknown) => Promise<{ id: string }>>()

await jest.unstable_mockModule('../../src/common/authHelper', () => ({
  getSessionData,
}))

const { getUsers } = await import('../../src/controllers/userController')
const { default: User } = await import('../../src/models/User')

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  sendStatus: jest.fn(),
  send: jest.fn(),
  json: jest.fn(),
}) as unknown as Response & {
  status: jest.Mock
  sendStatus: jest.Mock
  send: jest.Mock
  json: jest.Mock
}

describe('userController.getUsers pagination', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    getSessionData.mockReset()
  })

  const adminId = new mongoose.Types.ObjectId().toString()
  const adminDocument = {
    _id: new mongoose.Types.ObjectId(adminId),
    type: bookcarsTypes.UserType.Admin,
  } as unknown as mongoose.Document

  it('falls back to defaults when page or size are invalid', async () => {
    getSessionData.mockResolvedValue({ id: adminId })
    jest.spyOn(User, 'findById').mockResolvedValue(adminDocument)
    const aggregateSpy = jest.spyOn(User, 'aggregate').mockResolvedValue([] as never)

    const req = {
      query: { s: '' },
      params: { page: 'abc', size: 'NaN' },
      body: {},
    } as unknown as Request
    const res = createResponse()

    await getUsers(req, res)

    expect(aggregateSpy).toHaveBeenCalledTimes(1)
    const [pipeline] = aggregateSpy.mock.calls[0] as [
      Array<{ $facet?: { resultData: Array<Record<string, unknown>> } }>,
    ]
    const facetStage = pipeline.find(
      (stage): stage is { $facet: { resultData: Array<Record<string, unknown>> } } => '$facet' in stage,
    )
    expect(facetStage).toBeDefined()
    const resultStages = facetStage?.$facet.resultData ?? []
    const skipStage = resultStages.find((stage): stage is { $skip: number } => '$skip' in stage)
    const limitStage = resultStages.find((stage): stage is { $limit: number } => '$limit' in stage)
    expect(skipStage?.$skip).toBe(0)
    expect(limitStage?.$limit).toBe(25)
    expect(res.json).toHaveBeenCalledWith([])
  })

  it('uses provided numeric pagination values', async () => {
    getSessionData.mockResolvedValue({ id: adminId })
    jest.spyOn(User, 'findById').mockResolvedValue(adminDocument)
    const aggregateSpy = jest.spyOn(User, 'aggregate').mockResolvedValue([] as never)

    const req = {
      query: { s: '' },
      params: { page: '2', size: '10' },
      body: {},
    } as unknown as Request
    const res = createResponse()

    await getUsers(req, res)

    const [pipeline] = aggregateSpy.mock.calls[0] as [
      Array<{ $facet?: { resultData: Array<Record<string, unknown>> } }>,
    ]
    const facetStage = pipeline.find(
      (stage): stage is { $facet: { resultData: Array<Record<string, unknown>> } } => '$facet' in stage,
    )
    const resultStages = facetStage?.$facet.resultData ?? []
    const skipStage = resultStages.find((stage): stage is { $skip: number } => '$skip' in stage)
    const limitStage = resultStages.find((stage): stage is { $limit: number } => '$limit' in stage)
    expect(skipStage?.$skip).toBe(10)
    expect(limitStage?.$limit).toBe(10)
  })
})
