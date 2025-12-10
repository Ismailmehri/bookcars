import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/common')

const pageSeoModule = await import(pathToFileURL(path.join(distRoot, 'pageSeo.js')))

const { getStaticPageSeo, getCheckoutSessionSeo } = pageSeoModule

test('static page SEO entries include trimmed descriptions and noindex', () => {
  const bookingSeo = getStaticPageSeo('booking')

  assert.equal(bookingSeo.title, 'Créer une réservation | Plany.tn')
  assert.equal(bookingSeo.canonical, 'https://plany.tn/booking')
  assert.equal(bookingSeo.robots, 'noindex,nofollow')
  assert.ok(bookingSeo.description.includes('réservation de voiture'), 'description should mention location context')
  assert.ok(bookingSeo.description.length <= 160, 'description should be trimmed for SEO')
})

test('checkout session SEO returns session-aware canonical url', () => {
  const seoWithId = getCheckoutSessionSeo('sess_123')

  assert.equal(seoWithId.canonical, 'https://plany.tn/checkout-session/sess_123')
  assert.equal(seoWithId.robots, 'noindex,nofollow')
  assert.ok(seoWithId.description.includes('paiement'))
})
