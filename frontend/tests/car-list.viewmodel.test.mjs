import { test } from 'node:test'
import assert from 'node:assert/strict'

const memoryStorage = new Map()
globalThis.localStorage = {
  getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
  setItem: (key, value) => memoryStorage.set(key, String(value)),
  removeItem: (key) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
}
globalThis.window = {
  location: {
    search: '',
  },
}
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentsDist = path.join(distRoot, 'frontend/src/components')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentsDist, relativePath)))

const viewModelModule = await loadModule('car-list.view-model.js')
const {
  resolveRentalWindow,
  buildStructuredProductData,
  buildSupplierDescription,
  getCheckoutPayload,
} = viewModelModule

const baseCar = {
  _id: 'car-1',
  name: 'Test Car',
  image: 'test.png',
  dailyPrice: 99,
  range: 'SUV',
  supplier: {
    fullName: 'Plany Agency',
    avatar: 'avatar.png',
    slug: 'plany-agency',
    score: 80,
  },
}

const basePricing = {
  rentalFrom: new Date('2025-01-01T00:00:00Z'),
  rentalTo: new Date('2025-01-05T00:00:00Z'),
  rentalDays: 4,
  dailyRate: 99,
  formattedDailyRate: '$99',
  priceSummary: '4 jours : $396',
  safeTotal: 396,
}

test('resolveRentalWindow defaults to a minimum of one day', () => {
  const { rentalFrom, rentalTo, rentalDays } = resolveRentalWindow()
  assert.ok(rentalFrom instanceof Date)
  assert.ok(rentalTo instanceof Date)
  assert.equal(rentalDays, 1)
})

test('buildStructuredProductData shapes schema.org product payload', () => {
  const product = buildStructuredProductData(baseCar)
  assert.equal(product['@type'], 'Product')
  assert.equal(product.name, baseCar.name)
  assert.equal(product.offers.price, baseCar.dailyPrice)
})

test('buildSupplierDescription injects supplier name', () => {
  const description = buildSupplierDescription(baseCar, 'fr')
  assert.ok(description?.includes(baseCar.supplier.fullName))
})

test('getCheckoutPayload maps checkout analytics payload', () => {
  const payload = getCheckoutPayload(baseCar, basePricing)
  assert.equal(payload.value, basePricing.safeTotal)
  assert.equal(payload.items[0].id, baseCar._id)
  assert.equal(payload.items[0].quantity, basePricing.rentalDays)
})
