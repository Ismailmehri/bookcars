import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const commonDist = path.join(distRoot, 'common')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(commonDist, relativePath)))

const pricingModule = await loadModule('pricing.js')
const { normalizePrice, calculateDailyRate } = pricingModule

test('normalizePrice returns the original value for finite positives', () => {
  assert.equal(normalizePrice(120.75), 120.75)
})

test('normalizePrice clamps invalid values to zero', () => {
  assert.equal(normalizePrice(-45), 0)
  assert.equal(normalizePrice(Number.NaN), 0)
  assert.equal(normalizePrice(Number.POSITIVE_INFINITY), 0)
})

test('calculateDailyRate distributes the total across days', () => {
  assert.equal(calculateDailyRate(300, 3), 100)
})

test('calculateDailyRate enforces a minimum of one day', () => {
  assert.equal(calculateDailyRate(159, 0), 159)
})

test('calculateDailyRate returns zero when the total is invalid', () => {
  assert.equal(calculateDailyRate(Number.NaN, 5), 0)
})
