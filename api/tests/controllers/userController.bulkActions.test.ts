import { describe, it, expect, jest, afterEach } from '@jest/globals'
import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'

const getSessionData = jest.fn<(request?: unknown) => Promise<{ id: string }>>()

await jest.unstable_mockModule('../../src/common/authHelper', () => ({
  getSessionData,
}))

const { bulkActivateUsers, bulkAssignAgency, bulkChangeRole } = await import('../../src/controllers/userController')
const { default: User } = await import('../../src/models/User')

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  sendStatus: jest.fn(),
  send: jest.fn(),
}) as unknown as Response & {
  status: jest.Mock
  sendStatus: jest.Mock
  send: jest.Mock
}

describe('userController bulk actions', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    getSessionData.mockReset()
  })

  it('allows admins to change roles for non-admin users', async () => {
    const adminId = new mongoose.Types.ObjectId().toString()
    const targetId = new mongoose.Types.ObjectId().toString()

    getSessionData.mockResolvedValue({ id: adminId })
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(adminId),
      type: bookcarsTypes.UserType.Admin,
    } as unknown as mongoose.Document)
    jest.spyOn(User, 'countDocuments').mockResolvedValue(0)
    const updateSpy = jest.spyOn(User, 'updateMany').mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
      matchedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    } as unknown as mongoose.mongo.UpdateResult)

    const req = {
      body: { ids: [targetId], type: bookcarsTypes.UserType.User },
    } as unknown as Request
    const res = createResponse()

    await bulkChangeRole(req, res)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    const [filter, update] = updateSpy.mock.calls[0] as [
      { _id: { $in: mongoose.Types.ObjectId[] } },
      { $set: { type: bookcarsTypes.UserType } }
    ]
    expect(filter._id.$in.map((id) => id.toString())).toEqual([targetId])
    expect(update.$set.type).toBe(bookcarsTypes.UserType.User)
    expect(res.sendStatus).toHaveBeenCalledWith(200)
  })

  it('rejects bulk role changes when requester is not admin', async () => {
    const requesterId = new mongoose.Types.ObjectId().toString()

    getSessionData.mockResolvedValue({ id: requesterId })
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(requesterId),
      type: bookcarsTypes.UserType.User,
    } as unknown as mongoose.Document)

    const req = {
      body: { ids: [new mongoose.Types.ObjectId().toString()], type: bookcarsTypes.UserType.User },
    } as unknown as Request
    const res = createResponse()

    await bulkChangeRole(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(403)
  })

  it('blocks suppliers from activating users they do not own', async () => {
    const supplierId = new mongoose.Types.ObjectId().toString()

    getSessionData.mockResolvedValue({ id: supplierId })
    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(supplierId),
      type: bookcarsTypes.UserType.Supplier,
    } as unknown as mongoose.Document)
    jest.spyOn(User, 'countDocuments').mockResolvedValue(0)
    const updateSpy = jest.spyOn(User, 'updateMany')

    const req = {
      body: { ids: [new mongoose.Types.ObjectId().toString()], active: true },
    } as unknown as Request
    const res = createResponse()

    await bulkActivateUsers(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(403)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it('assigns drivers to an agency when requester is admin', async () => {
    const adminId = new mongoose.Types.ObjectId().toString()
    const agencyId = new mongoose.Types.ObjectId().toString()
    const targetId = new mongoose.Types.ObjectId().toString()

    getSessionData.mockResolvedValue({ id: adminId })
    const findById = jest.spyOn(User, 'findById')
    findById.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(adminId),
      type: bookcarsTypes.UserType.Admin,
    } as unknown as mongoose.Document)
    findById.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(agencyId),
      type: bookcarsTypes.UserType.Supplier,
    } as unknown as mongoose.Document)
    const updateSpy = jest.spyOn(User, 'updateMany').mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
      matchedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    } as unknown as mongoose.mongo.UpdateResult)

    const req = {
      body: { ids: [targetId], agencyId },
    } as unknown as Request
    const res = createResponse()

    await bulkAssignAgency(req, res)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    const [filter, update] = updateSpy.mock.calls[0] as [
      { _id: { $in: mongoose.Types.ObjectId[] } },
      { $set: { supplier: mongoose.Types.ObjectId } }
    ]
    expect(filter._id.$in.map((id) => id.toString())).toEqual([targetId])
    expect(update.$set.supplier.toString()).toBe(agencyId)
    expect(res.sendStatus).toHaveBeenCalledWith(200)
  })
})
