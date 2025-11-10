import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(distRoot, relativePath)))

const { default: locationDataSEO } = await loadModule('locationData_SEO.js')

const trackedCities = [
  'tunis',
  'sousse',
  'sfax',
  'nabeul',
  'monastir',
  'mahdia',
  'kairouan',
  'djerba',
  'ariana',
  'ben-arous',
]

test('SEO dataset provides enriched metadata for tracked cities', () => {
  trackedCities.forEach((cityKey) => {
    const entry = locationDataSEO[cityKey]
    assert.ok(entry, `missing dataset for ${cityKey}`)
    assert.ok(entry.metaDescription.length >= 200 && entry.metaDescription.length <= 260)
    assert.ok(entry.seoKeywords.principal.length >= 1)
    assert.ok(entry.seoKeywords.secondaires.length >= 1)
    assert.ok(entry.seoKeywords.semantiques.length >= 1)
    assert.ok(entry.faqItems.length >= 5)
    entry.nearbyDestinations.forEach((destination) => {
      assert.ok(destination.imageAlt && destination.imageAlt.length > 10)
    })
    const schemas = entry.jsonLd
    assert.ok(Array.isArray(schemas), 'jsonLd should be an array')
    assert.equal(schemas[0]['@type'], 'CarRental')
  })
})
