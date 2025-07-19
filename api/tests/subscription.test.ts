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

describe('POST /api/create-subscription', () => {
  it('should create a subscription with limits', async () => {
    const token = await signin(SUPPLIER_EMAIL)
    const payload: bookcarsTypes.CreateSubscriptionPayload = {
      supplier: SUPPLIER_ID,
      plan: bookcarsTypes.SubscriptionPlan.Basic,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-01'),
      resultsCars: 3,
      sponsoredCars: 1,
    }
    const res = await request(app)
      .post('/api/create-subscription')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    const sub = await Subscription.findOne({ supplier: SUPPLIER_ID, plan: bookcarsTypes.SubscriptionPlan.Basic }).lean()
    expect(sub?.resultsCars).toBe(3)
    expect(sub?.sponsoredCars).toBe(1)
    await testHelper.signout(token)
  })

  it('should update the current subscription when called twice', async () => {
    const first = await Subscription.findOne({ supplier: SUPPLIER_ID }).lean()
    expect(first).toBeTruthy()

    const token = await signin(SUPPLIER_EMAIL)
    const payload: bookcarsTypes.CreateSubscriptionPayload = {
      supplier: SUPPLIER_ID,
      plan: bookcarsTypes.SubscriptionPlan.Premium,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-01'),
      resultsCars: -1,
      sponsoredCars: -1,
    }
    const res = await request(app)
      .post('/api/create-subscription')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)

    const subs = await Subscription.find({ supplier: SUPPLIER_ID }).lean()
    expect(subs.length).toBe(1)
    expect(subs[0]._id.toString()).toBe(first!._id.toString())
    expect(subs[0].plan).toBe(bookcarsTypes.SubscriptionPlan.Premium)
    await testHelper.signout(token)
  })
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
      resultsCars: 3,
      sponsoredCars: 1,
    })
    await sub1.save()

    const sub2 = new Subscription({
      supplier: SUPPLIER_ID,
      plan: bookcarsTypes.SubscriptionPlan.Premium,
      period: bookcarsTypes.SubscriptionPeriod.Monthly,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-03-01'),
      resultsCars: -1,
      sponsoredCars: -1,
    })
    await sub2.save()

    const token = await signin(SUPPLIER_EMAIL)
    const res = await request(app)
      .get('/api/my-subscription')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.plan).toBe(bookcarsTypes.SubscriptionPlan.Premium)
    expect(res.body.resultsCars).toBe(-1)
    expect(res.body.sponsoredCars).toBe(-1)
    await testHelper.signout(token)
  })
})

describe('GET /api/subscriptions', () => {
  it('should deny access to non-admin users', async () => {
    const token = await signin(SUPPLIER_EMAIL)
    const res = await request(app)
      .get(`/api/subscriptions/1/10`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(403)
    await testHelper.signout(token)
  })

  it('should return subscriptions for admin', async () => {
    const token = await testHelper.signinAsAdmin()
    const res = await request(app)
      .get(`/api/subscriptions/1/10`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.resultData)).toBe(true)
    expect(res.body.resultData[0].supplier.password).toBeUndefined()
    await testHelper.signout(token)
  })
})

describe('POST /api/update-subscription', () => {
  it('should update a subscription when admin', async () => {
    const sub = await Subscription.findOne({ supplier: SUPPLIER_ID }).lean()
    expect(sub).toBeTruthy()
    const token = await testHelper.signinAsAdmin()
    const payload: bookcarsTypes.UpdateSubscriptionPayload = {
      _id: sub!._id.toString(),
      supplier: SUPPLIER_ID,
      plan: sub!.plan,
      period: sub!.period,
      startDate: sub!.startDate,
      endDate: sub!.endDate,
      resultsCars: 5,
      sponsoredCars: 2,
    }
    const res = await request(app)
      .post('/api/update-subscription')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    const updated = await Subscription.findById(sub!._id).lean()
    expect(updated?.resultsCars).toBe(5)
    expect(updated?.sponsoredCars).toBe(2)
    await testHelper.signout(token)
  })

  it('should deny update when not admin', async () => {
    const sub = await Subscription.findOne({ supplier: SUPPLIER_ID }).lean()
    const token = await signin(SUPPLIER_EMAIL)
    const payload: bookcarsTypes.UpdateSubscriptionPayload = {
      _id: sub!._id.toString(),
      supplier: SUPPLIER_ID,
      plan: sub!.plan,
      period: sub!.period,
      startDate: sub!.startDate,
      endDate: sub!.endDate,
      resultsCars: 6,
      sponsoredCars: 3,
    }
    const res = await request(app)
      .post('/api/update-subscription')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(403)
    await testHelper.signout(token)
  })
})

describe('GET /api/subscription/:id', () => {
  it('should return a subscription without password field', async () => {
    const sub = await Subscription.findOne({ supplier: SUPPLIER_ID }).lean()
    expect(sub).toBeTruthy()
    const token = await testHelper.signinAsAdmin()
    const res = await request(app)
      .get(`/api/subscription/${sub!._id.toString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    expect(res.body.supplier.password).toBeUndefined()
    await testHelper.signout(token)
  })
})
