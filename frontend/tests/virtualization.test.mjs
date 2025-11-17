import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src')

const loadModule = async () => import(pathToFileURL(path.join(distRoot, 'common/virtualization.js')))

const { shouldVirtualizeList, getVirtualizedItemSize } = await loadModule()

test('virtualizes when list exceeds desktop threshold', () => {
  assert.equal(shouldVirtualizeList(15, { isMobile: false, threshold: 12 }), true)
})

test('keeps small desktop lists non-virtualized', () => {
  assert.equal(shouldVirtualizeList(5, { isMobile: false, threshold: 12 }), false)
})

test('mobile uses lower threshold', () => {
  assert.equal(shouldVirtualizeList(6, { isMobile: true, threshold: 12 }), true)
})

test('returns correct item size per device', () => {
  assert.equal(getVirtualizedItemSize(true) < getVirtualizedItemSize(false), true)
})
