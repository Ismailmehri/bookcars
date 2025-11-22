import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/components')
const loadModule = async (filePath) => import(pathToFileURL(path.join(distRoot, filePath)))

const { buildRangeLabel, getNotificationsState } = await loadModule('notification-list.utils.js')

describe('notification list utils', () => {
  it('returns correct state order', () => {
    assert.equal(getNotificationsState(true, 0, false), 'loading')
    assert.equal(getNotificationsState(false, 3, true), 'error')
    assert.equal(getNotificationsState(false, 0, false), 'empty')
    assert.equal(getNotificationsState(false, 2, false), 'ready')
  })

  it('builds range labels safely', () => {
    assert.equal(buildRangeLabel(1, 20, 10, 10), '1-10')
    assert.equal(buildRangeLabel(2, 20, 10, 10), '11-20')
    assert.equal(buildRangeLabel(1, 0, 10, 0), '0-0')
    assert.equal(buildRangeLabel(3, -1, 10, 5), '21-30')
  })
})
