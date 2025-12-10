import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const filtersDist = path.join(distRoot, 'frontend/src/common')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(filtersDist, relativePath)))

const { normalizeSeatsFilter } = await loadModule('filters.js')

test('normalizeSeatsFilter preserves allowed seat options', () => {
  assert.equal(normalizeSeatsFilter(2), 2)
  assert.equal(normalizeSeatsFilter(4), 4)
  assert.equal(normalizeSeatsFilter(5), 5)
  assert.equal(normalizeSeatsFilter(9), 9)
  assert.equal(normalizeSeatsFilter(-1), -1)
})

test('normalizeSeatsFilter collapses oversized values into the 6+ bucket', () => {
  assert.equal(normalizeSeatsFilter(6), 6)
  assert.equal(normalizeSeatsFilter(7), 6)
})

test('normalizeSeatsFilter collapses 9+ into the dedicated bucket', () => {
  assert.equal(normalizeSeatsFilter(9), 9)
  assert.equal(normalizeSeatsFilter(12), 9)
})

test('normalizeSeatsFilter returns -1 for unexpected inputs', () => {
  assert.equal(normalizeSeatsFilter(3), -1)
  assert.equal(normalizeSeatsFilter(Number.NaN), -1)
})
