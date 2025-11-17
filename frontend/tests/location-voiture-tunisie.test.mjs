import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const pagePath = path.join(distRoot, 'frontend/src/pages/LocationVoitureTunisie.js')

const pageModule = await import(pathToFileURL(pagePath))

const expectedTitle = 'Location voiture Tunisie | Comparateur d’agences | Plany.tn'

test('LocationVoitureTunisie exports metadata and component', () => {
  assert.equal(typeof pageModule.default, 'function')
  assert.equal(pageModule.metaConfig.title, expectedTitle)
  assert.equal(pageModule.metaConfig.canonical, 'https://plany.tn/location-voiture-tunisie')
  assert.equal(typeof pageModule.metaConfig.description, 'string')
  assert(pageModule.metaConfig.description.length > 50)
})

test('LocationVoitureTunisie FAQ schema mirrors declared questions', () => {
  assert(Array.isArray(pageModule.locationVoitureTunisieFaqs))
  assert(pageModule.locationVoitureTunisieFaqs.length >= 5)

  const faqQuestions = pageModule.locationVoitureTunisieFaqs.map((faq) => faq.question)
  assert(faqQuestions.includes('Faut-il une carte de crédit pour louer une voiture en Tunisie ?'))
  assert(faqQuestions.includes('Est-ce que la location inclut une assurance ?'))

  const schemaQuestions = pageModule.faqJsonLd.mainEntity.map((entry) => entry.name)
  assert.deepEqual(schemaQuestions.sort(), faqQuestions.sort())
})
