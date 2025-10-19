import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import { jest } from '@jest/globals'
import * as bookcarsTypes from ':bookcars-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import AgencyNote from '../src/models/AgencyNote'
import User from '../src/models/User'
import * as mailHelper from '../src/common/mailHelper'
import * as smsHelper from '../src/common/smsHelper'

const buildCookie = (token: string) => `${env.X_ACCESS_TOKEN}=${token};`

describe('insights controller', () => {
  let adminToken: string
  const createdSuppliers: string[] = []

  beforeAll(async () => {
    testHelper.initializeLogger()
    const res = await databaseHelper.connect(env.DB_URI, false, false)
    expect(res).toBeTruthy()
    await testHelper.initialize()
    adminToken = await testHelper.signinAsAdmin()
  })

  afterEach(async () => {
    if (createdSuppliers.length > 0) {
      await AgencyNote.deleteMany({ agency: { $in: createdSuppliers.map((id) => new mongoose.Types.ObjectId(id)) } })
      await Promise.all(createdSuppliers.splice(0).map((id) => testHelper.deleteSupplier(id)))
    }
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  afterAll(async () => {
    if (mongoose.connection.readyState) {
      await testHelper.signout(adminToken)
      await testHelper.close()
      await databaseHelper.close()
    }
  })

  it('sends bulk emails and records notes', async () => {
    const supplierEmail = testHelper.GetRandomEmail()
    const supplierId = await testHelper.createSupplier(supplierEmail, 'Email Agency')
    createdSuppliers.push(supplierId)

    const sendMailMock = jest.spyOn(mailHelper, 'sendMail').mockResolvedValue({} as unknown)

    const res = await request(app)
      .post('/api/insights/actions/email')
      .set('Cookie', [buildCookie(adminToken)])
      .send({
        agencyIds: [supplierId],
        subject: 'Important update',
        message: '<p>Hello agency</p>',
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.succeeded).toHaveLength(1)
    expect(res.body.failed).toHaveLength(0)
    expect(sendMailMock).toHaveBeenCalledTimes(1)

    const note = await AgencyNote.findOne({ agency: new mongoose.Types.ObjectId(supplierId) })
    expect(note).toBeTruthy()
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Email)
    expect(note?.summary).toContain('Email sent')
  })

  it('sends bulk sms and records notes', async () => {
    const supplierEmail = testHelper.GetRandomEmail()
    const supplierId = await testHelper.createSupplier(supplierEmail, 'SMS Agency')
    createdSuppliers.push(supplierId)

    await User.updateOne({ _id: supplierId }, { $set: { phone: '21698765432' } })

    const smsMock = jest.spyOn(smsHelper, 'sendSms').mockResolvedValue({})

    const res = await request(app)
      .post('/api/insights/actions/sms')
      .set('Cookie', [buildCookie(adminToken)])
      .send({
        agencyIds: [supplierId],
        message: 'Short notice',
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.succeeded).toHaveLength(1)
    expect(res.body.failed).toHaveLength(0)
    expect(smsMock).toHaveBeenCalledTimes(1)

    const note = await AgencyNote.findOne({ agency: new mongoose.Types.ObjectId(supplierId) })
    expect(note).toBeTruthy()
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Sms)
    expect(note?.summary).toContain('SMS sent')
  })

  it('blocks agencies and updates status with note', async () => {
    const supplierEmail = testHelper.GetRandomEmail()
    const supplierId = await testHelper.createSupplier(supplierEmail, 'Block Agency')
    createdSuppliers.push(supplierId)

    const res = await request(app)
      .post('/api/insights/actions/block')
      .set('Cookie', [buildCookie(adminToken)])
      .send({
        agencyIds: [supplierId],
        reason: 'Missing documentation',
        notifyByEmail: false,
        notifyBySms: false,
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.succeeded).toHaveLength(1)

    const supplier = await User.findById(supplierId)
    expect(supplier?.blacklisted).toBe(true)

    const note = await AgencyNote.findOne({ agency: new mongoose.Types.ObjectId(supplierId) })
    expect(note).toBeTruthy()
    expect(note?.type).toBe(bookcarsTypes.AgencyNoteType.Block)
    expect(note?.details).toContain('Missing documentation')
  })

  it('adds manual notes and fetches history', async () => {
    const supplierEmail = testHelper.GetRandomEmail()
    const supplierId = await testHelper.createSupplier(supplierEmail, 'Notes Agency')
    createdSuppliers.push(supplierId)

    const res = await request(app)
      .post('/api/insights/actions/note')
      .set('Cookie', [buildCookie(adminToken)])
      .send({
        agencyIds: [supplierId],
        note: 'Manual follow-up completed',
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.succeeded).toHaveLength(1)

    const listRes = await request(app)
      .get(`/api/insights/notes/${supplierId}`)
      .set('Cookie', [buildCookie(adminToken)])

    expect(listRes.statusCode).toBe(200)
    expect(listRes.body.notes).toHaveLength(1)
    expect(listRes.body.notes[0].summary).toContain('Manual note')
  })
})
