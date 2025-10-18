import 'dotenv/config'
import request from 'supertest'
import path from 'path'
import url from 'url'
import fs from 'node:fs/promises'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import app from '../src/app'
import * as env from '../src/config/env.config'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import AgencyDocument from '../src/models/AgencyDocument'
import AgencyDocumentVersion from '../src/models/AgencyDocumentVersion'
import User from '../src/models/User'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOC1 = 'avatar1.jpg'
const DOC1_PATH = path.join(__dirname, `./img/${DOC1}`)
const DOC2 = 'avatar2.png'
const DOC2_PATH = path.join(__dirname, `./img/${DOC2}`)

let SUPPLIER_ID: string
let SUPPLIER_EMAIL: string
let VERSION1_ID: string
let VERSION2_ID: string
let supplierToken: string
let adminToken: string
let connected = false

const signinAsSupplier = async (email: string) => {
  const payload = {
    email,
    password: testHelper.PASSWORD,
  }
  const res = await request(app)
    .post(`/api/sign-in/${bookcarsTypes.AppType.Backend}`)
    .send(payload)
  expect(res.statusCode).toBe(200)
  const cookies = res.headers['set-cookie'] as unknown as string[]
  expect(cookies.length).toBeGreaterThan(1)
  const token = testHelper.getToken(cookies[1])
  expect(token).toBeDefined()
  return token
}

beforeAll(async () => {
  testHelper.initializeLogger()
  connected = await databaseHelper.connect(env.DB_URI, false, false)
  if (connected) {
    await testHelper.initialize()
    const supplierName = testHelper.getSupplierName()
    SUPPLIER_EMAIL = `${supplierName}@test.bookcars.ma`
    SUPPLIER_ID = await testHelper.createSupplier(SUPPLIER_EMAIL, supplierName)
    supplierToken = await signinAsSupplier(SUPPLIER_EMAIL)
    adminToken = await testHelper.signinAsAdmin()
  } else {
    console.warn('Agency verification tests skipped: database connection failed')
  }
})

afterAll(async () => {
  if (connected && mongoose.connection.readyState) {
    await testHelper.close()
    await testHelper.deleteSupplier(SUPPLIER_ID)
    await AgencyDocument.deleteMany({ agency: SUPPLIER_ID })
    await AgencyDocumentVersion.deleteMany({ uploadedBy: SUPPLIER_ID })
    await fs.rm(path.join(env.CDN_AGENCY_DOCS, SUPPLIER_ID), { recursive: true, force: true })
    await databaseHelper.close()
  }
})

describe('Agency document upload and verification', () => {
  const testFn = connected ? it : it.skip
  testFn('should upload documents and verify agency after admin decisions', async () => {
    let res = await request(app)
      .post('/api/verification/upload')
      .set('Cookie', [`${env.X_ACCESS_TOKEN}=${supplierToken};`])
      .field('docType', bookcarsTypes.AgencyDocumentType.RC)
      .field('note', 'rc document')
      .attach('file', DOC1_PATH)
    expect(res.statusCode).toBe(201)
    expect(res.body.status).toBe(bookcarsTypes.AgencyDocumentStatus.EN_REVUE)
    VERSION1_ID = res.body._id

    res = await request(app)
      .post('/api/verification/upload')
      .set('Cookie', [`${env.X_ACCESS_TOKEN}=${supplierToken};`])
      .field('docType', bookcarsTypes.AgencyDocumentType.MATRICULE_FISCAL)
      .field('note', 'mf document')
      .attach('file', DOC2_PATH)
    expect(res.statusCode).toBe(201)
    expect(res.body.status).toBe(bookcarsTypes.AgencyDocumentStatus.EN_REVUE)
    VERSION2_ID = res.body._id

    res = await request(app)
      .post(`/api/admin/verification/${VERSION1_ID}/decision`)
      .set('Cookie', [`${env.X_ACCESS_TOKEN}=${adminToken};`])
      .send({ status: bookcarsTypes.AgencyDocumentStatus.ACCEPTE, comment: 'ok' })
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe(bookcarsTypes.AgencyDocumentStatus.ACCEPTE)
    let supplier = await User.findById(SUPPLIER_ID)
    expect(supplier?.agencyVerified).toBeFalsy()

    res = await request(app)
      .post(`/api/admin/verification/${VERSION2_ID}/decision`)
      .set('Cookie', [`${env.X_ACCESS_TOKEN}=${adminToken};`])
      .send({ status: bookcarsTypes.AgencyDocumentStatus.ACCEPTE, comment: 'ok' })
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe(bookcarsTypes.AgencyDocumentStatus.ACCEPTE)
    supplier = await User.findById(SUPPLIER_ID)
    expect(supplier?.agencyVerified).toBe(true)
  })
})
