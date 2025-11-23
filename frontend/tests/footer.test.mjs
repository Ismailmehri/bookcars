import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

globalThis.__TEST_IMPORT_META_ENV = globalThis.__TEST_IMPORT_META_ENV || {}
globalThis.localStorage = globalThis.localStorage || {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentsDist = path.join(distRoot, 'frontend/src/components')

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentsDist, relativePath)))

const { default: Footer } = await loadModule('Footer.js')

const sampleLocations = [
  { _id: '1', name: 'Tunis-Carthage', slug: 'tunis-carthage' },
  { _id: '2', name: 'Sousse', slug: 'sousse' },
]

test('Footer renders provided locations without extra wrappers', () => {
  const html = renderToString(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(Footer, { prefetchedLocations: sampleLocations })
    )
  )

  assert.equal((html.match(/footer__links/g) || []).length >= 1, true)
  assert.match(html, /tunis-carthage/)
  assert.match(html, /footer__payment/)
})

test('Footer renders loading placeholders when data is pending', () => {
  const html = renderToString(
    React.createElement(MemoryRouter, null, React.createElement(Footer, { prefetchedLocations: [] }))
  )

  assert.match(html, /footer__skeleton/)
})
