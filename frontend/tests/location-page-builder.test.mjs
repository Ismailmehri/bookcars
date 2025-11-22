import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist/frontend/src/pages')
const builderPath = path.join(distRoot, 'locationPageBuilder.js')

const builderModule = await import(pathToFileURL(builderPath))

const { resolveLocationPage, buildLocationSeo, createLocationPage } = builderModule

const tunisSlug = '/location-voiture-pas-cher-a-tunis'

test('resolveLocationPage returns hydrated props and trimmed meta description', () => {
  const { pageProps, metaDescription } = resolveLocationPage('tunis')

  assert.equal(pageProps.slug, tunisSlug)
  assert.equal(pageProps.city, 'Tunis')
  assert.ok(metaDescription.length <= 250, 'meta description should be trimmed for SEO')
  assert.ok(metaDescription.includes('location voiture Tunis'))
})

test('buildLocationSeo creates canonical URL and keyword list', () => {
  const seo = buildLocationSeo('tunis')

  assert.equal(seo.canonical, `https://plany.tn${tunisSlug}`)
  assert.equal(seo.title, 'Location voiture pas cher à Tunis | Plany')
  assert.ok(Array.isArray(seo.keywords))
  assert.ok(seo.keywords.includes('location voiture Tunis'))
})

test('createLocationPage returns a React component with a displayName', () => {
  const Component = createLocationPage('tunis')

  assert.equal(typeof Component, 'function')
  assert.ok(Component.displayName?.includes('LocationPage'))
})
