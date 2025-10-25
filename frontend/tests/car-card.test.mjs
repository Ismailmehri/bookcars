import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const { transformScore, getSupplierInitials } = await loadModule('frontend/src/components/car-card.utils.js')

test('transformScore clamps invalid scores to zero', () => {
  assert.equal(transformScore(-10), 0)
  assert.equal(transformScore(0), 0)
  assert.equal(transformScore(120), 0)
})

test('transformScore converts percentage into five-star scale with rounding', () => {
  assert.equal(transformScore(50), 2.5)
  assert.equal(transformScore(95), 4.8)
})

test('getSupplierInitials builds compact initials from supplier name', () => {
  assert.equal(getSupplierInitials('Plany Cars'), 'PC')
  assert.equal(getSupplierInitials(' agence premium '), 'AP')
  assert.equal(getSupplierInitials('Mono'), 'M')
})

test('getSupplierInitials returns empty string for missing values', () => {
  assert.equal(getSupplierInitials(''), '')
  assert.equal(getSupplierInitials(), '')
})
