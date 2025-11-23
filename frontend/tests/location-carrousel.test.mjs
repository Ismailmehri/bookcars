import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distRoot = path.resolve(__dirname, '../.test-dist')
const componentDist = path.join(distRoot, 'frontend/src/components')

globalThis.__TEST_IMPORT_META_ENV = {}
globalThis.window = { innerWidth: 1200 }
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

const loadModule = async (relativePath) => import(pathToFileURL(path.join(componentDist, relativePath)))

const { default: LocationCarrousel } = await loadModule('LocationCarrousel.js')

test('LocationCarrousel renders empty state', () => {
  const html = renderToString(React.createElement(LocationCarrousel, { locations: [] }))

  assert.match(html, /location-carousel__status/)
})

test('LocationCarrousel renders slides', () => {
  const locations = [
    { _id: 'loc', name: 'Tunis', parkingSpots: [{}, {}], image: 'img.png' },
  ]

  const html = renderToString(React.createElement(LocationCarrousel, { locations }))

  assert.ok(html.includes('Tunis'))
  assert.match(html, /location-carousel__card/)
})
