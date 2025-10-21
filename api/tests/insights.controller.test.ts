import 'dotenv/config'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import type { MockedFunction } from 'jest-mock'
import type { Request, Response } from 'express'
import * as bookcarsTypes from ':bookcars-types'

const createObjectId = () => new mongoose.Types.ObjectId().toString()

const cloneDeep = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const normalizeId = (value: unknown): string => {
  if (!value) {
    return ''
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString()
  }
  return String(value)
}

type UserDoc = {
  _id: string
  fullName: string
  email?: string
  phone?: string
  type: bookcarsTypes.UserType
  blacklisted?: boolean
}

type CarDoc = {
  _id: string
  supplier: string
  name: string
  available: boolean
}

type AgencyNoteDoc = {
  _id: string
  agency: string
  type: bookcarsTypes.AgencyNoteType
  summary: string
  details?: string
  metadata?: Record<string, unknown>
  createdBy: string | { _id: string; fullName: string }
  createdAt: Date
}

type CommissionStateDoc = {
  _id: string
  agency: string
  blocked: boolean
  blockedAt?: Date
  blockedBy?: string
  disabledCars: string[]
}

const db = {
  users: new Map<string, UserDoc>(),
  cars: new Map<string, CarDoc>(),
  notes: new Map<string, AgencyNoteDoc>(),
  commissionStates: new Map<string, CommissionStateDoc>(),
}

const validatePhoneNumber = (phoneNumber?: string) => {
  if (!phoneNumber) {
    return { phone: '', isValide: false }
  }
  let cleaned = phoneNumber.trim().replace(/\s+/g, '').replace(/^(\+|00)/, '')
  if (!cleaned.startsWith('216')) {
    cleaned = `216${cleaned}`
  }
  const localNumber = cleaned.slice(3)
  const validPrefixes = [/^2\d{7}$/, /^5\d{7}$/, /^9\d{7}$/, /^4\d{7}$/]
  const isValide = validPrefixes.some((regex) => regex.test(localNumber))
  return {
    phone: isValide ? `216${localNumber}` : phoneNumber,
    isValide,
  }
}

type QueryContext = {
  lean: boolean
  sort?: Record<string, 1 | -1>
  populate?: { path: string; select?: string }
}

class MockQuery<T> {
  private ctx: QueryContext = { lean: false }

  constructor(private readonly resolver: (context: QueryContext) => T | Promise<T>) {}

  lean() {
    this.ctx.lean = true
    return this
  }

  sort(sortArg: Record<string, 1 | -1>) {
    this.ctx.sort = sortArg
    return this
  }

  populate(path: string, select?: string) {
    this.ctx.populate = { path, select }
    return this
  }

  async exec() {
    return this.resolver(this.ctx)
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null) {
    return this.exec().then(onfulfilled, onrejected)
  }
}

const applyProjection = <T extends Record<string, unknown>>(doc: T, projection?: Record<string, number>) => {
  if (!doc) {
    return doc
  }
  if (!projection) {
    return cloneDeep(doc)
  }
  const projected: Record<string, unknown> = { _id: doc._id }
  Object.entries(projection).forEach(([key, value]) => {
    if (value) {
      projected[key] = doc[key]
    }
  })
  return projected as T
}

const filterUsers = (filter: Record<string, unknown>) => {
  const users = Array.from(db.users.values())
  if (!filter || Object.keys(filter).length === 0) {
    return users
  }

  return users.filter((user) => {
    if (filter.type !== undefined && user.type !== filter.type) {
      return false
    }

    const filterId = filter._id
    if (filterId) {
      if (filterId instanceof mongoose.Types.ObjectId || typeof filterId === 'string') {
        if (normalizeId(filterId) !== user._id) {
          return false
        }
      } else if (typeof filterId === 'object' && '$in' in filterId) {
        const values = (filterId as { $in: unknown[] }).$in.map((value) => normalizeId(value))
        if (!values.includes(user._id)) {
          return false
        }
      }
    }

    if (filter.email && user.email !== filter.email) {
      return false
    }

    return true
  })
}

await jest.unstable_mockModule('../src/models/User', () => ({
  default: class UserModel {
    static find(filter: Record<string, unknown>, projection?: Record<string, number>) {
      const docs = filterUsers(filter)
      return new MockQuery(({ lean }) => {
        const result = docs.map((doc) => applyProjection(doc, projection))
        return lean ? cloneDeep(result) : cloneDeep(result)
      })
    }

    static findById(id: unknown, projection?: Record<string, number>) {
      const doc = db.users.get(normalizeId(id))
      return new MockQuery(({ lean }) => {
        const value = doc ? applyProjection(doc, projection) : null
        return lean ? cloneDeep(value) : cloneDeep(value)
      })
    }

    static updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) {
      return {
        exec: async () => {
          const [doc] = filterUsers(filter)
          if (!doc) {
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 }
          }

          if (update && typeof update === 'object' && '$set' in update) {
            Object.assign(doc, (update.$set as Record<string, unknown>))
          }

          db.users.set(doc._id, doc)
          return { acknowledged: true, matchedCount: 1, modifiedCount: 1 }
        },
      }
    }
  },
}))

await jest.unstable_mockModule('../src/models/Car', () => ({
  default: class CarModel {
    static find(filter: Record<string, unknown>, projection?: Record<string, number>) {
      const supplierId = normalizeId(filter.supplier)
      const cars = Array.from(db.cars.values()).filter((car) => car.supplier === supplierId)
      return new MockQuery(({ lean }) => {
        const mapped = cars.map((car) => applyProjection(car, projection))
        return lean ? cloneDeep(mapped) : cloneDeep(mapped)
      })
    }

    static updateMany(filter: Record<string, unknown>, update: Record<string, unknown>) {
      return {
        exec: async () => {
          const ids = (filter?._id as { $in: unknown[] }).$in.map((value) => normalizeId(value))
          let modifiedCount = 0
          ids.forEach((id) => {
            const car = db.cars.get(id)
            if (car && update && typeof update === 'object' && '$set' in update) {
              Object.assign(car, (update.$set as Record<string, unknown>))
              db.cars.set(id, car)
              modifiedCount += 1
            }
          })
          return { acknowledged: true, modifiedCount }
        },
      }
    }

    static findById(id: unknown) {
      const car = db.cars.get(normalizeId(id))
      return new MockQuery(() => cloneDeep(car))
    }

    static async deleteMany(filter: Record<string, unknown>) {
      const ids = (filter?._id as { $in: unknown[] }).$in.map((value) => normalizeId(value))
      let deletedCount = 0
      ids.forEach((value) => {
        if (db.cars.delete(value)) {
          deletedCount += 1
        }
      })
      return { acknowledged: true, deletedCount }
    }
  },
}))

await jest.unstable_mockModule('../src/models/AgencyNote', () => ({
  default: class AgencyNoteModel {
    static async create(payload: Omit<AgencyNoteDoc, '_id' | 'createdAt'>) {
      const _id = createObjectId()
      const note: AgencyNoteDoc = {
        _id,
        createdAt: new Date(),
        ...payload,
        agency: normalizeId(payload.agency),
        createdBy: normalizeId(payload.createdBy),
      }
      db.notes.set(_id, note)
      return cloneDeep(note)
    }

    static async findOne(filter: Record<string, unknown>) {
      const agencyId = normalizeId(filter.agency)
      const note = Array.from(db.notes.values()).find((entry) => entry.agency === agencyId)
      return note ? cloneDeep(note) : null
    }

    static find(filter: Record<string, unknown>) {
      const agencyId = normalizeId(filter.agency)
      const notes = Array.from(db.notes.values()).filter((entry) => entry.agency === agencyId)
      return new MockQuery(({ lean, sort, populate }) => {
        let result = [...notes]
        if (sort) {
          const [[field, direction]] = Object.entries(sort)
          result.sort((a, b) => {
            const dir = direction === -1 ? -1 : 1
            const left = a[field as keyof AgencyNoteDoc]
            const right = b[field as keyof AgencyNoteDoc]
            if (left === right || left === undefined || right === undefined) {
              return 0
            }
            return left < right ? -dir : dir
          })
        }

        if (populate && populate.path === 'createdBy') {
          result = result.map((entry) => {
            const author = db.users.get(normalizeId(entry.createdBy))
            if (!author) {
              return entry
            }
            return {
              ...entry,
              createdBy: {
                _id: author._id,
                fullName: author.fullName,
              },
            }
          })
        }

        return lean ? cloneDeep(result) : cloneDeep(result)
      })
    }

    static async deleteMany(filter: Record<string, unknown>) {
      const ids = (filter.agency as { $in: unknown[] }).$in.map((value) => normalizeId(value))
      let deletedCount = 0
      Array.from(db.notes.values()).forEach((note) => {
        if (ids.includes(note.agency)) {
          db.notes.delete(note._id)
          deletedCount += 1
        }
      })
      return { acknowledged: true, deletedCount }
    }
  },
}))

await jest.unstable_mockModule('../src/models/AgencyCommissionState', () => ({
  default: class AgencyCommissionStateModel {
    _id: string
    agency: mongoose.Types.ObjectId
    blocked: boolean
    blockedAt?: Date
    blockedBy?: mongoose.Types.ObjectId
    disabledCars: mongoose.Types.ObjectId[]

    constructor(payload: Partial<CommissionStateDoc> & { agency: mongoose.Types.ObjectId | string }) {
      this._id = createObjectId()
      this.agency = typeof payload.agency === 'string'
        ? new mongoose.Types.ObjectId(payload.agency)
        : payload.agency
      this.blocked = payload.blocked ?? false
      this.disabledCars = (payload.disabledCars ?? []).map((value) => new mongoose.Types.ObjectId(value))
    }

    async save() {
      db.commissionStates.set(this.agency.toString(), {
        _id: this._id,
        agency: this.agency.toString(),
        blocked: this.blocked,
        blockedAt: this.blockedAt,
        blockedBy: this.blockedBy?.toString(),
        disabledCars: this.disabledCars.map((value) => value.toString()),
      })
      return this
    }

    static findOne(filter: Record<string, unknown>) {
      const agencyId = normalizeId(filter.agency)
      const doc = db.commissionStates.get(agencyId)
      return new MockQuery(() => {
        if (!doc) {
          return null
        }
        const state = new AgencyCommissionStateModel({
          agency: doc.agency,
          blocked: doc.blocked,
        })
        state._id = doc._id
        state.blockedAt = doc.blockedAt
        state.blockedBy = doc.blockedBy ? new mongoose.Types.ObjectId(doc.blockedBy) : undefined
        state.disabledCars = doc.disabledCars.map((value) => new mongoose.Types.ObjectId(value))
        return state
      })
    }

    static async deleteMany(filter: Record<string, unknown>) {
      const ids = (filter.agency as { $in: unknown[] }).$in.map((value) => normalizeId(value))
      let deletedCount = 0
      ids.forEach((value) => {
        if (db.commissionStates.delete(value)) {
          deletedCount += 1
        }
      })
      return { acknowledged: true, deletedCount }
    }
  },
}))

await jest.unstable_mockModule('../src/common/authHelper', () => ({
  getSessionData: jest.fn(),
}))
await jest.unstable_mockModule('../src/common/mailHelper', () => ({
  sendMail: jest.fn(),
}))
await jest.unstable_mockModule('../src/common/smsHelper', () => ({
  sendSms: jest.fn(),
  validateAndFormatPhoneNumber: validatePhoneNumber,
}))

const controllers = await import('../src/controllers/insightsController')
const authHelper = await import('../src/common/authHelper')
const mailHelper = await import('../src/common/mailHelper')
const smsHelper = await import('../src/common/smsHelper')
const agencyNoteModule = await import('../src/models/AgencyNote')

const { sendBulkEmail, sendBulkSms, blockAgencies, unblockAgencies, addManualNote, getAgencyNotes } = controllers
const { default: AgencyNote } = agencyNoteModule

const adminId = createObjectId()
db.users.set(adminId, {
  _id: adminId,
  fullName: 'Admin',
  email: 'admin@test',
  type: bookcarsTypes.UserType.Admin,
})

const mockRequest = (overrides: Partial<Request> = {}) => ({
  body: {},
  params: {},
  headers: {},
  ...overrides,
}) as Request

const createMockResponse = () => {
  const res: Partial<Response> & { statusCode: number; body: unknown } = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code
      return this as Response
    },
    json(payload: unknown) {
      this.body = payload
      return this as Response
    },
  }
  return res
}

const createSupplier = (email: string, fullName: string, overrides: Partial<UserDoc> = {}) => {
  const _id = createObjectId()
  const supplier: UserDoc = {
    _id,
    email,
    fullName,
    type: bookcarsTypes.UserType.Supplier,
    phone: overrides.phone,
    blacklisted: overrides.blacklisted ?? false,
  }
  db.users.set(_id, supplier)
  return supplier
}

const createCar = (supplierId: string, overrides: Partial<CarDoc> = {}) => {
  const _id = createObjectId()
  const car: CarDoc = {
    _id,
    supplier: supplierId,
    name: overrides.name ?? 'Car',
    available: overrides.available ?? true,
  }
  db.cars.set(_id, car)
  return car
}

const getSupplier = (id: string) => db.users.get(id)

const getSessionDataMock = authHelper.getSessionData as MockedFunction<(request?: unknown) => Promise<{ id: string }>>

beforeAll(() => {
  getSessionDataMock.mockResolvedValue({ id: adminId })
})

afterEach(() => {
  jest.clearAllMocks()
  getSessionDataMock.mockResolvedValue({ id: adminId })
  db.cars.clear()
  db.notes.clear()
  db.commissionStates.clear()
  Array.from(db.users.keys()).forEach((id) => {
    if (id !== adminId) {
      db.users.delete(id)
    }
  })
})

describe('insights controller', () => {
  it('sends bulk emails and records notes', async () => {
    const supplier = createSupplier('email-agency@test', 'Email Agency', { email: 'email-agency@test' })
    const sendMailMock = mailHelper.sendMail as MockedFunction<typeof mailHelper.sendMail>
    sendMailMock.mockResolvedValue({} as unknown)

    const req = mockRequest({
      body: {
        agencyIds: [supplier._id],
        subject: 'Important update',
        message: '<p>Hello agency</p>',
      },
    })
    const res = createMockResponse()

    await sendBulkEmail(req, res as Response)

    expect(res.statusCode).toBe(200)
    const body = res.body as bookcarsTypes.BulkActionResponse
    expect(body.succeeded).toHaveLength(1)
    expect(body.failed).toHaveLength(0)
    expect(sendMailMock).toHaveBeenCalledTimes(1)

    const note = await AgencyNote.findOne({ agency: supplier._id })
    expect(note).toBeTruthy()
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Email)
    expect(note?.summary).toContain('Email sent')
  })

  it('sends bulk sms and records notes', async () => {
    const supplier = createSupplier('sms-agency@test', 'SMS Agency', { phone: '+21698765432' })
    const smsMock = smsHelper.sendSms as MockedFunction<typeof smsHelper.sendSms>
    smsMock.mockResolvedValue({})

    const req = mockRequest({
      body: {
        agencyIds: [supplier._id],
        message: 'Short notice',
      },
    })
    const res = createMockResponse()

    await sendBulkSms(req, res as Response)

    expect(res.statusCode).toBe(200)
    const body = res.body as bookcarsTypes.BulkActionResponse
    expect(body.succeeded).toHaveLength(1)
    expect(body.failed).toHaveLength(0)
    expect(smsMock).toHaveBeenCalledTimes(1)

    const note = await AgencyNote.findOne({ agency: supplier._id })
    expect(note).toBeTruthy()
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Sms)
    expect(note?.summary).toContain('SMS sent')
  })

  it('blocks agencies and updates status with note', async () => {
    const supplier = createSupplier('block-agency@test', 'Block Agency', { email: 'block-agency@test' })
    const car = createCar(supplier._id)

    const req = mockRequest({
      body: {
        agencyIds: [supplier._id],
        reason: 'Missing documentation',
        notifyByEmail: false,
        notifyBySms: false,
      },
    })
    const res = createMockResponse()

    await blockAgencies(req, res as Response)

    expect(res.statusCode).toBe(200)
    const supplierDoc = getSupplier(supplier._id)
    expect(supplierDoc?.blacklisted).toBe(true)

    const refreshedCar = db.cars.get(car._id)
    expect(refreshedCar?.available).toBe(false)

    const note = await AgencyNote.findOne({ agency: supplier._id })
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Block)
  })

  it('unblocks agencies and records notes', async () => {
    const supplier = createSupplier('unblock-agency@test', 'Unblock Agency', { blacklisted: true })
    const car = createCar(supplier._id, { available: false })
    db.commissionStates.set(supplier._id, {
      _id: createObjectId(),
      agency: supplier._id,
      blocked: true,
      blockedAt: new Date(),
      blockedBy: adminId,
      disabledCars: [car._id],
    })

    const req = mockRequest({
      body: {
        agencyIds: [supplier._id],
        reason: 'Verified',
      },
    })
    const res = createMockResponse()

    await unblockAgencies(req, res as Response)

    expect(res.statusCode).toBe(200)
    const supplierDoc = getSupplier(supplier._id)
    expect(supplierDoc?.blacklisted).toBe(false)
    const refreshedCar = db.cars.get(car._id)
    expect(refreshedCar?.available).toBe(true)

    const note = await AgencyNote.findOne({ agency: supplier._id })
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Unblock)
  })

  it('reports warnings when agencies are already active', async () => {
    const supplier = createSupplier('active-agency@test', 'Active Agency')
    const req = mockRequest({
      body: {
        agencyIds: [supplier._id],
        reason: 'No action needed',
      },
    })
    const res = createMockResponse()

    await unblockAgencies(req, res as Response)

    expect(res.statusCode).toBe(200)
    const body = res.body as bookcarsTypes.BulkActionResponse
    expect(body.succeeded).toHaveLength(0)
    expect(body.warnings).toHaveLength(1)
    expect(body.warnings[0].reason).toBe('ALREADY_ACTIVE')
  })

  it('adds manual notes and fetches history', async () => {
    const supplier = createSupplier('notes-agency@test', 'Notes Agency')

    const addReq = mockRequest({
      body: {
        agencyIds: [supplier._id],
        note: 'Manual note',
      },
    })
    const addRes = createMockResponse()
    await addManualNote(addReq, addRes as Response)

    expect(addRes.statusCode).toBe(200)
    const addBody = addRes.body as bookcarsTypes.BulkActionResponse
    expect(addBody.succeeded).toHaveLength(1)

    const notesReq = mockRequest({ params: { agencyId: supplier._id } })
    const notesRes = createMockResponse()
    await getAgencyNotes(notesReq, notesRes as Response)

    expect(notesRes.statusCode).toBe(200)
    const notesBody = notesRes.body as bookcarsTypes.AgencyNotesResponse
    expect(notesBody.notes).toHaveLength(1)
    expect(notesBody.notes[0].summary).toBe('Manual note added')
  })
})
