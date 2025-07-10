import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import app from '../src/app'
import * as env from '../src/config/env.config'
import Subscription from '../src/models/Subscription'

let SUPPLIER_ID: string
let SUPPLIER_EMAIL: string

const signin = async (email: string) => {
  const payload: bookcarsTypes.SignInPayload = {
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

  const res = await databaseHelper.connect(env.DB_URI, false, false)
  expect(res).toBeTruthy()
  await testHelper.initialize()

  const supplierName = testHelper.getSupplierName()
  SUPPLIER_EMAIL = `${supplierName}@test.bookcars.ma`
  SUPPLIER_ID = await testHelper.createSupplier(SUPPLIER_EMAIL, supplierName)
})

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await testHelper.deleteSupplier(SUPPLIER_ID)
    await Subscription.deleteMany({ supplier: SUPPLIER_ID })
    await testHelper.close()
    await databaseHelper.close()
  }
})

describe('GET /api/my-subscription', () => {
  it('should return 403 when no token provided', async () => {
    const res = await request(app).get('/api/my-subscription')
    expect(res.statusCode).toBe(403)
  })

  it('should return 204 when no subscription', async () => {
    const token = await signin(SUPPLIER_EMAIL)
    const res = await request(app)
      .get('/api/my-subscription')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)
    await testHelper.signout(token)
  })

  it('should return the latest subscription', async () => {
    const sub1 = new Subscription({
      supplier: SUPPLIER_ID,
      plan: bookcarsTypes.SubscriptionPlan.Basic,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-02-01'),
    })
    await sub1.save()

    const sub2 = new Subscription({
      supplier: SUPPLIER_ID,
      plan: bookcarsTypes.SubscriptionPlan.Premium,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-03-01'),
    })
    await sub2.save()

    const token = await signin(SUPPLIER_EMAIL)
    const res = await request(app)
      .get('/api/my-subscription')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.plan).toBe(bookcarsTypes.SubscriptionPlan.Premium)
    await testHelper.signout(token)
  })
})
