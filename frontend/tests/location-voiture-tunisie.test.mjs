import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const pagePath = path.join(distRoot, 'frontend/src/pages/LocationVoitureTunisie.js')

const pageModule = await import(pathToFileURL(pagePath))

const expectedTitle = 'Location voiture Tunisie | Comparateur d’agences | Plany.tn'

test('LocationVoitureTunisie exports component and SEO data', () => {
  assert.equal(typeof pageModule.default, 'function')
  assert.ok(pageModule.locationVoitureTunisiePageData)

  const pageData = pageModule.locationVoitureTunisiePageData
  assert.equal(pageData.title, expectedTitle)
  assert.equal(pageData.slug, '/location-voiture-tunisie')
  assert.equal(typeof pageData.metaDescription, 'string')
  assert(pageData.metaDescription.length > 50)
  assert(Array.isArray(pageData.faqItems))
  assert(pageData.faqItems.length >= 5)
})

test('LocationVoitureTunisie FAQ content includes key questions', () => {
  const pageData = pageModule.locationVoitureTunisiePageData
  const faqQuestions = pageData.faqItems.map((faq) => faq.question)

  assert(faqQuestions.includes('Faut-il une carte de crédit pour louer une voiture en Tunisie ?'))
  assert(faqQuestions.includes('Est-ce que la location inclut une assurance ?'))

  const hasOneWayQuestion = faqQuestions.includes(
    'Puis-je récupérer la voiture à l’aéroport et la rendre dans une autre ville ?',
  )
  assert.ok(hasOneWayQuestion)
})
