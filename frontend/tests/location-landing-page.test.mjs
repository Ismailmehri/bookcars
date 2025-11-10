import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentDist = path.join(distRoot, 'frontend/src/components/location')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentDist, relativePath)))

const {
  buildFaqSchema,
  buildOfferCatalogSchema,
  buildLocalBusinessSchema,
} = await loadModule('schema.js')

test('buildFaqSchema formats FAQ items into structured data', () => {
  const schema = buildFaqSchema([
    { question: 'Quelle durée ?', answer: '24h minimum.' },
    { question: 'Options ?', answer: 'GPS, siège bébé.' },
  ])

  assert.equal(schema['@type'], 'FAQPage')
  assert.equal(schema.mainEntity.length, 2)
  assert.equal(schema.mainEntity[0].acceptedAnswer.text, '24h minimum.')
})

test('buildOfferCatalogSchema builds offers for each vehicle category', () => {
  const schema = buildOfferCatalogSchema('Sousse', 'https://plany.tn/location', [
    { name: 'Mini', price: 50, description: 'Citadine compacte', features: [] },
    { name: 'SUV', price: 80, description: 'SUV familial', features: [] },
  ])

  assert.equal(schema['@type'], 'OfferCatalog')
  assert.equal(schema.itemListElement.length, 2)
  assert.equal(schema.itemListElement[1].price, '80')
  assert.equal(schema.itemListElement[1].name.includes('SUV'), true)
})

test('buildLocalBusinessSchema references canonical url and blog', () => {
  const schema = buildLocalBusinessSchema('Tunis', 'https://plany.tn/location', 'Description', 'https://blog.plany.tn')

  assert.equal(schema['@type'], 'LocalBusiness')
  assert.equal(schema.areaServed.name, 'Tunis')
  assert(schema.sameAs.includes('https://blog.plany.tn'))
})
