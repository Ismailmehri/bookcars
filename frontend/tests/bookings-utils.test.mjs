import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')

const loadModule = async (filePath) => import(pathToFileURL(path.join(distRoot, filePath)))

const { computeSupplierState, shouldShowFilters } = await loadModule('bookings.utils.js')

test('computeSupplierState prioritizes loading then error then empty', () => {
  assert.equal(computeSupplierState(true, false, []), 'loading')
  assert.equal(computeSupplierState(false, true, [{ _id: '1' }]), 'error')
  assert.equal(computeSupplierState(false, false, []), 'empty')
  assert.equal(computeSupplierState(false, false, [{ _id: '1' }]), 'ready')
})

test('shouldShowFilters returns boolean based on user presence', () => {
  assert.equal(shouldShowFilters(undefined), false)
  assert.equal(shouldShowFilters(null), false)
  assert.equal(shouldShowFilters({ _id: 'user-1' }), true)
})
