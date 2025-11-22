import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')

const loadModule = async (filePath) => import(pathToFileURL(path.join(distRoot, filePath)))

const { filterSuppliersWithAvatars, filterCountriesWithLocations } = await loadModule('home.utils.js')

test('filterSuppliersWithAvatars keeps entries with usable avatars', () => {
  const suppliers = [
    { _id: '1', avatar: 'logo.png' },
    { _id: '2', avatar: 'no-image.png' },
    { _id: '3', avatar: '' },
    { _id: '4', avatar: 'https://cdn/logo.svg' },
  ]

  const result = filterSuppliersWithAvatars(suppliers)

  assert.equal(result.length, 2)
  assert.deepEqual(result.map((supplier) => supplier._id), ['1', '4'])
})

test('filterCountriesWithLocations respects minimum location count', () => {
  const countries = [
    { _id: 'fr', name: 'France', locations: [{ _id: 'p1' }] },
    { _id: 'tn', name: 'Tunisia', locations: [{ _id: 'p2' }, { _id: 'p3' }] },
    { _id: 'es', name: 'Spain', locations: [] },
    { _id: 'de', name: 'Germany' },
  ]

  const result = filterCountriesWithLocations(countries, 2)

  assert.equal(result.length, 1)
  assert.equal(result[0]._id, 'tn')
})
