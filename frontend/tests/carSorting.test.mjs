import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const frontendSrcDist = path.join(distRoot, 'frontend/src')

const loadModule = async (filePath) => import(pathToFileURL(filePath))

const carSortingModule = await loadModule(path.join(frontendSrcDist, 'common/carSorting.js'))
const { sortCars, __testing__ } = carSortingModule

const createCar = (overrides = {}) => ({
  _id: overrides._id ?? 'car',
  name: overrides.name ?? 'Car',
  dailyPrice: overrides.dailyPrice ?? 50,
  discountedDailyPrice: overrides.discountedDailyPrice ?? null,
  supplier: overrides.supplier ?? { score: 50, fullName: 'Agency' },
  rating: overrides.rating,
})

test('sortCars orders by ascending price when requested', () => {
  const cars = [
    createCar({ _id: '1', dailyPrice: 50 }),
    createCar({ _id: '2', dailyPrice: 30, discountedDailyPrice: 25 }),
    createCar({ _id: '3', dailyPrice: 10 }),
  ]

  const sorted = sortCars(cars, 'priceAsc').map((car) => car._id)
  assert.deepEqual(sorted, ['3', '2', '1'])
})

test('sortCars orders by descending price', () => {
  const cars = [
    createCar({ _id: '1', dailyPrice: 50 }),
    createCar({ _id: '2', dailyPrice: 30, discountedDailyPrice: 25 }),
    createCar({ _id: '3', dailyPrice: 10 }),
  ]

  const sorted = sortCars(cars, 'priceDesc').map((car) => car._id)
  assert.deepEqual(sorted, ['1', '2', '3'])
})

test('sortCars prefers rating when requested', () => {
  const cars = [
    createCar({ _id: '1', rating: 4.9, supplier: { score: 20 } }),
    createCar({ _id: '2', rating: 2, supplier: { score: 90 } }),
    createCar({ _id: '3', supplier: { score: 95 } }),
  ]

  const sorted = sortCars(cars, 'rating').map((car) => car._id)
  assert.deepEqual(sorted, ['1', '3', '2'])
})

test('getDailyPrice returns discounted price when available', () => {
  const price = __testing__.getDailyPrice(createCar({ dailyPrice: 50, discountedDailyPrice: 30 }))
  assert.equal(price, 30)
})

test('getRatingScore falls back to supplier score', () => {
  const score = __testing__.getRatingScore(createCar({ rating: undefined, supplier: { score: 80 } }))
  assert.equal(score, 4)
})
